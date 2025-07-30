import KioskPlan from "../models/KioskPlan.js";
import parseExcelFile from "../utils/excelParser.js";

export const getAllPlans = async (req, res) => {
  const plans = await KioskPlan.find().sort({ createdAt: -1 });
  res.json(plans);
};

export const createPlan = async (req, res) => {
  const newPlan = new KioskPlan(req.body);
  await newPlan.save();
  res.status(201).json(newPlan);
};

export const updatePlan = async (req, res) => {
  const updated = await KioskPlan.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
};

export const deletePlan = async (req, res) => {
  await KioskPlan.findByIdAndDelete(req.params.id);
  res.status(204).end();
};

export const importExcel = async (req, res) => {
  try {
    const data = await parseExcelFile(req.file.path);
    const created = await KioskPlan.insertMany(data);
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
