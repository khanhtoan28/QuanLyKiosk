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
  const [searchInput, setSearchInput] = useState({});
  const [allUsers, setAllUsers] = useState([]);
  const [noteInput, setNoteInput] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const res = await getPlanById(id);
      setPlan(res.data);
      setEditValues(res.data);
      setPersonInChargeEmails(res.data.personInCharge || [""]);
      setLoading(false);
    };

    fetchData(); // ✅ Luôn gọi API, không dùng location.state.plan nữa
  }, [id]);


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

    axios.get("http://localhost:5000/api/users/all").then((res) => {
      setAllUsers(res.data?.data || []);
    }).catch(() => { });
  }, []);

  const handleToggleEdit = () => {
    setEditMode((prev) => !prev);
    setEditValues(plan);
    setPersonInChargeEmails(plan.personInCharge || [""]);
    setNoteInput("");
  };

  const handleChange = (key, value) => {
    setEditValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleEditNote = async (index, newText) => {
    const updatedNotes = [...(editValues.lastNote || [])];
    updatedNotes[index] = {
      text: newText.trim(),
      timestamp: new Date().toLocaleString("vi-VN") + " (đã sửa)",
    };
    setEditValues((prev) => ({ ...prev, lastNote: updatedNotes }));
    await handleSave();
  };

  const handleDeleteNote = async (index) => {
    const updatedNotes = [...(editValues.lastNote || [])];
    updatedNotes.splice(index, 1);
    setEditValues((prev) => ({ ...prev, lastNote: updatedNotes }));
    await handleSave();
  };

  const handleSave = async () => {
    const emailChecks = personInChargeEmails.map(email => {
      const trimmed = email.trim();
      if (!trimmed || !trimmed.includes("@")) return null;
      return axios.get(`http://localhost:5000/api/users?email=${trimmed}`)
        .then(res => res.data?.data || null)
        .catch(err => {
          console.error("Lỗi khi kiểm tra email:", err);
          return null;
        });
    });

    const results = await Promise.all(emailChecks);
    const checkedUsers = [];
    const invalidEmails = [];

    results.forEach((user, idx) => {
      const email = personInChargeEmails[idx].trim();
      if (!user) {
        invalidEmails.push(email);
      } else {
        checkedUsers.push(user);
      }
    });

    if (invalidEmails.length > 0) {
      Swal.fire("Email không hợp lệ", `Các email sau không tồn tại: ${invalidEmails.join(", ")}`, "warning");
      return;
    }

    try {
      const newEmails = checkedUsers.map((u) => u.email);
      const oldEmails = plan.personInCharge || [];
      const addedEmails = newEmails.filter(email => !oldEmails.includes(email));
      const usersToNotify = checkedUsers.filter(user => addedEmails.includes(user.email));

      const mergedNotes = [...(editValues.lastNote || [])];
      if (noteInput.trim()) {
        mergedNotes.unshift({
          text: noteInput.trim(),
          timestamp: new Date().toLocaleString("vi-VN"),
        });
      }

      const payload = {
        ...editValues,
        personInCharge: newEmails,
        lastNote: mergedNotes
      };

      await updatePlanById(plan._id, payload);

      // ✅ Gọi lại API để lấy bản mới nhất
      const updated = await getPlanById(plan._id);
      setPlan(updated.data);
      setEditValues(updated.data);
      setPersonInChargeEmails(updated.data.personInCharge || []);
      setEditMode(false);
      setNoteInput("");

      Swal.fire("Thành công", "Đã lưu thay đổi", "success");

      // ✅ Gửi email
      setTimeout(() => {
        usersToNotify.forEach((u) => {
          axios.post("http://localhost:5000/api/send", {
            to: u.email,
            subject: "Kế hoạch kiosk đã được cập nhật",
            text: `Bạn vừa được thêm làm người phụ trách kế hoạch tại bệnh viện ${editValues.hospitalName || ""}.`,
          }).catch(err => {
            console.error("Lỗi gửi email tới", u.email, err);
          });
        });
      }, 0);
    } catch (err) {
      Swal.fire("Lỗi", "Không thể cập nhật dữ liệu", "error");
    }
  };


  const fields = [
    { key: "hospitalName", label: "Tên bệnh viện" },
    { key: "quantity", label: "Số lượng" },
    { key: "priorityLevel", label: "Mức độ ưu tiên" },
    { key: "deliveryDate", label: "Ngày chuyển nghiệm thu", isDate: true },
    { key: "deadline", label: "Deadline", isDate: true },
    { key: "cccdReaderType", label: "Loại đầu đọc CCCD" },
    { key: "lastNote", label: "Ghi chú làm việc gần nhất", multiline: true },
    { key: "additionalRequest", label: "Yêu cầu thêm của bệnh viện", multiline: true },
    { key: "requestDate", label: "Ngày phát sinh yêu cầu", isDate: true },
    { key: "personInCharge", label: "Người phụ trách" },
    { key: "deviceType", label: "Loại thiết bị" },
    { key: "devStatus", label: "Trạng thái làm việc với dev" },
    { key: "hopStatus", label: "Trạng thái làm việc với bệnh viện" },
    { key: "requestStatus", label: "Trạng thái xử lý yêu cầu" },
    { key: "his", label: "His" },
    { key: "handler", label: "Người xử lý" },
    { key: "urlPort", label: "Url port", multiline: true },
    { key: "bhxhAccount", label: "Tài khoản check BHXH" },
  ];

  if (loading) return <div className="p-4">Đang tải chi tiết...</div>;
  if (!plan) return <div className="p-4">Không tìm thấy kế hoạch.</div>;

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

      <div className="columns-1 md:columns-2 gap-4 space-y-4">
        {fields.map((f) => (
          <div key={f.key} className="break-inside-avoid border rounded p-3">
            <div className="text-xs text-gray-500 mb-1">{f.label}</div>
            {editMode ? (
              f.key === "personInCharge" ? (
                <div className="flex flex-col gap-2">
                  {personInChargeEmails.map((email, idx) => {
                    const input = searchInput[idx] || "";
                    const suggestions =
                      input.length >= 3
                        ? allUsers.filter((u) =>
                          u.email.toLowerCase().includes(input.toLowerCase())
                        )
                        : [];
                    const user = allUsers.find((u) => u.email === email);
                    return (
                      <div key={idx} className="relative">
                        {email && user && (
                          <div className="flex items-center border p-2 rounded bg-white mb-1">
                            <img
                              src={user?.avatar || `https://i.pravatar.cc/40?u=${email}`}
                              className="w-6 h-6 rounded-full mr-2"
                              alt="avatar"
                            />
                            <div>
                              <div className="text-sm font-medium">{user?.name || email}</div>
                              <div className="text-xs text-gray-500">{email}</div>
                            </div>
                            <button
                              type="button"
                              className="ml-auto text-red-500 text-xs"
                              onClick={() => {
                                const updated = [...personInChargeEmails];
                                updated.splice(idx, 1);
                                setPersonInChargeEmails(updated);
                              }}
                            >
                              Xoá
                            </button>
                          </div>
                        )}

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
                        {input.length >= 3 && suggestions.length > 0 && (
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
                                }}
                              >
                                <img
                                  src={user.avatar || `https://i.pravatar.cc/40?u=${user.email}`}
                                  className="w-8 h-8 rounded-full mr-3"
                                  alt=""
                                />
                                <div>
                                  <div className="font-medium">{user.name || user.email}</div>
                                  <div className="text-sm text-gray-500">{user.email}</div>
                                </div>
                              </div>
                            ))}
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
              ) : f.key === "lastNote" ? (
                <div className="flex flex-col gap-2">
                  <textarea
                    rows={3}
                    className="w-full text-sm border rounded p-2"
                    placeholder="Nhập ghi chú mới..."
                    value={noteInput}
                    onChange={(e) => setNoteInput(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!noteInput.trim()) return;
                      const newNote = {
                        text: noteInput.trim(),
                        timestamp: new Date().toLocaleString("vi-VN"),
                      };
                      handleChange("lastNote", [newNote, ...(editValues.lastNote || [])]);
                      setNoteInput("");
                    }}
                    className="text-blue-600 text-sm self-start"
                  >
                    + Thêm ghi chú
                  </button>
                  {(editValues.lastNote || []).map((note, idx) => (
                    <div key={idx} className="bg-gray-50 border p-2 rounded text-sm relative group">
                      {note.editing ? (
                        <>
                          <textarea
                            className="w-full text-sm border rounded p-1 mb-1"
                            value={note.text}
                            onChange={(e) => {
                              const updated = [...editValues.lastNote];
                              updated[idx].text = e.target.value;
                              setEditValues((prev) => ({ ...prev, lastNote: updated }));
                            }}
                          />
                          <button
                            className="text-green-600 text-xs mr-2"
                            onClick={() => {
                              const updated = [...editValues.lastNote];
                              updated[idx].editing = false;
                              updated[idx].timestamp = `${new Date().toLocaleString("vi-VN")} (đã sửa)`;
                              setEditValues((prev) => ({ ...prev, lastNote: updated }));
                            }}
                          >
                            ✔ Lưu
                          </button>
                          <button
                            className="text-gray-500 text-xs"
                            onClick={() => {
                              const updated = [...editValues.lastNote];
                              updated[idx].editing = false;
                              setEditValues((prev) => ({ ...prev, lastNote: updated }));
                            }}
                          >
                            ✘ Huỷ
                          </button>
                        </>
                      ) : (
                        <>
                          <div className="text-gray-800 font-medium">{note.text}</div>
                          <div className="text-xs text-gray-500">{note.timestamp}</div>
                          <div className="absolute top-1 right-2 opacity-0 group-hover:opacity-100 transition text-xs flex gap-2">
                            <button
                              className="text-blue-600"
                              onClick={() => {
                                const updated = [...editValues.lastNote];
                                updated[idx].editing = true;
                                setEditValues((prev) => ({ ...prev, lastNote: updated }));
                              }}
                            >
                              Sửa
                            </button>
                            <button
                              className="text-red-600"
                              onClick={() => {
                                const updated = [...editValues.lastNote];
                                updated.splice(idx, 1);
                                setEditValues((prev) => ({ ...prev, lastNote: updated }));
                              }}
                            >
                              Xoá
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))
                  }
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
                f.key === "quantity" ? (
                  <input
                    type="number"
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

              )
            ) : (
              f.key === "personInCharge" ? (
                <div className="flex flex-col gap-2">
                  {Array.isArray(plan.personInCharge) && plan.personInCharge.length > 0 ? (
                    plan.personInCharge.map((email) => {
                      const user = allUsers.find((u) => u.email === email);
                      return (
                        <div key={email} className="flex items-center gap-3 border p-2 rounded bg-gray-50">
                          <img
                            src={user?.avatar || `https://i.pravatar.cc/40?u=${email}`}
                            className="w-8 h-8 rounded-full"
                            alt="avatar"
                          />
                          <div>
                            <div className="font-medium text-sm">{user?.name || email}</div>
                            <div className="text-xs text-gray-500">{email}</div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-sm italic text-gray-500">Không có người phụ trách</div>
                  )}
                </div>
              ) : f.key === "lastNote" ? (
                <div className="flex flex-col gap-2 text-sm">
                  {(Array.isArray(plan.lastNote) && plan.lastNote.length > 0) ? (
                    plan.lastNote.map((note, idx) => (
                      <div key={idx} className="bg-gray-50 border p-2 rounded">
                        <div className="text-gray-800 font-medium">{note.text}</div>
                        <div className="text-xs text-gray-500">{note.timestamp}</div>
                      </div>
                    ))
                  ) : (
                    <div className="text-gray-500 italic">Không có ghi chú nào</div>
                  )}
                </div>
              ) : f.isDate ? (
                <div className="text-sm">{formatDate(plan[f.key])}</div>
              ) : (
                <div className={"text-sm " + (f.multiline ? "whitespace-pre-wrap break-words" : "")}>
                  {plan[f.key] || "-"}
                </div>
              )
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
