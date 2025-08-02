import express from "express";
import multer from "multer";
import xlsx from "xlsx";
import { importExcel } from "../controllers/kioskPlanController.js";

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
router.post("/import", upload.single("file"), importExcel);

export default router;