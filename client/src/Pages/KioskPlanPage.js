// src/Pages/KioskPlanPage.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import {
  getAllPlans,
  deletePlan,
  importExcel,
  createPlan,
} from "../services/kioskPlanApi";
import KioskPlanTable from "../Components/KioskPlanTable";
import ImportExcelButton from "../Components/ImportExcelButton";

/* ---------------------- CreatePlanForm (inline) ---------------------- */
const CreatePlanForm = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    hospitalName: "",
    quantity: "",
    readerType: "",
    deviceType: "",
    responsiblePerson: "",
    priority: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await onSubmit(formData);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-4 p-4 border rounded bg-gray-50 space-y-2"
    >
      <div className="flex flex-wrap gap-4">
        <input
          type="text"
          name="hospitalName"
          value={formData.hospitalName}
          onChange={handleChange}
          placeholder="Tên bệnh viện"
          className="border px-2 py-1 rounded w-1/3"
          required
        />
        <input
          type="number"
          name="quantity"
          value={formData.quantity}
          onChange={handleChange}
          placeholder="Số lượng"
          className="border px-2 py-1 rounded w-1/6"
        />
        <input
          type="text"
          name="readerType"
          value={formData.readerType}
          onChange={handleChange}
          placeholder="Loại đầu đọc CCCD"
          className="border px-2 py-1 rounded w-1/4"
        />
        <input
          type="text"
          name="deviceType"
          value={formData.deviceType}
          onChange={handleChange}
          placeholder="Loại thiết bị"
          className="border px-2 py-1 rounded w-1/4"
        />
        <input
          type="text"
          name="priority"
          value={formData.priority}
          onChange={handleChange}
          placeholder="Mức độ ưu tiên"
          className="border px-2 py-1 rounded w-1/4"
        />
        <input
          type="text"
          name="responsiblePerson"
          value={formData.responsiblePerson}
          onChange={handleChange}
          placeholder="Người phụ trách"
          className="border px-2 py-1 rounded w-1/4"
        />
      </div>
      <div className="flex gap-2 mt-2">
        <button
          type="submit"
          disabled={submitting}
          className={`px-4 py-1 rounded text-white ${
            submitting ? "bg-green-400 cursor-not-allowed" : "bg-green-500"
          }`}
        >
          {submitting ? "Đang lưu..." : "Lưu"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="bg-gray-300 px-4 py-1 rounded"
        >
          Huỷ
        </button>
      </div>
    </form>
  );
};
/* -------------------- End CreatePlanForm (inline) -------------------- */

const KioskPlanPage = () => {
  const [plans, setPlans] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const navigate = useNavigate();

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const res = await getAllPlans();
      const sorted = res.data.sort((a, b) => {
        const aStt = Number(a.stt) || 0;
        const bStt = Number(b.stt) || 0;
        return aStt - bStt;
      });
      setPlans(sorted);
    } catch (err) {
      Swal.fire("Lỗi", "Không tải được danh sách kế hoạch.", "error");
    } finally {
      setLoading(false);
    }
  };

  // Xoá: gọi API + cập nhật state + trả true/false cho Table để hiển thị thông báo
  const handleDelete = async (id) => {
    try {
      await deletePlan(id);
      setPlans((prev) => prev.filter((p) => p._id !== id));
      return true; // Table sẽ hiển thị "Đã xoá!"
    } catch (err) {
      Swal.fire("Lỗi", "Xoá thất bại. Vui lòng thử lại.", "error");
      return false;
    }
  };

  const handleFileUpload = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    try {
      setImporting(true);
      await importExcel(formData);
      await fetchPlans();
      Swal.fire("Thành công", "Import Excel thành công.", "success");
    } catch (err) {
      Swal.fire("Lỗi", "Import Excel thất bại.", "error");
    } finally {
      setImporting(false);
    }
  };

  const handleCreateNew = async (form) => {
    try {
      await createPlan({
        hospitalName: form.hospitalName,
        quantity: form.quantity,
        cccdReaderType: form.readerType,
        deviceType: form.deviceType,
        priorityLevel: form.priority,
        personInCharge: form.responsiblePerson,
      });
      setShowCreateForm(false);
      await fetchPlans();
      Swal.fire("Thành công", "Đã tạo kế hoạch mới.", "success");
    } catch (err) {
      Swal.fire("Lỗi", "Tạo kế hoạch thất bại. Vui lòng thử lại.", "error");
    }
  };

  const handleView = (plan) => {
    navigate(`/kiosk-plans/${plan._id}`, { state: { plan } });
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  return (
    <div className="p-6 text-gray-800">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Quản lý kế hoạch Kiosk</h2>
        {loading && <span className="text-sm text-gray-500">Đang tải...</span>}
      </div>

      {/* Import Excel */}
      <div className="mb-4">
        <ImportExcelButton onFileSelect={handleFileUpload} disabled={importing} />
        {importing && (
          <span className="ml-2 text-sm text-gray-500">Đang import...</span>
        )}
      </div>

      {/* Tạo mới */}
      <button
        onClick={() => setShowCreateForm(true)}
        className="mb-4 bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-60"
        disabled={loading || importing}
      >
        ➕ Tạo mới kế hoạch
      </button>

      {showCreateForm && (
        <CreatePlanForm
          onSubmit={handleCreateNew}
          onCancel={() => setShowCreateForm(false)}
        />
      )}

      {/* Bảng kế hoạch */}
      <KioskPlanTable
        data={plans}
        onDelete={handleDelete}
        onEdit={(plan) => console.log("Edit:", plan)} // Sau này có thể mở form edit
        onView={handleView}
      />
    </div>
  );
};

export default KioskPlanPage;
