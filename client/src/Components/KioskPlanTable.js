// KioskPlanTable.js
import React, { useState, useMemo } from "react";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { Eye } from "lucide-react";
import EditDropdownModal from "./EditDropdownModal"; // ✅ thêm modal

const formatDate = (value) => {
  if (!value) return "-";
  const m = String(value).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (m) {
    const [, yyyy, mm, dd] = m;
    return `${dd}/${mm}/${yyyy}`;
  }
  return value;
};

const KioskPlanTable = ({ data, onDelete }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [dropdownOptions, setDropdownOptions] = useState({});
  const user = { role: "admin" }; // ✅ giả lập phân quyền
  const itemsPerPage = 10;
  const navigate = useNavigate();

  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => {
      const aDate = new Date(a.createdAt || 0);
      const bDate = new Date(b.createdAt || 0);
      return bDate - aDate;
    });
  }, [data]);

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const currentData = sortedData.slice(startIdx, startIdx + itemsPerPage);

  const handleDelete = async (ids) => {
    const result = await Swal.fire({
      title: "Bạn chắc chắn xoá?",
      text: `Sẽ xoá ${ids.length} bản ghi!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Xoá",
      cancelButtonText: "Huỷ",
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
    });

    if (result.isConfirmed) {
      for (let id of ids) await onDelete(id);
      Swal.fire("Đã xoá!", "Các bản ghi đã được xoá thành công.", "success");
      setSelectedIds([]);
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedIds(sortedData.map((item) => item._id));
    } else {
      setSelectedIds([]);
    }
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const renderPagination = () => {
    const pages = [];
    const range = 2;
    const dot = <span key="dots">...</span>;

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - range && i <= currentPage + range)
      ) {
        pages.push(
          <button
            key={i}
            className={`w-8 h-8 border rounded ${i === currentPage ? "bg-black text-white" : "bg-white"}`}
            onClick={() => handlePageChange(i)}
          >
            {i}
          </button>
        );
      } else if (
        pages[pages.length - 1] !== dot &&
        i !== currentPage + range + 1 &&
        i !== currentPage - range - 1
      ) {
        pages.push(dot);
      }
    }

    return (
      <div className="flex justify-center items-center gap-2 mt-4">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="w-8 h-8 border rounded"
        >
          &lt;
        </button>
        {pages}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="w-8 h-8 border rounded"
        >
          &gt;
        </button>
      </div>
    );
  };

  return (
    <div className="overflow-x-auto">
      {user.role === "admin" && (
        <div className="mb-4 text-right">
          <button
            onClick={() => setShowModal(true)}
            className="px-3 py-1 bg-yellow-400 text-black rounded text-sm hover:bg-yellow-500"
          >
            ⚙️ Sửa dropdown kế hoạch
          </button>
        </div>
      )}

      {selectedIds.length > 0 && (
        <div className="mb-2 text-right">
          <label className="inline-flex items-center mr-4">
            <input
              type="checkbox"
              checked={selectedIds.length === sortedData.length}
              onChange={(e) => handleSelectAll(e.target.checked)}
              className="mr-1"
            />
            Chọn tất cả
          </label>
          <button
            onClick={() => handleDelete(selectedIds)}
            className="px-3 py-1 bg-red-500 text-white rounded text-sm"
          >
            Xoá {selectedIds.length} mục đã chọn
          </button>
        </div>
      )}

      <table className="min-w-full table-fixed text-sm text-left border">
        <thead className="bg-gray-100 text-xs font-semibold">
          <tr>
            <th className="p-2 border w-[50px] text-center">STT</th>
            <th className="p-2 border w-[250px] text-center">Tên bệnh viện</th>
            <th className="p-2 border w-[100px] text-center">Deadline</th>
            <th className="p-2 border w-[100px] text-center">Ưu tiên</th>
            <th className="p-2 border w-[200px] text-center ">Trạng thái Dev</th>
            <th className="p-2 border w-[200px] text-center">Trạng thái yêu cầu</th>
            <th className="p-2 border w-[150px] text-center">Ngày nghiệm thu</th>
            <th className="p-2 border w-[100px] text-center">Chi tiết</th>
            <th className="p-2 border w-[40px] text-center">✔</th>
          </tr>
        </thead>
        <tbody>
          {currentData.length === 0 ? (
            <tr>
              <td colSpan="9" className="p-4 text-center text-gray-500">
                Không có dữ liệu để hiển thị
              </td>
            </tr>
          ) : (
            currentData.map((plan, idx) => (
              <tr
                key={plan._id || idx}
                className="border-t hover:bg-gray-50 h-[48px]"
              >
                <td className="p-2 border text-center">{startIdx + idx + 1}</td>
                <td className="p-2 border text-center">{plan.hospitalName}</td>
                <td className="p-2 border text-center">
                  {formatDate(plan.deadline)}
                </td>
                <td className="p-2 border text-center leading-tight whitespace-pre-line">
                  {plan.priorityLevel ? (
                    <>
                      <div>{plan.priorityLevel.split(" (")[0]}</div>
                      {plan.priorityLevel.includes("(") && (
                        <div className="text-xs text-gray-500">
                          {"(" + plan.priorityLevel.split(" (")[1]}
                        </div>
                      )}
                    </>
                  ) : (
                    "-"
                  )}
                </td>
                <td className="p-2 border text-center">{plan.devStatus || "-"}</td>
                <td className="p-2 border text-center">{plan.requestStatus || "-"}</td>
                <td className="p-2 border text-center">
                  {formatDate(plan.deliveryDate)}
                </td>
                <td className="p-2 border">
                  <div className="flex justify-center items-center">
                    <button
                      className="flex items-center gap-1 px-2 py-1 bg-gray-700 text-white rounded text-xs hover:bg-gray-800"
                      onClick={() =>
                        navigate(`/kiosk-plans/${plan._id}`, { state: { plan } })
                      }
                    >
                      <Eye size={14} /> Xem
                    </button>
                  </div>
                </td>
                <td className="p-2 border text-center">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(plan._id)}
                    onChange={() => toggleSelect(plan._id)}
                  />
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {renderPagination()}

      {showModal && (
        <EditDropdownModal
          onClose={() => setShowModal(false)}
          onSave={(options) => {
            setDropdownOptions(options);
            console.log("🔄 Dropdown đã cập nhật:", options);
          }}
          initialOptions={dropdownOptions}
        />
      )}
    </div>
  );
};

export default KioskPlanTable;