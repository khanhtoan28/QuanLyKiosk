import React from "react";

const KioskPlanTable = ({ data, onEdit, onDelete }) => {
  return (
    <table className="min-w-full text-sm text-left border">
      <thead className="bg-gray-100 text-xs font-semibold">
        <tr>
          {[
            "STT",
            "Tên bệnh viện",
            "Ghi chú làm việc gần nhất",
            "Yêu cầu thêm của bệnh viện",
            "Ngày phát sinh yêu cầu",
            "Deadline",
            "Ngày chuyển nghiệm thu",
            "Số lượng",
            "Loại đầu đọc CCCD",
            "Loại thiết bị",
            "Mức độ ưu tiên",
            "Người phụ trách",
            "Trạng thái làm việc với viện - dev",
            "Trạng thái xử lý yêu cầu",
            "Người xử lý",
            "His",
            "Url port",
            "Tài khoản check BHXH",
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
            <td className="p-2 border">{plan.lastNote}</td>
            <td className="p-2 border">{plan.additionalRequest}</td>
            <td className="p-2 border">{plan.requestDate}</td>
            <td className="p-2 border">{plan.deadline}</td>
            <td className="p-2 border">{plan.deliveryDate}</td>
            <td className="p-2 border">{plan.quantity}</td>
            <td className="p-2 border">{plan.cccdReaderType}</td>
            <td className="p-2 border">{plan.deviceType}</td>
            <td className="p-2 border">{plan.priorityLevel}</td>
            <td className="p-2 border">{plan.personInCharge}</td>
            <td className="p-2 border">{plan.devStatus}</td>
            <td className="p-2 border">{plan.requestStatus}</td>
            <td className="p-2 border">{plan.handler}</td>
            <td className="p-2 border">{plan.his}</td>
            <td className="p-2 border">{plan.urlPort}</td>
            <td className="p-2 border">{plan.bhxhAccount}</td>
            <td className="p-2 border space-x-2">
              <button
                className="px-2 py-1 bg-blue-500 text-white rounded text-xs"
                onClick={() => onEdit(plan)}
              >
                Sửa
              </button>
              <button
                className="px-2 py-1 bg-red-500 text-white rounded text-xs"
                onClick={() => onDelete(plan._id)}
              >
                Xoá
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default KioskPlanTable;
