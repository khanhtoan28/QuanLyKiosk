// models/KioskPlan.js
import mongoose from "mongoose";

const kioskPlanSchema = new mongoose.Schema({
  stt: String, // để đồng bộ luôn
  hospitalName: {type: String, required: true},
  lastNote: String, 
  additionalRequest: String,
  requestDate: String,      
  deadline: String,         
  deliveryDate: String,    
  quantity: String,
  cccdReaderType: String,
  deviceType: String,
  priorityLevel: String,
  personInCharge: String,
  devStatus: String,
  requestStatus: String,
  handler: String,
  his: String,
  urlPort: String,
  bhxhAccount: String,
}, { timestamps: true, strict: true });

const KioskPlan = mongoose.model("KioskPlan", kioskPlanSchema);
export default KioskPlan;
