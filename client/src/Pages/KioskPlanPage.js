import React, { useEffect, useState } from "react";
import {
  getAllPlans,
  deletePlan,
  importExcel,
  createPlan,
} from "../services/kioskPlanApi";
import KioskPlanTable from "../Components/KioskPlanTable";
import ImportExcelButton from "../Components/ImportExcelButton";

// ✅ Form tạo mới kế hoạch
const CreatePlanForm = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    hospitalName: "",
    quantity: "",
    readerType: "",
    deviceType: "",
    responsiblePerson: "",
    priority: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSubmit(formData);
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
          className="bg-green-500 text-white px-4 py-1 rounded"
        >
          Lưu
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="bg-gray-300 px-4 py-1 rounded"
        >
          Huỷ
        </button>
      </div>
    </form>
  );
};

const KioskPlanPage = () => {
  const [plans, setPlans] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);

 const fetchPlans = async () => {
  const res = await getAllPlans();
  const sorted = res.data.sort((a, b) => {
    const aStt = Number(a.stt) || 0;
    const bStt = Number(b.stt) || 0;
    return aStt - bStt;
  });
  setPlans(sorted);
};


  const handleDelete = async (id) => {
    if (window.confirm("Xác nhận xoá bản ghi?")) {
      await deletePlan(id);
      fetchPlans();
    }
  };

  const handleFileUpload = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    await importExcel(formData);
    fetchPlans();
  };

  const handleCreateNew = async (form) => {
    await createPlan({
      hospitalName: form.hospitalName,
      quantity: form.quantity,
      cccdReaderType: form.readerType,
      deviceType: form.deviceType,
      priorityLevel: form.priority,
      personInCharge: form.responsiblePerson,
    });
    setShowCreateForm(false);
    fetchPlans();
  };


  useEffect(() => {
    fetchPlans();
  }, []);

  return (
    <div className="p-6 text-gray-800">
      <h2 className="text-xl font-semibold mb-4">Quản lý kế hoạch Kiosk</h2>

      <ImportExcelButton onFileSelect={handleFileUpload} />

      <button
        onClick={() => setShowCreateForm(true)}
        className="mb-4 bg-blue-500 text-white px-4 py-2 rounded"
      >
        ➕ Tạo mới kế hoạch
      </button>

      {showCreateForm && (
        <CreatePlanForm
          onSubmit={handleCreateNew}
          onCancel={() => setShowCreateForm(false)}
        />
      )}

      <KioskPlanTable
        data={plans}
        onDelete={handleDelete}
        onEdit={(data) => alert("TODO: Edit")}
      />
    </div>
  );
};

export default KioskPlanPage;
