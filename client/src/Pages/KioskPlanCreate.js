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
    const [personInChargeEmails, setPersonInChargeEmails] = useState([""]);
    const [searchInput, setSearchInput] = useState({});
    const [recentEmails, setRecentEmails] = useState(() => JSON.parse(localStorage.getItem("recentEmails") || "[]"));
    const [allUsers, setAllUsers] = useState([]);
    const [form, setForm] = useState(
        Object.fromEntries(Object.keys(fieldLabels).map((key) => [key, ""]))
    );
    const [selectOptions, setSelectOptions] = useState({});

    useEffect(() => {
        axios.get("http://localhost:5000/api/dropdown-options").then((res) => {
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

        const checkedUsers = [];
        const invalidEmails = [];

        for (const email of personInChargeEmails) {
            if (!email || !email.includes("@")) continue;

            try {
                const res = await axios.get(`http://localhost:5000/api/users?email=${email}`);
                const user = res.data?.data;

                if (!user) {
                    invalidEmails.push(email);
                    continue;
                }

                checkedUsers.push(user);
            } catch (err) {
                console.error("❌ Lỗi khi kiểm tra user:", err);
                invalidEmails.push(email);
            }
        }

        if (invalidEmails.length > 0) {
            Swal.fire({
                icon: "warning",
                title: "Email không hợp lệ",
                html: `Các email sau không tồn tại trong hệ thống:<br><b>${invalidEmails.join("<br>")}</b>`,
            });
            return;
        }

        try {
            // 🚀 Gửi song song
            await Promise.all(
                checkedUsers.map((user) =>
                    axios.post("http://localhost:5000/api/notifications/send", {
                        to: user.email,
                        subject: "Bạn được giao công việc mới",
                        message: `Chào ${user.name || user.email}, bạn đã được phân công phụ trách một kế hoạch kiosk mới.`,
                    })
                )
            );

            await createPlan({
                ...form,
                personInCharge: checkedUsers.map((u) => u.email),
            });

            Swal.fire("Thành công", "Đã tạo kế hoạch mới.", "success");
            navigate("/kiosk-plans");
        } catch (err) {
            console.error("Lỗi khi tạo kế hoạch hoặc gửi mail:", err.response?.data || err.message);
            Swal.fire("Lỗi", "Tạo kế hoạch thất bại.", "error");
        }
    };


    useEffect(() => {
        axios.get("http://localhost:5000/api/users/all").then((res) => {
            setAllUsers(res.data?.data || []);
        }).catch(() => { });
    }, []);

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h1 className="text-xl font-semibold mb-4">Tạo mới kế hoạch kiosk</h1>
            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
                {Object.entries(form).map(([key, value]) => (
                    <div key={key} className="flex flex-col">
                        <label className="text-sm text-gray-600 mb-1">
                            {fieldLabels[key] || key}
                        </label>

                        {key === "personInCharge" ? (
                            <div className="flex flex-col gap-2">
                                {personInChargeEmails.map((email, idx) => {
                                    const input = searchInput[idx] || "";
                                    const suggestions = [
                                        ...recentEmails
                                            .map((e) => allUsers.find((u) => u.email === e))
                                            .filter(Boolean),
                                        ...allUsers.filter(
                                            (u) =>
                                                u.email.toLowerCase().includes(input.toLowerCase()) &&
                                                !recentEmails.includes(u.email)
                                        ),
                                    ];

                                    return (
                                        <div key={idx} className="relative">
                                            <input
                                                type="text"
                                                value={email}
                                                onChange={(e) => {
                                                    const updated = [...personInChargeEmails];
                                                    updated[idx] = e.target.value;
                                                    setPersonInChargeEmails(updated);
                                                    setSearchInput((prev) => ({ ...prev, [idx]: e.target.value }));
                                                }}
                                                placeholder="Nhập email người phụ trách"
                                                className="border p-2 rounded text-sm w-full"
                                                autoComplete="off"
                                            />
                                            <button
                                                type="button"
                                                className="absolute right-2 top-2 text-red-500 text-sm"
                                                onClick={() => {
                                                    const updated = [...personInChargeEmails];
                                                    updated.splice(idx, 1);
                                                    setPersonInChargeEmails(updated);
                                                }}
                                            >
                                                Xoá
                                            </button>

                                            {input && (
                                                <div className="absolute z-10 bg-white border rounded shadow mt-1 w-full max-h-60 overflow-auto">
                                                    {suggestions.map((user) => (
                                                        <div
                                                            key={user._id}
                                                            className="flex items-center px-3 py-2 hover:bg-gray-100 cursor-pointer"
                                                            onClick={() => {
                                                                const updated = [...personInChargeEmails];
                                                                updated[idx] = user.email;
                                                                setPersonInChargeEmails(updated);
                                                                setSearchInput((prev) => ({ ...prev, [idx]: "" }));

                                                                const updatedRecent = [user.email, ...recentEmails.filter((e) => e !== user.email)].slice(0, 5);
                                                                setRecentEmails(updatedRecent);
                                                                localStorage.setItem("recentEmails", JSON.stringify(updatedRecent));
                                                            }}
                                                        >
                                                            <img
                                                                src={user.avatar || `https://i.pravatar.cc/40?u=${user.email}`}
                                                                className="w-8 h-8 rounded-full mr-3"
                                                                alt=""
                                                            />
                                                            <div>
                                                                <div className="font-medium">{user.name || "Không tên"}</div>
                                                                <div className="text-sm text-gray-500">{user.email}</div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                    {suggestions.length === 0 && (
                                                        <div className="px-3 py-2 text-sm text-gray-500 italic">Không có gợi ý</div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                                <button
                                    type="button"
                                    className="text-blue-600 text-sm mt-1"
                                    onClick={() => setPersonInChargeEmails([...personInChargeEmails, ""])}
                                >
                                    + Thêm người phụ trách
                                </button>
                            </div>
                        ) : dateFields.includes(key) ? (
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