import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";

import LoginPage from "@/pages/auth/LoginPage";
import SignupPage from "@/pages/auth/SignupPage";
import ForgotPasswordPage from "@/pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "@/pages/auth/ResetPasswordPage";
import StudentDashboard from "@/pages/student/StudentDashboard";
import ScanPage from "@/pages/student/ScanPage";
import HistoryPage from "@/pages/student/HistoryPage";
import StaffDashboard from "@/pages/staff/StaffDashboard";
import FoodPrepPage from "@/pages/staff/FoodPrepPage";
import WasteEntryPage from "@/pages/staff/WasteEntryPage";
import StaffPanel from "@/pages/staff/StaffPanel";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import ReportsPage from "@/pages/admin/ReportsPage";
import QRGenerator from "@/pages/admin/QRGenerator";
import AllStudentsQR from "@/pages/admin/AllStudentsQR";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* Student routes */}
          <Route path="/student" element={<ProtectedRoute allowedRoles={["student"]}><StudentDashboard /></ProtectedRoute>} />
          <Route path="/student/scan" element={<ProtectedRoute allowedRoles={["student"]}><ScanPage /></ProtectedRoute>} />
          <Route path="/student/history" element={<ProtectedRoute allowedRoles={["student"]}><HistoryPage /></ProtectedRoute>} />

          {/* Staff routes */}
          <Route path="/staff" element={<ProtectedRoute allowedRoles={["staff"]}><StaffDashboard /></ProtectedRoute>} />
          <Route path="/staff/food-prep" element={<ProtectedRoute allowedRoles={["staff"]}><FoodPrepPage /></ProtectedRoute>} />
          <Route path="/staff/waste" element={<ProtectedRoute allowedRoles={["staff"]}><WasteEntryPage /></ProtectedRoute>} />
          <Route path="/staff/panel" element={<ProtectedRoute allowedRoles={["staff"]}><StaffPanel /></ProtectedRoute>} />

          {/* Admin routes */}
          <Route path="/admin" element={<ProtectedRoute allowedRoles={["admin"]}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/reports" element={<ProtectedRoute allowedRoles={["admin"]}><ReportsPage /></ProtectedRoute>} />
          <Route path="/admin/qr-generator" element={<ProtectedRoute allowedRoles={["admin"]}><QRGenerator /></ProtectedRoute>} />
          <Route path="/admin/students-qr" element={<ProtectedRoute allowedRoles={["admin"]}><AllStudentsQR /></ProtectedRoute>} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;