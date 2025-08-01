import React, { useEffect, useState } from "react";
import { useLocation, useParams, Link } from "react-router-dom";
import Swal from "sweetalert2";
import { getPlanById, updatePlanById } from "../services/kioskPlanApi";

const formatDate = (value) => {
  if (!value) return "-";

  // Nếu là định dạng yyyy-mm-dd thì parse thủ công
  const m = String(value).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (m) {
    const [, yyyy, mm, dd] = m;
    return `${dd}/${mm}/${yyyy}`;
  }

  return value; // nếu không khớp thì giữ nguyên (vd: "chưa có", "n/a", ...)
};



const KioskPlanDetail = () => {
  const { id } = useParams();
  const location = useLocation();
  const [plan, setPlan] = useState(location.state?.plan || null);
  const [loading, setLoading] = useState(!location.state?.plan);
  const [editMode, setEditMode] = useState(false);
  const [editValues, setEditValues] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const res = await getPlanById(id);
      setPlan(res.data);
      setEditValues(res.data);
      setLoading(false);
    };
    if (!location.state?.plan) fetchData();
  },[id, location.state?.plan]);

  const handleToggleEdit = () => {
    setEditMode((prev) => !prev);
    setEditValues(plan);
  };

  const handleChange = (key, value) => {
    setEditValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    try {
      const res = await updatePlanById(plan._id, editValues);
      setPlan(res.data);
      setEditMode(false);
      Swal.fire("Thành công", "Đã lưu thay đổi", "success");
    } catch (err) {
      Swal.fire("Lỗi", "Không thể cập nhật dữ liệu", "error");
    }
  };

  if (loading) return <div className="p-4">Đang tải chi tiết...</div>;
  if (!plan) return <div className="p-4">Không tìm thấy kế hoạch.</div>;

  const fields = [
    { key: "hospitalName", label: "Tên bệnh viện" },
    { key: "lastNote", label: "Ghi chú làm việc gần nhất", multiline: true },
    { key: "additionalRequest", label: "Yêu cầu thêm của bệnh viện", multiline: true },
    { key: "requestDate", label: "Ngày phát sinh yêu cầu", isDate: true },
    { key: "deadline", label: "Deadline", isDate: true },
    { key: "deliveryDate", label: "Ngày chuyển nghiệm thu", isDate: true },
    { key: "quantity", label: "Số lượng" },
    { key: "cccdReaderType", label: "Loại đầu đọc CCCD" },
    { key: "deviceType", label: "Loại thiết bị" },
    { key: "priorityLevel", label: "Mức độ ưu tiên" },
    { key: "personInCharge", label: "Người phụ trách" },
    { key: "devStatus", label: "Trạng thái làm việc với viện - dev" },
    { key: "requestStatus", label: "Trạng thái xử lý yêu cầu" },
    { key: "handler", label: "Người xử lý" },
    { key: "his", label: "His" },
    { key: "urlPort", label: "Url port", multiline: true },
    { key: "bhxhAccount", label: "Tài khoản check BHXH" },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-lg font-semibold">Chi tiết kế hoạch kiosk</h1>
        <button
          onClick={handleToggleEdit}
          className="px-3 py-1 rounded text-sm bg-yellow-400 hover:bg-yellow-500 text-black"
        >
          {editMode ? "Huỷ chỉnh sửa" : "Sửa kế hoạch"}
        </button>
      </div>

      <div className="mb-4">
        <Link
          to="/kiosk-plans"
          className="px-3 py-1 rounded text-sm bg-blue-600 hover:bg-blue-700 text-white "
        >
          ← Quay lại danh sách
        </Link>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {fields.map((f) => (
          <div key={f.key} className="border rounded p-3">
            <div className="text-xs text-gray-500 mb-1">{f.label}</div>
            {editMode ? (
              f.isDate ? (
                <input
                  type="date"
                  className="w-full text-sm border rounded p-1"
                  value={editValues[f.key] || ""}
                  onChange={(e) => handleChange(f.key, e.target.value)}
                />
              ) : (
                <textarea
                  rows={f.multiline ? 3 : 1}
                  className="w-full text-sm border rounded p-1"
                  value={editValues[f.key] || ""}
                  onChange={(e) => handleChange(f.key, e.target.value)}
                />
              )
            ) : (
              <div
                className={
                  "text-sm " + (f.multiline ? "whitespace-pre-wrap break-words" : "")
                }
              >
                {f.isDate
                  ? formatDate(plan[f.key])
                  : plan[f.key] || "-"}
              </div>
            )}
          </div>
        ))}
      </div>

      {editMode && (
        <div className="mt-4 text-right">
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
          >
            Lưu thay đổi
          </button>
        </div>
      )}
    </div>
  );
};

export default KioskPlanDetail;
