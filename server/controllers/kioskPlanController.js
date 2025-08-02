import KioskPlan from "../models/KioskPlan.js";
import parseExcelFile from "../utils/excelParser.js";

const toISODate = (value) => {
  if (!value && value !== 0) return "";

  if (typeof value === "number" && !isNaN(value)) {
    const utcMillis = Date.UTC(1899, 11, 30) + (value + 1) * 86400000;
    return new Date(utcMillis).toISOString().slice(0, 10); // yyyy-mm-dd

  }


  if (typeof value === "string") {
    const trimmed = value.trim();

    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;

    const m = trimmed.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
    if (m) {
      const [_, dd, mm, yyyy] = m;
      return `${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`;
    }

    const d = new Date(trimmed);
    if (!isNaN(d)) {
      const yyyy = d.getUTCFullYear();
      const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
      const dd = String(d.getUTCDate()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}`;
    }

    return trimmed;
  }

  return "";
};


const normalizePlanDates = (payload = {}) => {
  const out = { ...payload };
  if (payload.deadline !== undefined) out.deadline = toISODate(payload.deadline);
  if (payload.deliveryDate !== undefined)
    out.deliveryDate = toISODate(payload.deliveryDate);
  if (payload.requestDate !== undefined)
    out.requestDate = toISODate(payload.requestDate);
  return out;
};

export const getAllPlans = async (req, res) => {
  try {
    const plans = await KioskPlan.find().sort({ createdAt: -1 });
    res.json(plans);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getPlanById = async (req, res) => {
  try {
    const plan = await KioskPlan.findById(req.params.id);
    if (!plan) return res.status(404).json({ error: "Plan not found" });
    res.json(plan);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const createPlan = async (req, res) => {
  try {
    const payload = normalizePlanDates(req.body);
    const newPlan = new KioskPlan(payload);
    await newPlan.save();
    res.status(201).json(newPlan);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updatePlan = async (req, res) => {
  try {
    const payload = normalizePlanDates(req.body);
    const updated = await KioskPlan.findByIdAndUpdate(
      req.params.id,
      payload,
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deletePlan = async (req, res) => {
  try {
    await KioskPlan.findByIdAndDelete(req.params.id);
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const importExcel = async (req, res) => {
  try {
    const rawRows = await parseExcelFile(req.file.buffer);

    const mapped = rawRows.map((r, index) => ({
      stt: r["STT"] ?? r.stt ?? "",
      hospitalName: r["Tên bệnh viện"] ?? r.hospitalName ?? "",
      lastNote: r["Ghi chú làm việc gần nhất"] ?? r.lastNote ?? "",
      additionalRequest: r["Yêu cầu thêm của bệnh viện"] ?? r.additionalRequest ?? "",
      requestDate: toISODate(r["Ngày phát sinh yêu cầu"] ?? r.requestDate),
      deadline: toISODate(r["Deadline"] ?? r.deadline),
      deliveryDate: toISODate(r["Ngày chuyển nghiệm thu"] ?? r.deliveryDate),
      quantity: r["Số lượng"] ?? r.quantity ?? "",
      cccdReaderType: r["Loại đầu đọc CCCD"] ?? r.cccdReaderType ?? "",
      deviceType: r["Loại thiết bị"] ?? r.deviceType ?? "",
      priorityLevel: r["Mức độ ưu tiên"] ?? r.priorityLevel ?? "",
      personInCharge: r["Người phụ trách"] ?? r.personInCharge ?? "",
      devStatus: r["Trạng thái làm việc với dev"] ?? r.devStatus ?? "",
      hopStatus: r["Trạng thái làm việc với bệnh viện"] ?? r.hopStatus ?? "",
      requestStatus: r["Trạng thái xử lý yêu cầu"] ?? r.requestStatus ?? "",
      handler: r["Người xử lý"] ?? r.handler ?? "",
      his: r["His"] ?? r.his ?? "",
      urlPort: r["Url port"] ?? r.urlPort ?? "",
      bhxhAccount: r["Tài khoản check BHXH"] ?? r.bhxhAccount ?? "",
      excelOrder: index,
    }));

    const valid = mapped.filter(r => r.hospitalName && r.hospitalName.trim() !== "");
    const skipped = mapped.length - valid.length;

    if (valid.length === 0) {
      return res.status(400).json({ error: "❌ Tất cả các dòng đều thiếu 'Tên bệnh viện'." });
    }

    const created = await KioskPlan.insertMany(valid);
    res.status(201).json({
      message: `✅ Đã thêm ${created.length} dòng. ${skipped > 0 ? `❗️Bỏ qua ${skipped} dòng thiếu 'Tên bệnh viện'.` : ""}`,
    });
  } catch (err) {
    console.error("❌ Import error:", err.message);
    res.status(500).json({ error: err.message });
  }
};
