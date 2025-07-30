

import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { demouser } from "../Assets/index";
import { getUser, clearUser } from "../utils/auth";

const Navbar = ({ pagename }) => {
  const [userInfo, setUserInfo] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const user = getUser();
    setUserInfo(user);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    clearUser();
    navigate("/");
  };

  const handleProfile = () => {
    navigate("/profile");
  };

  return (
    <nav className="bg-white flex items-center justify-between h-20 px-8 shadow-sm">
      <div className="flex items-center">
        <h1 className="text-lg font-semibold text-gray-500 capitalize">
          {pagename || ""}
        </h1>

      </div>

      <div className="relative" ref={dropdownRef}>
        <div
          className="flex items-center cursor-pointer"
          onClick={() => setDropdownOpen(!dropdownOpen)}
        >
          <div className="rounded-full h-10 w-10 bg-gray-300 flex items-center justify-center mr-4">
            <img src={demouser} alt="avatar" className="rounded-full h-8 w-8" />
          </div>
          <div className="flex flex-col text-sm">
            <span className="font-medium">{userInfo?.name || "Unknown"}</span>
            <span>{userInfo?.role === "admin" ? "Super Admin" : "User"}</span>
          </div>
        </div>

        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-md z-10">
            <button
              onClick={handleProfile}
              className="block w-full text-left px-4 py-2 hover:bg-gray-100"
            >
              Hồ sơ cá nhân
            </button>
            <button
              onClick={handleLogout}
              className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-500"
            >
              Đăng xuất
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
