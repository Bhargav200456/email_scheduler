import { emailQueue } from "../queues/email.queue";

export const scheduleEmail = async (
  emailId: string,
  scheduledAt: Date
) => {
  const delay = Math.max(
    0,
    scheduledAt.getTime() - Date.now()
  );

  const job = await emailQueue.add(
    "send-email",
    {
      emailId,
    },
    {
      jobId: emailId,
      delay,
      removeOnComplete: false,
      removeOnFail: false,
    }
  );

  return job;
};