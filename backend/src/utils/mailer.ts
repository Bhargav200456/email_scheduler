import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.ETHEREAL_HOST || "smtp.ethereal.email",
  port: Number(process.env.ETHEREAL_PORT) || 587,
  secure: false,

  auth: {
    user: process.env.ETHEREAL_USER,
    pass: process.env.ETHEREAL_PASS,
  },
});

export default transporter;