import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { logo, background } from "../Assets/index";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
        useEffect(() => {
      document.title = "Đăng ký";
    }, []); // vẫn cần để gửi backend

  const [emailError, setEmailError] = useState("");
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState("success");


  const navigate = useNavigate();

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (email) {
        checkEmailExists(email);
      }
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [email]);

  const checkEmailExists = async (emailToCheck) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/check-email?email=${emailToCheck}`
      );
      const data = await response.json();
      if (data.exists) {
        setEmailError("Email đã tồn tại!");
      } else {
        setEmailError("");
      }
    } catch (err) {
      console.error("Lỗi khi kiểm tra email:", err);
    }
  };

  const registerUser = async (event) => {
    event.preventDefault();

    if (!name || !email || !password) {
      setMessage("❗ Vui lòng điền đầy đủ thông tin!");
      setMessageType("error");
      return;
    }

    if (emailError) return;

    const selectedRole = email === "admin@gmail.com" ? "admin" : "user";
    setRole(selectedRole);

    try {
      const response = await fetch("http://localhost:5000/api/register", {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
          role: selectedRole,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("🎉 Đăng ký thành công!");
        setMessageType("success");
        setTimeout(() => navigate("/"), 1500);
      } else {
        setMessage(data.message || "❌ Đăng ký thất bại!");
        setMessageType("error");
      }
    } catch (error) {
      setMessage("❌ Lỗi kết nối đến server!");
      setMessageType("error");
    }

    setTimeout(() => {
      setMessage(null);
    }, 3000);
  };

  return (
    <div
      className="flex items-center justify-center h-screen"
      style={{
        backgroundImage: `url(${background})`,
        backgroundSize: "cover",
      }}
    >
      <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-sm">
        <div className="text-center mb-5">
          <img className="w-48 h-auto mx-auto mb-6" src={logo} alt="logo" />
          <h1 className="text-3xl font-bold text-gray-700 mb-2">Đăng ký</h1>
        </div>

        {message && (
          <div
            className={`mb-4 px-4 py-3 rounded-lg text-white font-medium shadow transition-all duration-300 ${
              messageType === "success" ? "bg-green-500" : "bg-red-500"
            }`}
          >
            {message}
          </div>
        )}

        <form onSubmit={registerUser} className="space-y-4">
          <div>
            <label className="block mb-1">Họ tên</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Họ tên"
              type="text"
              className="w-full px-4 py-3 border rounded-lg"
            />
          </div>

          <div>
            <label className="block mb-1">Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              type="email"
              className={`w-full px-4 py-3 border rounded-lg ${
                emailError ? "border-red-500" : ""
              }`}
            />
            {emailError && (
              <p className="text-red-500 text-sm mt-1">{emailError}</p>
            )}
          </div>

          <div>
            <label className="block mb-1">Mật khẩu</label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mật khẩu"
              type="password"
              className="w-full px-4 py-3 border rounded-lg"
            />
          </div>

          {/* Role ẩn, không hiển thị dropdown */}
          <input type="hidden" value={role} readOnly />

          <div className="mt-6">
            <div className="flex justify-center">
              <button
                type="submit"
                disabled={!!emailError}
                className={`${
                  emailError
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                } text-white py-2 px-6 rounded`}
              >
                Đăng ký
              </button>
            </div>
            <div className="flex justify-center mt-4 text-sm text-gray-600">
              <span>Bạn đã có tài khoản?</span>
              <button
                onClick={() => navigate("/")}
                className="ml-1 text-blue-600 hover:text-blue-800 font-medium"
              >
                Đăng nhập
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
