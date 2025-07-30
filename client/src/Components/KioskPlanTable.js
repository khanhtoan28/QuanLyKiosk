// src/Components/KioskPlanTable.js
import React from "react";
import Swal from "sweetalert2";

const formatExcelDate = (value) => {
  if (!value) return "-";
  if (!isNaN(value)) {
    const date = new Date(1900, 0, value - 1);
    return date.toLocaleDateString("vi-VN");
  }
  return value;
};

const KioskPlanTable = ({ data, onEdit, onDelete, onView }) => {
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Bạn chắc chắn xoá?",
      text: "Bản ghi sẽ bị xoá vĩnh viễn!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Xoá",
      cancelButtonText: "Huỷ",
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
    });

    if (result.isConfirmed) {
      const ok = await onDelete(id);   // ✅ chờ xoá xong
      if (ok) {
        Swal.fire("Đã xoá!", "Bản ghi đã được xoá thành công.", "success");
      }
    }
  };

  const handleEdit = (plan) => {
    Swal.fire({
      title: "Chỉnh sửa kế hoạch",
      text: `Bạn đang chỉnh kế hoạch của ${plan.hospitalName}`,
      icon: "info",
      confirmButtonText: "Đóng",
    });
    // onEdit(plan);
  };

  return (
    <table className="min-w-full text-sm text-left border">
      <thead className="bg-gray-100 text-xs font-semibold">
        <tr>
          {[
            "STT",
            "Tên bệnh viện",
            "Deadline",
            "Mức độ ưu tiên",
            "Trạng thái làm việc với viện - dev",
            "Trạng thái xử lý yêu cầu",
            "Ngày chuyển nghiệm thu",
            "Hành động",
          ].map((header, i) => (
            <th key={i} className="p-2 border">
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((plan, idx) => (
          <tr key={plan._id || idx} className="border-t hover:bg-gray-50">
            <td className="p-2 border">{plan.stt || idx + 1}</td>
            <td className="p-2 border">{plan.hospitalName}</td>
            <td className="p-2 border">{formatExcelDate(plan.deadline)}</td>
            <td className="p-2 border">{plan.priorityLevel || "-"}</td>
            <td className="p-2 border">{plan.devStatus || "-"}</td>
            <td className="p-2 border">{plan.requestStatus || "-"}</td>
            <td className="p-2 border">{formatExcelDate(plan.deliveryDate)}</td>

            <td className="p-2 border">
              <div className="flex items-center gap-2 whitespace-nowrap min-w-[220px]">
                <button
                  className="inline-flex items-center px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 active:scale-[.98] transition"
                  onClick={() => handleEdit(plan)}
                  type="button"
                >
                  Sửa
                </button>
                <button
                  className="inline-flex items-center px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600 active:scale-[.98] transition"
                  onClick={() => handleDelete(plan._id)}
                  type="button"
                >
                  Xoá
                </button>
                <button
                  className="inline-flex items-center px-2 py-1 bg-gray-700 text-white rounded text-xs hover:bg-gray-800 active:scale-[.98] transition"
                  onClick={() => onView(plan)}
                  type="button"
                >
                  Chi tiết
                </button>
              </div>

            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default KioskPlanTable;
