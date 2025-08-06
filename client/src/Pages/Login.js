
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { logo, background } from "../Assets/index";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    document.title = "Đăng nhập";
  }, []);

  const navigate = useNavigate();

  const loginUser = async (event) => {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (response.ok) {
        const user = data.data.user;
        localStorage.setItem("token", data.data.token);
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("userId", user.id || user._id);

        // ✅ Thêm sự kiện tắt tab
        window.addEventListener("beforeunload", () => {
          const payload = JSON.stringify({ isOnline: false });
          const blob = new Blob([payload], { type: "application/json" });
          navigator.sendBeacon(`http://localhost:5000/api/users/${user.id}/status`, blob);
        });

        setSuccessMessage("Đăng nhập thành công!");
        setTimeout(() => {
          navigate("/dashboard");
        }, 1500);


      } else {
        setErrorMessage(data.message || "Đăng nhập thất bại");
      }
    } catch (error) {
      console.error("Lỗi kết nối:", error);
      setErrorMessage("Không thể kết nối đến máy chủ. Vui lòng thử lại sau.");
    }
  };

  return (
    <div
      className="flex flex-col items-center justify-center h-screen"
      style={{ backgroundImage: `url(${background})`, backgroundSize: "cover" }}
    >
      <div className="text-center bg-white p-6 rounded-lg shadow-lg min-w-[300px] max-w-sm w-full">
        <img className="w-40 h-auto mx-auto mb-6" src={logo} alt="logo" />

        <h1 className="text-2xl font-bold mb-2 text-gray-700">Login</h1>
        <p className="text-gray-500 mb-6">
          Bạn chưa có tài khoản?{' '}
          <span
            onClick={() => navigate("/register")}
            className="text-blue-600 cursor-pointer"
          >
            Đăng ký ngay
          </span>
        </p>

        {errorMessage && (
          <div className="mb-4 p-3 bg-red-100 border border-red-500 text-red-700 rounded">
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3 bg-green-100 border border-green-500 text-green-700 rounded">
            {successMessage}
          </div>
        )}

        <form onSubmit={loginUser} className="text-left">
          <div className="mb-4">
            <label className="block mb-1 text-sm font-medium text-gray-600">Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="Nhập email"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:border-blue-400"
            />
          </div>

          <div className="mb-4">
            <label className="block mb-1 text-sm font-medium text-gray-600">Mật khẩu</label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              placeholder="Nhập mật khẩu"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:border-blue-400"
            />
          </div>

          <div className="flex justify-between items-center mb-4">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded w-full transition duration-300"
            >
              Đăng nhập
            </button>
          </div>

          <div className="text-right">
            <span className="text-sm text-gray-500 hover:text-gray-700 cursor-pointer">
              Forgot password?
            </span>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;