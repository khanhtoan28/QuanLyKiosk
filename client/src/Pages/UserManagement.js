import React, { useEffect } from "react";

const UserManagement = () => {
  useEffect(() => {
    document.title = "User Management";
  }, []);

  return (
    <div className="p-6 text-gray-700">
      <p>Trang quản lý nội dung hiển thị ở đây.</p>
    </div>
  );
};

export default UserManagement;
