import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { createPlan } from "../services/kioskPlanApi";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { vi } from "date-fns/locale";
import { format, parseISO } from "date-fns";
import axios from "axios";

const fieldLabels = {
    hospitalName: "Tên bệnh viện",
    lastNote: "Ghi chú làm việc gần nhất",
    additionalRequest: "Yêu cầu thêm của bệnh viện",
    requestDate: "Ngày phát sinh yêu cầu",
    deadline: "Deadline",
    deliveryDate: "Ngày chuyển nghiệm thu",
    quantity: "Số lượng",
    cccdReaderType: "Loại đầu đọc CCCD",
    deviceType: "Loại thiết bị",
    priorityLevel: "Mức độ ưu tiên",
    personInCharge: "Người phụ trách",
    devStatus: "Trạng thái dev",
    hopStatus: "Trạng thái làm việc với bệnh viện",
    requestStatus: "Trạng thái yêu cầu",
    handler: "Người xử lý",
    his: "HIS",
    urlPort: "URL Port",
    bhxhAccount: "Tài khoản BHXH",
};

const dateFields = ["requestDate", "deadline", "deliveryDate"];

const KioskPlanCreate = () => {
    const navigate = useNavigate();
    const [form, setForm] = useState(
        Object.fromEntries(Object.keys(fieldLabels).map((key) => [key, ""]))
    );
    const [selectOptions, setSelectOptions] = useState({});

    useEffect(() => {
        axios.get("/api/dropdown-options").then((res) => {
            setSelectOptions(res.data);
        });
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleDateChange = (name, date) => {
        const iso = date ? format(date, "yyyy-MM-dd") : "";
        setForm((prev) => ({ ...prev, [name]: iso }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.hospitalName.trim()) {
            Swal.fire("Thiếu thông tin", "Vui lòng nhập Tên bệnh viện.", "warning");
            return;
        }

        try {
            await createPlan(form);
            Swal.fire("Thành công", "Đã tạo kế hoạch mới.", "success");
            navigate("/kiosk-plans");
        } catch (err) {
            Swal.fire("Lỗi", "Tạo kế hoạch thất bại.", "error");
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h1 className="text-xl font-semibold mb-4">Tạo mới kế hoạch kiosk</h1>
            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
                {Object.entries(form).map(([key, value]) => (
                    <div key={key} className="flex flex-col">
                        <label className="text-sm text-gray-600 mb-1">
                            {fieldLabels[key] || key}
                        </label>

                        {dateFields.includes(key) ? (
                            <DatePicker
                                selected={value ? parseISO(value) : null}
                                onChange={(date) => handleDateChange(key, date)}
                                dateFormat="dd-MM-yyyy"
                                locale={vi}
                                placeholderText="Chọn ngày"
                                className="border p-2 rounded text-sm"
                            />
                        ) : selectOptions[key] ? (
                            <select
                                name={key}
                                value={value}
                                onChange={handleChange}
                                className="border p-2 rounded text-sm"
                            >
                                <option value="">-- Chọn --</option>
                                {selectOptions[key].map((option) => (
                                    <option key={option} value={option}>
                                        {option}
                                    </option>
                                ))}
                            </select>
                        ) : (
                            <input
                                type={key === "quantity" ? "number" : "text"}
                                name={key}
                                value={value}
                                onChange={handleChange}
                                className="border p-2 rounded text-sm"
                            />
                        )}
                    </div>
                ))}

                <div className="col-span-2 mt-4 flex gap-2">
                    <button
                        type="submit"
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                        Lưu kế hoạch
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate("/kiosk-plans")}
                        className="bg-gray-300 px-4 py-2 rounded"
                    >
                        Huỷ
                    </button>
                </div>
            </form>
        </div>
    );
};

export default KioskPlanCreate;
