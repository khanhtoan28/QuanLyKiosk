import { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { see, remove, change } from "../Assets/index";
import { FiEye, FiEyeOff } from "react-icons/fi";


const normalizeText = (str) =>
  str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "");

const UsersTable = () => {
  const [users, setUsers] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUser, setNewUser] = useState({ name: "", email: "", password: "" });
  const [editingUser, setEditingUser] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", email: "", role: "user" });


  const fetchUsers = async () => {
    const response = await axios.get("http://localhost:5000/api/users");
    setUsers(response.data?.data || []);

  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSearch = (event) => {
    setSearchText(event.target.value);
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Bạn có chắc chắn?",
      text: "Thao tác này sẽ xoá người dùng khỏi hệ thống!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Xoá",
      cancelButtonText: "Huỷ",
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`http://localhost:5000/api/users/${id}`);
        Swal.fire("✅ Đã xoá!", "Người dùng đã bị xoá khỏi hệ thống.", "success");
        fetchUsers(); // Cập nhật lại danh sách
      } catch (err) {
        console.error(err);
        Swal.fire("❌ Lỗi", "Không thể xoá người dùng", "error");
      }
    }
  };

  const filteredUsers = users.filter((user) =>
    normalizeText(user.name).includes(normalizeText(searchText)) ||
    normalizeText(user.email).includes(normalizeText(searchText))
  );
  const handleAddUser = async (e) => {
    e.preventDefault();

    if (!newUser.name || !newUser.email || !newUser.password) {
      Swal.fire("❗ Lỗi", "Vui lòng điền đầy đủ thông tin", "warning");
      return;
    }

    try {
      const res = await axios.post("http://localhost:5000/api/register", {
        ...newUser,
        role: "user",
      });

      if (res.status === 201) {
        Swal.fire("✅ Thành công", "Đã thêm người dùng mới!", "success");
        setShowAddUserModal(false);
        setNewUser({ name: "", email: "", password: "" });
        fetchUsers();
      }
    } catch (err) {
      console.error(err);
      Swal.fire("❌ Lỗi", err.response?.data?.message || "Đăng ký thất bại!", "error");
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mx-4 my-8">
        <div className="w-1/3 relative">
          <input
            type="text"
            placeholder="🔎 Tìm tên hoặc email người dùng..."
            value={searchText}
            onChange={handleSearch}
            className="border px-3 py-2 rounded w-64 text-sm"
          />
        </div>
        <div>
          <button
            className="border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white font-medium py-1 px-2 rounded-md transition"
            onClick={() => setShowAddUserModal(true)}
          >
            ➕ Thêm người dùng
          </button>


        </div>
      </div>
      <table className="min-w-full table-fixed text-sm text-left border">
        <thead className="bg-gray-800 text-white text-left text-sm">
          <tr>
            <th className="px-4 py-6 border text-center w-[50px]">STT</th>
            <th className="px-4 py-6 border text-center w-[200px]">Họ tên</th>
            <th className="px-4 py-6 border text-center w-[250px]">Email</th>
            <th className="px-4 py-6 border text-center w-[150px]">Phân quyền</th>
            <th className="px-4 py-6 border text-center w-[150px]">Trạng thái</th>
            <th className="px-4 py-6 border text-center w-[120px]">Hành động</th>
          </tr>
        </thead>

        <tbody>
          {filteredUsers.map((user, index) => (
            <tr
              key={user._id}
              className="border-t hover:bg-gray-50 h-[48px]"
            >

              <td className="px-4 py-4 border text-center">{index + 1}</td>
              <td className="px-4 py-4 border text-center">{user.name}</td>
              <td className="px-4 py-4 border text-center">{user.email}</td>
              <td className="px-4 py-4 border text-center">
                <span className={`capitalize font-medium ${user.role === "admin" ? "text-red-600" : "text-gray-700"}`}>
                  {user.role}
                </span>
              </td>

              <td className="px-4 py-4 border text-center">
                {user.isOnline ? (
                  <span className="text-green-600 font-medium">Đang hoạt động</span>
                ) : (
                  <span className="text-gray-500 italic">Không hoạt động</span>
                )}
              </td>

              <td className="px-4 py-4 border text-center">
                <div className="flex flex-row justify-center gap-3 cursor-pointer items-center">
                  <img
                    src={change}
                    alt="edit"
                    onClick={() => {
                      setEditingUser(user);
                      setEditForm({
                        name: user.name,
                        email: user.email,
                        role: user.role,
                      });
                    }}
                  />

                  <img src={see} alt="see" />
                  <img src={remove} alt="remove" onClick={() => handleDelete(user._id)} />
                </div>
              </td>

            </tr>
          ))}
        </tbody>
      </table>
      {showAddUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-lg relative">
            <h2 className="text-xl font-semibold mb-4">Thêm người dùng mới</h2>
            <form onSubmit={handleAddUser} className="space-y-4">
              <div>
                <label className="block text-sm">Họ tên</label>
                <input
                  type="text"
                  className="w-full border p-2 rounded"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm">Email</label>
                <input
                  type="email"
                  className="w-full border p-2 rounded"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                />
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  className="w-full border p-2 rounded pr-10"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                />
                <div
                  className="absolute top-1/2 -translate-y-1/2 right-3 text-gray-600 cursor-pointer"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                </div>

              </div>

              <div>
                <label className="block text-sm">Vai trò</label>
                <select
                  value={newUser.role || "user"}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  className="w-full border p-2 rounded"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="flex justify-between items-center mt-4">
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                >
                  Tạo tài khoản
                </button>
                <button
                  type="button"
                  className="text-red-500 hover:underline"
                  onClick={() => setShowAddUserModal(false)}
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-lg relative">
            <h2 className="text-xl font-semibold mb-4">Sửa người dùng</h2>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                try {
                  await axios.put(`http://localhost:5000/api/users/${editingUser._id}`, {
                    name: editForm.name,
                    email: editForm.email,
                  });
                  if (editingUser.role !== editForm.role) {
                    await axios.put(`http://localhost:5000/api/users/${editingUser._id}/role`, {
                      role: editForm.role,
                    });
                  }

                  Swal.fire("✅ Thành công", "Đã cập nhật người dùng!", "success");
                  setEditingUser(null);
                  fetchUsers();
                } catch (err) {
                  console.error(err);
                  Swal.fire("❌ Lỗi", "Không thể cập nhật người dùng", "error");
                }
              }}

              className="space-y-4"
            >
              <div>
                <label className="block text-sm">Họ tên</label>
                <input
                  type="text"
                  className="w-full border p-2 rounded"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm">Email</label>
                <input
                  type="email"
                  className="w-full border p-2 rounded"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm">Vai trò</label>
                <select
                  className="w-full border p-2 rounded"
                  value={editForm.role}
                  onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="flex justify-between items-center mt-4">
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                >
                  Lưu thay đổi
                </button>
                <button
                  type="button"
                  className="text-red-500 hover:underline"
                  onClick={() => setEditingUser(null)}
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default UsersTable;
