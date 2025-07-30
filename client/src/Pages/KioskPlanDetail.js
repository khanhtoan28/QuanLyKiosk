// src/Pages/KioskPlanDetail.js
import React, { useEffect, useState } from "react";
import { useLocation, useParams, Link } from "react-router-dom";
import { getPlanById } from "../services/kioskPlanApi";

// Format ngày về dd/MM/yyyy (vi-VN) – KHỚP LOGIC VỚI TABLE
const formatDate = (value) => {
  if (value === null || value === undefined) return "-";
  const v = typeof value === "string" ? value.trim() : value;
  if (v === "") return "-";

  const isNumericLike =
    typeof v === "number" || (typeof v === "string" && !isNaN(v));
  if (isNumericLike) {
    const num = Number(v);
    if (!Number.isNaN(num)) {
      const d = new Date(1900, 0, num - 1);
      if (!Number.isNaN(d.getTime())) return d.toLocaleDateString("vi-VN");
    }
  }

  const d2 = new Date(v);
  if (!Number.isNaN(d2.getTime())) return d2.toLocaleDateString("vi-VN");

  if (typeof v === "string") {
    const m = v.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
    if (m) {
      const [, dd, mm, yyyy] = m;
      const d3 = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
      if (!Number.isNaN(d3.getTime())) return d3.toLocaleDateString("vi-VN");
    }
  }

  return typeof v === "string" ? v : "-";
};

const KioskPlanDetail = () => {
  const { id } = useParams();
  const location = useLocation();
  const [plan, setPlan] = useState(location.state?.plan || null);
  const [loading, setLoading] = useState(!location.state?.plan);

  useEffect(() => {
    const fetchOne = async () => {
      try {
        setLoading(true);
        const res = await getPlanById(id);
        setPlan(res.data);
      } finally {
        setLoading(false);
      }
    };
    if (!plan) fetchOne();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) return <div className="p-4">Đang tải chi tiết...</div>;
  if (!plan) return <div className="p-4">Không tìm thấy dữ liệu.</div>;

  const fields = [
    { label: "Tên bệnh viện", value: plan.hospitalName },

    // Các trường text có thể có xuống dòng từ Excel
    { label: "Ghi chú làm việc gần nhất", value: plan.lastNote, multiline: true },
    { label: "Yêu cầu thêm của bệnh viện", value: plan.additionalRequest, multiline: true },

    // 3 trường ngày – dùng formatDate
    { label: "Ngày phát sinh yêu cầu", value: formatDate(plan.requestDate) },
    { label: "Deadline", value: formatDate(plan.deadline) },
    { label: "Ngày chuyển nghiệm thu", value: formatDate(plan.deliveryDate) },

    { label: "Số lượng", value: plan.quantity },
    { label: "Loại đầu đọc CCCD", value: plan.cccdReaderType },
    { label: "Loại thiết bị", value: plan.deviceType },
    { label: "Mức độ ưu tiên", value: plan.priorityLevel },
    { label: "Người phụ trách", value: plan.personInCharge },
    { label: "Trạng thái làm việc với viện - dev", value: plan.devStatus },
    { label: "Trạng thái xử lý yêu cầu", value: plan.requestStatus },
    { label: "Người xử lý", value: plan.handler },
    { label: "His", value: plan.his },

    // URL có thể dài -> thêm break-words
    { label: "Url port", value: plan.urlPort, multiline: true },

    { label: "Tài khoản check BHXH", value: plan.bhxhAccount },
    { label: "ID", value: plan._id },
  ];

  return (
    <div className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold">Chi tiết kế hoạch kiosk</h1>
        <Link
          to="/kiosk-plans"
          className="px-3 py-1 border rounded hover:bg-gray-50 text-sm"
        >
          Quay lại danh sách
        </Link>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {fields.map((f) => (
          <div key={f.label} className="border rounded p-3">
            <div className="text-xs text-gray-500">{f.label}</div>
            <div
              className={
                // với trường có thể có xuống dòng/URL dài thì dùng pre-wrap + break-words
                "text-sm " + (f.multiline ? "whitespace-pre-wrap break-words" : "")
              }
            >
              {f.value !== undefined && f.value !== null && f.value !== ""
                ? String(f.value)
                : "-"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default KioskPlanDetail;
