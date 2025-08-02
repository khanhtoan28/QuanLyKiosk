import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

transporter.sendMail({
  from: process.env.EMAIL_USER,
  to: "toanbuikhanh04@gmail.com", // sửa lại thành mail của bạn
  subject: "Test mail từ Node.js",
  html: "<p>Xin chào! Đây là email test.</p>",
})
.then(() => {
  console.log("✅ Gửi thành công");
})
.catch((err) => {
  console.error("❌ Gửi thất bại:", err.response || err.message || err);
});
