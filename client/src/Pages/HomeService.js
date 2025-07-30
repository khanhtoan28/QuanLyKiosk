import React, { useEffect } from "react";

const HomeService = () => {
  useEffect(() => {
    document.title = "Home Service";
  }, []);

  return (
    <div className="p-6 text-gray-700">
      <p>Trang quản lý nội dung hiển thị ở đây.</p>
    </div>
  );
};

export default HomeService;