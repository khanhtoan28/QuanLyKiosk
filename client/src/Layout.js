import React from "react";
import Menubar from "./Components/Menubar";
import Navbar from "./Components/Navbar";
import { Outlet, useLocation } from "react-router-dom";

const Layout = () => {
  const location = useLocation();
  const page = location.pathname.split("/")[1] || "Dashboard";

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
        </div>
      </div>
    </div>
  );
};

export default Layout;
