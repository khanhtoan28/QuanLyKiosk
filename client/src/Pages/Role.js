import React, { useState, useEffect } from "react";
import MenuToggle from "../Components/MenuToggle";
import UsersTable from "../Components/Table";

const RoleManagement = () => {
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    document.title = "Quản lý tài khoản";
  }, []);

  const handleMenuToggle = () => {
    setShowMenu(!showMenu);
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="p-4">
        <MenuToggle showMenu={showMenu} handleMenuToggle={handleMenuToggle} />
      </div>
      <div className="flex-1 overflow-auto p-4">
        <UsersTable />
      </div>
    </div>
  );
};

export default RoleManagement;
