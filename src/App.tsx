import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import HomePage from "./pages/HomePage";
import AnalysePage from "./pages/AnalysePage";
import URLCheckerPage from "./pages/URLCheckerPage";
import DashboardPage from "./pages/DashboardPage";
import ModelPerformancePage from "./pages/ModelPerformancePage";
import ReportPage from "./pages/ReportPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import HistoryPage from "./pages/HistoryPage";
import AdminPage from "./pages/AdminPage";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./auth/AuthContext";

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc]">
      <Navbar />
      <div className="flex-1">{children}</div>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider><Routes>
        <Route path="/" element={<Layout><HomePage /></Layout>} />
        <Route path="/analyse" element={<Layout><AnalysePage /></Layout>} />
        <Route path="/url-checker" element={<Layout><URLCheckerPage /></Layout>} />
        <Route path="/dashboard" element={<Layout><DashboardPage /></Layout>} />
        <Route path="/model-performance" element={<Layout><ModelPerformancePage /></Layout>} />
        <Route path="/report" element={<ProtectedRoute><Layout><ReportPage /></Layout></ProtectedRoute>} />
        <Route path="/history" element={<ProtectedRoute><Layout><HistoryPage /></Layout></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute roles={["admin"]}><Layout><AdminPage /></Layout></ProtectedRoute>} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="*" element={<Layout>
          <div className="min-h-screen pt-16 flex items-center justify-center">
            <div className="text-center">
              <div className="text-5xl font-bold text-slate-200 mb-3" style={{ fontFamily: "DM Sans, sans-serif" }}>404</div>
              <div className="text-slate-600 mb-4">Page not found</div>
              <a href="/" className="text-blue-600 hover:underline text-sm">← Back to home</a>
            </div>
          </div>
        </Layout>} />
      </Routes></AuthProvider>
    </BrowserRouter>
  );
}
