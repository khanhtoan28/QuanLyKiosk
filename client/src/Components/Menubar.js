import React, { useState, useEffect } from "react";
import {
  logo,
  dashboard,
  showcase,
  settings,
  user
} from "../Assets/index";
import { getUser } from "../utils/auth";
import { useLocation, Link } from "react-router-dom";

const Menubar = () => {
  const [userRole, setUserRole] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const user = getUser();
    setUserRole(user?.role);
  }, []);

  const menuItems = [
    { name: "Dashboard", icon: dashboard, link: "/dashboard" },
    { name: "Hiện trạng triển khai", icon: showcase, link: "/kiosk-plans" },

    ...(userRole === "admin"
      ? [{ name: "Quản lý tài khoản", icon: user, link: "/role-management" }]
      : []),
    { name: "Settings", icon: settings, link: "/settings" },
  ];

  return (
    <div className="flex flex-col h-full w-full">
      <div className="flex items-center justify-center h-20">
        <Link to="/kiosk-plans">
          <img
            src={logo}
            alt="Company Logo"
            className="h-24 w-auto pt-3 px-4 cursor-pointer"
          />
        </Link>
      </div>

      <div className="flex-1 flex flex-col justify-start pt-20">
        <span className="px-5 py-2 text-black">Menu</span>
        {menuItems.map((item, index) => {
          const isActive = location.pathname === item.link;

          return (
            <Link
              key={index}
              to={item.link}
              className={`w-full px-4 py-3 flex items-center gap-2 rounded-lg transition-all
                ${
                  isActive
                    ? "bg-[#4586f3] text-white font-semibold"
                    : "text-gray-700 hover:bg-[#e8f0fe] hover:text-[#4586f3]"
                }`}
            >
              <img src={item.icon} alt={item.name} className="h-5 w-5" />
              <span className="whitespace-nowrap">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default Menubar;
