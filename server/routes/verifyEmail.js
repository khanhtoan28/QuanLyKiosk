import express from "express";
import User from "../models/register.js";
import nodemailer from "nodemailer";

const router = express.Router();

const OTP_STORE = {}; // { email: { code, expiresAt } }

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

router.post("/verify-email", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Thiếu email" });
  }

  // ✅ Check định dạng email hợp lệ
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: "Email không hợp lệ" });
  }

  const existing = await User.findOne({ email });
  if (existing) {
    return res.status(409).json({ message: "Email đã tồn tại trong hệ thống" });
  }

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  OTP_STORE[email] = { code, expiresAt: Date.now() + 5 * 60 * 1000 };

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Mã xác nhận thay đổi email",
    text: `Mã xác nhận của bạn là: ${code}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.json({ message: "Đã gửi mã xác nhận đến email." });
  } catch (err) {
    console.error("Lỗi gửi email:", err); // ✅ Log rõ lỗi ra console
    res.status(500).json({ message: "Lỗi gửi email" });
  }
});


router.post("/confirm-email-code", async (req, res) => {
  const { email, code } = req.body;
  const record = OTP_STORE[email];
  if (!record) return res.status(400).json({ message: "Không tìm thấy yêu cầu xác minh." });

  if (Date.now() > record.expiresAt) return res.status(410).json({ message: "Mã đã hết hạn." });

  if (record.code !== code) return res.status(401).json({ message: "Mã không đúng." });

  delete OTP_STORE[email];
  res.json({ success: true });
});

export default router;
