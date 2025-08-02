import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/register.js";
import upload from '../middleware/upload.js';

const router = express.Router();

// Register
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "Thiếu thông tin bắt buộc" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "Email đã được sử dụng" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword, role });
    await newUser.save();

    return res.status(201).json({ message: "Đăng ký thành công" });
  } catch (error) {
    console.error("❌ Lỗi backend:", error);
    return res.status(500).json({ message: "Lỗi server nội bộ" });
  }
});

// Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Email không tồn tại" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Sai mật khẩu" });
    }

    const token = jwt.sign({ id: user._id }, "secret_key", { expiresIn: "1h" });

    return res.status(200).json({
      message: "Đăng nhập thành công",
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (err) {
    console.error("Lỗi login:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
});

// Get all users
// GET /api/users?email=abc@gmail.com
router.get("/users", async (req, res) => {
  const email = req.query.email;
  try {
    if (!email) {
      return res.status(400).json({ success: false, message: "Thiếu email" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "Không tìm thấy người dùng" });
    }

    res.status(200).json({ success: true, data: user }); // ✅ Trả về 1 user object
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/users/:id
router.get("/users/:id", async (req, res) => {
  const { id } = req.params;

  if (id === "all") {
    const users = await User.find({});
    return res.json({ success: true, data: users });
  }

  try {
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ success: false, message: "Không tìm thấy user" });

    res.json({ success: true, data: user });
  } catch (err) {
    console.error("Lỗi lấy user theo ID:", err);
    res.status(400).json({ success: false, message: "ID không hợp lệ" });
  }
});


router.put('/users/:id', upload.single('avatar'), async (req, res) => {
  try {
    console.log('BODY:', req.body);
    console.log('FILE:', req.file);

    const { name, email } = req.body;
    const userId = req.params.id;

    const user = await User.findById(userId);
    if (!user) {
      console.log('User not found');
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    user.name = name || user.name;
    user.email = email || user.email;

    if (req.file) {
      user.avatar = `http://localhost:5000/uploads/${req.file.filename}`;
    }

    const updatedUser = await user.save();
    res.json(updatedUser);
  } catch (err) {
    console.error('Update error:', err);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});


export default router;
