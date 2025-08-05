import { BrowserRouter, Route, Routes } from "react-router-dom";
import {
  Dashboard,
  Login,
  Register,
  Role,
  Settings,
  KioskPlanPage,
  KioskPlanDetail,
  KioskPlanCreate,
  ProfilePage
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
          <Route path="/settings" element={<Settings />} />
          {/* Kiosk plans */}
          <Route path="/kiosk-plans" element={<KioskPlanPage />} />
          <Route path="/kiosk-plans/:id" element={<KioskPlanDetail />} /> {/* ✅ thêm */}
          <Route path="/kiosk-plans/create" element={<KioskPlanCreate />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
