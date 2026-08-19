import { Request, Response } from "express";
import { createEmail, getEmails } from "../services/email.service";

export const scheduleEmailController = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      sender,
      recipient,
      subject,
      body,
      scheduledAt,
    } = req.body;

    if (
      !sender ||
      !recipient ||
      !subject ||
      !body ||
      !scheduledAt
    ) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const scheduleDate = new Date(scheduledAt);

    if (Number.isNaN(scheduleDate.getTime())) {
      return res.status(400).json({
        message: "Invalid scheduled date",
      });
    }

    const email = await createEmail({
      sender,
      recipient,
      subject,
      body,
      scheduledAt: scheduleDate,
    });

    return res.status(201).json({
      message: "Email scheduled successfully",
      email,
    });
  } catch (error) {
    console.error("Error scheduling email:", error);

    return res.status(500).json({
      message: "Failed to schedule email",
    });
  }
};

export const getEmailsController = async (
  req: Request,
  res: Response
) => {
  try {
    const { status } = req.query;

    const emails = await getEmails(
      status ? String(status) : undefined
    );

    return res.status(200).json({
      emails,
    });
  } catch (error) {
    console.error("Error fetching emails:", error);

    return res.status(500).json({
      message: "Failed to fetch emails",
    });
  }
};