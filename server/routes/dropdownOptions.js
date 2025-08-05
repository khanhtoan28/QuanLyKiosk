// routes/dropdownOptions.js
import express from "express";
import DropdownOption from "../models/DropdownOption.js"; // ✅ import model

const router = express.Router();

const displayNames = {
  cccdReaderType: "Loại đầu đọc CCCD",
  deviceType: "Loại thiết bị",
  priorityLevel: "Mức độ ưu tiên",
  hopStatus: "Trạng thái làm việc với bệnh viện",
  devStatus: "Trạng thái làm việc với dev",
  requestStatus: "Trạng thái xử lý yêu cầu",
};

// GET dropdown options
router.get("/", async (req, res) => {
  let existing = await DropdownOption.findOne();
  if (!existing) {
    existing = await DropdownOption.create({
      options: {
        cccdReaderType: ["ComQ", "AIOT"],
        deviceType: ["27inch", "32inch"],
        priorityLevel: [
          "Bình thường (1 tuần - 3 tuần)",
          "Gấp (2 - 3 ngày)",
          "Hỏa tốc (Trong ngày)",
        ],
        hopStatus: ["Chưa tích hợp", "Đã tích hợp", "Chuyển nghiệm thu", "Hủy yêu cầu", "Đã nghiệm thu"],
        devStatus: ["Chờ dev build update", "Test thông api & chuyển dev"],
        requestStatus: ["Chưa xử lý", "Đã xử lý", "Đã xử lý xong", "Hủy yêu cầu"],
      },
    });
  }

  res.json(existing.options);
});

// PUT update dropdown options
router.put("/", async (req, res) => {
  const { options } = req.body;

  console.log("📥 options nhận được:", JSON.stringify(options, null, 2)); // ← thêm dòng này

  if (!options || typeof options !== "object") {
    return res.status(400).json({ error: "Thiếu hoặc sai cấu trúc 'options'" });
  }

  let existing = await DropdownOption.findOne();
  if (!existing) {
    existing = await DropdownOption.create({ options });
  } else {
    existing.options = options;
    await existing.save();
  }

  res.json({ message: "✅ Lưu thành công", options: existing.options });
});



export default router;