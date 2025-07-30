import { BrowserRouter, Route, Routes } from "react-router-dom";
import {
  Dashboard,
  Login,
  Register,
  Role,
  ContentManagement,
  CustomerManagement,
  HomeService,
  MarketPlace,
  Settings,
  ShowcaseManagement,
  UserManagement,
  KioskPlanPage,
  KioskPlanDetail,        // ✅ thêm export từ Pages/index
} from "./Pages/index";
import Layout from "./Layout";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected layout with Menubar + Navbar */}
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/role-management" element={<Role />} />
          <Route path="/content-management" element={<ContentManagement />} />
          <Route path="/customer-management" element={<CustomerManagement />} />
          <Route path="/home-service" element={<HomeService />} />
          <Route path="/market-place" element={<MarketPlace />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/showcase-management" element={<ShowcaseManagement />} />
          <Route path="/user-management" element={<UserManagement />} />

          {/* Kiosk plans */}
          <Route path="/kiosk-plans" element={<KioskPlanPage />} />
          <Route path="/kiosk-plans/:id" element={<KioskPlanDetail />} /> {/* ✅ thêm */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
