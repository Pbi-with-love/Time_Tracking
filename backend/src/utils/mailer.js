import nodemailer from "nodemailer";
import dotenv from 'dotenv';

dotenv.config()

export const sendOTP = async (email, otp) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: "no-reply@timetracking.com",
    to: email,
    subject: "Your OTP Code",
    text: `Your OTP is: ${otp}`,
  });
};
