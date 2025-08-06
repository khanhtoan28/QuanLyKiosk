import React, { useEffect } from "react";
import Menubar from "./Components/Menubar";
import Navbar from "./Components/Navbar";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import axios from "axios";
import "react-toastify/dist/ReactToastify.css";

const Layout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const page = location.pathname.split("/")[1] || "Dashboard";

  // Tự động kiểm tra nếu user bị xoá → logout
  useEffect(() => {
    const interval = setInterval(async () => {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user || !user._id) return;

      try {
        await axios.get(`http://localhost:5000/api/users/${user._id}`);
      } catch (err) {
        if (err.response?.status === 404) {
          toast.error("Tài khoản đã bị xoá. Đăng xuất...");
          localStorage.clear();
          setTimeout(() => {
            navigate("/");
            window.location.reload();
          }, 1500);
        }
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [navigate]);

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="w-[250px] fixed h-screen z-20 bg-gray-100">
        <Menubar />
      </div>
      <div className="flex-1 flex flex-col ml-[250px] h-screen">
        <div className="fixed top-0 left-[250px] right-0 z-10">
          <Navbar pagename={page} />
        </div>
        <div className="mt-20 p-4 overflow-y-auto h-full bg-gray-50">
          <Outlet />
          <ToastContainer />
        </div>
      </div>
    </div>
  );
};

export default Layout;
