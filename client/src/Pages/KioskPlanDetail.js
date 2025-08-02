import React, { useEffect, useState } from "react";
import { useLocation, useParams, Link } from "react-router-dom";
import Swal from "sweetalert2";
import { getPlanById, updatePlanById } from "../services/kioskPlanApi";
import axios from "axios";

const formatDate = (value) => {
  if (!value) return "-";
  const m = String(value).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (m) {
    const [, yyyy, mm, dd] = m;
    return `${dd}/${mm}/${yyyy}`;
  }
  return value;
};

const KioskPlanDetail = () => {
  const { id } = useParams();
  const location = useLocation();
  const [plan, setPlan] = useState(location.state?.plan || null);
  const [loading, setLoading] = useState(!location.state?.plan);
  const [editMode, setEditMode] = useState(false);
  const [editValues, setEditValues] = useState({});
  const [dropdownOptions, setDropdownOptions] = useState({});
  const [personInChargeEmails, setPersonInChargeEmails] = useState([""]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const res = await getPlanById(id);
      setPlan(res.data);
      setEditValues(res.data);
      setPersonInChargeEmails(res.data.personInCharge || [""]);
      setLoading(false);
    };
    if (!location.state?.plan) fetchData();
  }, [id, location.state?.plan]);

  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/dropdown-options");
        const data = await res.json();
        setDropdownOptions(data);
      } catch (err) {
        console.error("Lỗi khi tải dropdown:", err);
      }
    };
    fetchDropdowns();
  }, []);

  const handleToggleEdit = () => {
    setEditMode((prev) => !prev);
    setEditValues(plan);
    setPersonInChargeEmails(plan.personInCharge || [""]);
  };

  const handleChange = (key, value) => {
    setEditValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    const checkedUsers = [];
    const invalidEmails = [];

    for (const email of personInChargeEmails) {
      const trimmed = email.trim();
      if (!trimmed || !trimmed.includes("@")) continue;
      try {
        const res = await axios.get(`http://localhost:5000/api/users?email=${trimmed}`);
        const user = res.data?.data;
        if (!user) {
          invalidEmails.push(trimmed);
        } else {
          checkedUsers.push(user);
        }
      } catch (err) {
        console.error("Lỗi khi kiểm tra email:", err);
        invalidEmails.push(trimmed);
      }
    }

    if (invalidEmails.length > 0) {
      Swal.fire("Email không hợp lệ", `Các email sau không tồn tại: ${invalidEmails.join(", ")}`, "warning");
      return;
    }

    try {
      const res = await updatePlanById(plan._id, {
        ...editValues,
        personInCharge: checkedUsers.map((u) => u.email),
      });
      setPlan(res.data);
      setEditMode(false);

      // gửi mail cho từng người
      await Promise.all(
        checkedUsers.map((u) =>
          axios.post("http://localhost:5000/api/send", {
            to: u.email,
            subject: "Kế hoạch kiosk đã được cập nhật",
            text: `Bạn vừa được cập nhật là người phụ trách kế hoạch tại bệnh viện ${editValues.hospitalName || ""}`,
          })
        )
      );

      Swal.fire("Thành công", "Đã lưu thay đổi và gửi email", "success");
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
    { key: "devStatus", label: "Trạng thái làm việc với dev" },
    { key: "hopStatus", label: "Trạng thái làm việc với bệnh viện" },
    { key: "requestStatus", label: "Trạng thái xử lý yêu cầu" },
    { key: "his", label: "His" },
    { key: "handler", label: "Người xử lý" },
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
          className="px-3 py-1 rounded text-sm bg-blue-600 hover:bg-blue-700 text-white"
        >
          ← Quay lại danh sách
        </Link>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {fields.map((f) => (
          <div key={f.key} className="border rounded p-3">
            <div className="text-xs text-gray-500 mb-1">{f.label}</div>
            {editMode ? (
              f.key === "personInCharge" ? (
                <div className="flex flex-col gap-2">
                  {personInChargeEmails.map((email, idx) => (
                    <div key={idx} className="flex gap-2">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => {
                          const updated = [...personInChargeEmails];
                          updated[idx] = e.target.value;
                          setPersonInChargeEmails(updated);
                        }}
                        placeholder="Nhập email người phụ trách"
                        className="border p-2 rounded text-sm flex-1"
                      />
                      <button
                        type="button"
                        className="text-red-500"
                        onClick={() => {
                          const updated = [...personInChargeEmails];
                          updated.splice(idx, 1);
                          setPersonInChargeEmails(updated);
                        }}
                      >
                        Xoá
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    className="text-blue-600 text-sm mt-1"
                    onClick={() => setPersonInChargeEmails([...personInChargeEmails, ""])}
                  >
                    + Thêm người phụ trách
                  </button>
                </div>
              ) : f.isDate ? (
                <input
                  type="date"
                  className="w-full text-sm border rounded p-1"
                  value={editValues[f.key] || ""}
                  onChange={(e) => handleChange(f.key, e.target.value)}
                />
              ) : dropdownOptions[f.key] ? (
                <select
                  className="w-full text-sm border rounded p-1"
                  value={editValues[f.key] || ""}
                  onChange={(e) => handleChange(f.key, e.target.value)}
                >
                  <option value="">-- Chọn --</option>
                  {dropdownOptions[f.key].map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
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
                {f.key === "personInCharge"
                  ? Array.isArray(plan[f.key]) && plan[f.key].length > 0
                    ? plan[f.key].join(", ")
                    : "Không có người phụ trách"
                  : f.isDate
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
