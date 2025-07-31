import express from "express";
import multer from "multer";
import xlsx from "xlsx";
import KioskPlan from "../models/KioskPlan.js";
import {
  getAllPlans,
  createPlan,
  updatePlan,
  deletePlan,
  getPlanById,
} from "../controllers/kioskPlanController.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// CRUD routes
router.get("/", getAllPlans);
router.get("/:id", getPlanById);
router.post("/", createPlan);
router.put("/:id", updatePlan);
router.delete("/:id", deletePlan);

// ✅ Import từ Excel
router.post("/import", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Không có file được upload." });
    }

    const fileBuffer = req.file.buffer;
    const workbook = xlsx.read(fileBuffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = xlsx.utils.sheet_to_json(sheet, { defval: "" });

    const mapped = jsonData.map((row, index) => ({
      stt: String(index + 1),
      hospitalName: row["Tên bệnh viện"] || "",
      lastNote: row["Ghi chú làm việc gần nhất"] || "",
      additionalRequest: row["Yêu cầu thêm của bệnh viện"] || "",
      requestDate: row["Ngày phát sinh yêu cầu"] || "",
      deadline: row["Deadline"] || "",
      deliveryDate: row["Ngày chuyển nghiệm thu"] || "",
      quantity: String(row["Số lượng"] || ""),
      cccdReaderType: row["Loại đầu đọc CCCD"] || "",
      deviceType: row["Loại thiết bị"] || "",
      priorityLevel: row["Mức độ ưu tiên"] || "",
      personInCharge: row["Người phụ trách"] || "",
      devStatus: row["Trạng thái làm việc với viện - dev"] || "",
      requestStatus: row["Trạng thái xử lý yêu cầu"] || "",
      handler: row["Người xử lý"] || "",
      his: row["His"] || "",
      urlPort: row["Url port"] || "",
      bhxhAccount: row["Tài khoản check BHXH"] || "",
      excelOrder: index,
    }));

    await KioskPlan.insertMany(mapped);
    res.json({ message: "✅ Import successful", data: mapped });
  } catch (err) {
    console.error("❌ Import error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

export default router;

