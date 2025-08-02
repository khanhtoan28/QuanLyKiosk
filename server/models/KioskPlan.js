// models/KioskPlan.js
import mongoose from "mongoose";

const kioskPlanSchema = new mongoose.Schema({
  stt: String,
  hospitalName: { type: String, required: true },
  lastNote: String,
  additionalRequest: String,
  requestDate: String,
  deadline: String,
  deliveryDate: String,
  quantity: String,
  cccdReaderType: String,
  deviceType: String,
  priorityLevel: String,
  personInCharge: {
    type: [String],
    default: [],
  },
  devStatus: String,
  hopStatus: String,
  requestStatus: String,
  handler: String,
  his: String,
  urlPort: String,
  bhxhAccount: String,
}, { timestamps: true, strict: true });

const KioskPlan = mongoose.model("KioskPlan", kioskPlanSchema);
export default KioskPlan;