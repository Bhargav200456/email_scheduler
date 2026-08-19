import { Worker } from "bullmq";

import redis from "../config/redis";
import prisma from "../config/database";
import transporter from "../utils/mailer";

import { reserveSendSlot } from "../services/rateLimit.service";
import { enqueueEmail } from "./email.queue";

import type { EmailJobData } from "./email.queue";

const worker = new Worker<EmailJobData>(
  "email-queue",

  async (job) => {
    const { emailId } = job.data;

    console.log(`Processing email job: ${emailId}`);

    const email = await prisma.email.findUnique({
      where: {
        id: emailId,
      },
    });

    if (!email) {
      throw new Error(`Email ${emailId} not found`);
    }

    /*
     * IDEMPOTENCY
     *
     * If the email has already been sent,
     * never send it again.
     */
    if (email.status === "SENT") {
      console.log(
        `Email ${emailId} was already sent`
      );

      return;
    }

    /*
     * RESERVE SEND SLOT
     *
     * Redis atomically checks:
     * - minimum delay
     * - sender hourly limit
     */
    const slot = await reserveSendSlot(
      email.sender
    );

    /*
     * RATE LIMIT / MINIMUM DELAY
     *
     * Instead of failing the job, create
     * another delayed BullMQ job.
     */
    if (!slot.allowed) {
      const delay = Math.max(
        slot.waitMilliseconds,
        1000
      );

      console.log(
        `Email ${emailId} delayed for ${delay}ms`
      );

      await enqueueEmail(
        emailId,
        delay
      );

      return;
    }

    /*
     * CLAIM THE EMAIL
     *
     * Multiple workers may see the same job,
     * but only one can change SCHEDULED/PENDING
     * into PROCESSING.
     */
    const claimed =
      await prisma.email.updateMany({
        where: {
          id: email.id,

          status: {
            in: [
              "PENDING",
              "SCHEDULED",
            ],
          },
        },

        data: {
          status: "PROCESSING",
        },
      });

    if (claimed.count === 0) {
      console.log(
        `Email ${emailId} was already claimed`
      );

      return;
    }

    try {
      /*
       * SEND THROUGH ETHEREAL
       */
      const info =
        await transporter.sendMail({
          from: email.sender,

          to: email.recipient,

          subject: email.subject,

          text: email.body,
        });

      /*
       * MARK AS SENT
       */
      await prisma.email.update({
        where: {
          id: email.id,
        },

        data: {
          status: "SENT",

          sentAt: new Date(),
        },
      });

      console.log(
        `Email ${emailId} sent successfully`
      );

      console.log(
        `Ethereal Message ID: ${info.messageId}`
      );

      /*
       * Ethereal provides a browser preview URL.
       */
      console.log(
        "Ethereal Preview:",
        `https://ethereal.email/message/${info.messageId}`
      );

    } catch (error) {

      /*
       * SMTP FAILURE
       *
       * Mark the email failed. BullMQ can
       * retry genuine failures according
       * to the queue configuration.
       */
      await prisma.email.update({
        where: {
          id: email.id,
        },

        data: {
          status: "FAILED",
        },
      });

      throw error;
    }
  },

  {
    connection: redis,

    concurrency:
      Number(
        process.env.WORKER_CONCURRENCY
      ) || 5,
  }
);

/*
 * Worker events
 */

worker.on("ready", () => {
  console.log(
    "Email worker is ready"
  );
});

worker.on("completed", (job) => {
  console.log(
    `Job completed: ${job.id}`
  );
});

worker.on("failed", (job, error) => {
  console.error(
    `Job failed: ${job?.id}`,
    error.message
  );
});

export default worker;