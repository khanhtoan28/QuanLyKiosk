import React, { useEffect } from "react";

const CustomerManagement = () => {
  useEffect(() => {
    document.title = "Customer Management";
  }, []);

  return (
    <div className="p-6 text-gray-700">
      <p>Trang quản lý nội dung hiển thị ở đây.</p>
    </div>
  );
};

export default CustomerManagement;
