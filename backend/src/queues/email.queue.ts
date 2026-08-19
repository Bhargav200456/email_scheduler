import { Queue } from "bullmq";
import redis from "../config/redis";

export interface EmailJobData {
  emailId: string;
}

export const emailQueue = new Queue<EmailJobData>(
  "email-queue",
  {
    connection: redis,
  }
);

export const enqueueEmail = async (
  emailId: string,
  delay = 0
) => {
  return emailQueue.add(
    "send-email",
    {
      emailId,
    },
    {
      jobId:
        delay > 0
          ? `email-${emailId}-retry-${Date.now()}`
          : `email-${emailId}`,

      delay,

      attempts: 3,

      backoff: {
        type: "exponential",
        delay: 5000,
      },

      removeOnComplete: false,
      removeOnFail: false,
    }
  );
};