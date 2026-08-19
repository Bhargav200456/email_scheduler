import prisma from "../config/database";
import { scheduleEmail } from "./scheduler.service";

interface CreateEmailData {
  sender: string;
  recipient: string;
  subject: string;
  body: string;
  scheduledAt: Date;
}

export const createEmail = async (
  data: CreateEmailData
) => {
  const email = await prisma.email.create({
    data: {
      sender: data.sender,
      recipient: data.recipient,
      subject: data.subject,
      body: data.body,
      scheduledAt: data.scheduledAt,
      status: "SCHEDULED",
    },
  });

  const job = await scheduleEmail(
    email.id,
    email.scheduledAt
  );

  await prisma.email.update({
    where: {
      id: email.id,
    },
    data: {
      jobId: job.id,
    },
  });

  return email;
};

export const getEmails = async (
  status?: string
) => {
  return await prisma.email.findMany({
    where: status
      ? {
          status: status as any,
        }
      : undefined,

    orderBy: {
      scheduledAt: "desc",
    },
  });
};