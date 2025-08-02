import React, { useState, useEffect } from "react";
import axios from "axios";

const EditDropdownModal = ({ onClose }) => {
  const [options, setOptions] = useState({});
  const [loading, setLoading] = useState(true);

  const displayNames = {
    cccdReaderType: "Loại đầu đọc CCCD",
    deviceType: "Loại thiết bị",
    priorityLevel: "Mức độ ưu tiên",
    hopStatus: "Trạng thái làm việc với bệnh viện",
    devStatus: "Trạng thái làm việc với dev",
    requestStatus: "Trạng thái xử lý yêu cầu",
  };

  useEffect(() => {
    axios.get("http://localhost:5000/api/dropdown-options")
      .then((res) => {
        setOptions(res.data);
        setLoading(false);
      });
  }, []);

  const handleChange = (key, index, value) => {
    const updated = [...options[key]];
    updated[index] = value;
    setOptions((prev) => ({ ...prev, [key]: updated }));
  };

  const handleAdd = (key) => {
    setOptions((prev) => ({
      ...prev,
      [key]: [...prev[key], ""],
    }));
  };

  const handleRemove = (key, index) => {
    const updated = [...options[key]];
    updated.splice(index, 1);
    setOptions((prev) => ({ ...prev, [key]: updated }));
  };

  const handleSave = async () => {
    await axios.put("http://localhost:5000/api/dropdown-options", { options });
    onClose();
    window.location.reload();
  };

  if (loading) return null;
 
  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-lg w-full max-w-3xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Chỉnh sửa dropdown</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-black text-xl">
            &times;
          </button>
        </div>

        <div className="h-[60vh] overflow-y-auto space-y-6 pr-2">
          {Object.entries(options)
            .filter(([key]) => key !== "personInCharge")
            .map(([key, values]) => (

              <div key={key}>
                <div className="font-semibold mb-1">
                  {displayNames[key] || key}
                </div>

                {values.map((val, idx) => (
                  <div key={idx} className="flex gap-2 mb-1">
                    <input
                      value={val}
                      onChange={(e) => handleChange(key, idx, e.target.value)}
                      className="border px-2 py-1 rounded w-full text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemove(key, idx)}
                      className="text-red-500 text-sm"
                    >
                      Xoá
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => handleAdd(key)}
                  className="text-blue-600 text-sm mt-1"
                >
                  + Thêm giá trị
                </button>
              </div>
            ))}
        </div>

        <div className="mt-4 text-right">
          <button
            onClick={handleSave}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
          >
            Lưu thay đổi
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditDropdownModal;
