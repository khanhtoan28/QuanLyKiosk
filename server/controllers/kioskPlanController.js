// controllers/kioskPlanController.js
import KioskPlan from "../models/KioskPlan.js";
import parseExcelFile from "../utils/excelParser.js";

/**
 * Convert Excel serial date or string date -> ISO `YYYY-MM-DD`
 * - Excel serial: tính từ 1899-12-30 (đã xử lý leap-year bug)
 * - String: thử parse dd/MM/yyyy hoặc các format JS nhận
 */
const toISODate = (value) => {
  if (!value && value !== 0) return ""; // giữ trống nếu không có
  // Nếu là số (Excel serial date)
  if (typeof value === "number" && !isNaN(value)) {
    const base = Date.UTC(1899, 11, 30); // 1899-12-30
    const ms = base + value * 24 * 60 * 60 * 1000;
    const d = new Date(ms);
    return d.toISOString().slice(0, 10); // YYYY-MM-DD
  }
  // Nếu là string dd/MM/yyyy
  if (typeof value === "string") {
    const v = value.trim();
    // dd/MM/yyyy
    const m = v.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
    if (m) {
      const [_, dd, mm, yyyy] = m;
      const d = new Date(Date.UTC(Number(yyyy), Number(mm) - 1, Number(dd)));
      if (!isNaN(d.getTime())) return d.toISOString().slice(0, 10);
    }
    // Thử parse mặc định
    const d2 = new Date(v);
    if (!isNaN(d2.getTime())) return d2.toISOString().slice(0, 10);
  }
  return ""; // nếu không parse được thì để rỗng
};

// Chuẩn hoá ngày trong body trước khi lưu/cập nhật
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
    const rows = await parseExcelFile(req.file.path);
    // Map đúng header -> field của model và convert ngày
    const mapped = rows.map((r) => ({
      stt: r["STT"] ?? r.stt ?? "",
      hospitalName: r["Tên bệnh viện"] ?? r.hospitalName ?? "",
      lastNote: r["Ghi chú làm việc gần nhất"] ?? r.lastNote ?? "",
      additionalRequest:
        r["Yêu cầu thêm của bệnh viện"] ?? r.additionalRequest ?? "",
      requestDate: toISODate(r["Ngày phát sinh yêu cầu"] ?? r.requestDate),
      deadline: toISODate(r["Deadline"] ?? r.deadline),
      deliveryDate: toISODate(r["Ngày chuyển nghiệm thu"] ?? r.deliveryDate),
      quantity: r["Số lượng"] ?? r.quantity ?? "",
      cccdReaderType: r["Loại đầu đọc CCCD"] ?? r.cccdReaderType ?? "",
      deviceType: r["Loại thiết bị"] ?? r.deviceType ?? "",
      priorityLevel: r["Mức độ ưu tiên"] ?? r.priorityLevel ?? "",
      personInCharge: r["Người phụ trách"] ?? r.personInCharge ?? "",
      devStatus:
        r["Trạng thái làm việc với viện - dev"] ?? r.devStatus ?? "",
      requestStatus: r["Trạng thái xử lý yêu cầu"] ?? r.requestStatus ?? "",
      handler: r["Người xử lý"] ?? r.handler ?? "",
      his: r["His"] ?? r.his ?? "",
      urlPort: r["Url port"] ?? r.urlPort ?? "",
      bhxhAccount: r["Tài khoản check BHXH"] ?? r.bhxhAccount ?? "",
    }));

    const created = await KioskPlan.insertMany(mapped);
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
