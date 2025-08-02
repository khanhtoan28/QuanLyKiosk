import express from "express";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // dùng SSL
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});


router.post("/send", async (req, res) => {
  const { to, subject, message, text } = req.body;

  const emailBody = message || text; // chấp nhận cả hai

  if (!to || !subject || !emailBody) {
    return res.status(400).json({ success: false, error: "Thiếu thông tin email" });
  }

  try {
    await transporter.sendMail({
      from: `"TAG Admin" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html: `<p>${emailBody}</p>`,
    });

    res.json({ success: true });
  } catch (err) {
    console.error("Lỗi gửi mail:", err);
    res.status(500).json({ success: false, error: "Không gửi được email" });
  }
});


export default router;
