import React, { useEffect } from "react";

const ContentManagement = () => {
  useEffect(() => {
    document.title = "Content Management";
  }, []);

  return (
    <div className="p-6 text-gray-700">
      <p>Trang quản lý nội dung hiển thị ở đây.</p>
    </div>
  );
};

export default ContentManagement;
