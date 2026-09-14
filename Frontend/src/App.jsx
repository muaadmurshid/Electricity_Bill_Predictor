import {
  Route,
  Routes,
} from "react-router-dom";

import AdminTariffs from "./pages/AdminTariffs";
import AdminUsers from "./pages/AdminUsers";
import AdminRoute from "./routes/AdminRoute";
import AdminDashboard from "./pages/AdminDashboard";

import { AuthProvider } from "./context/AuthContext";

import ProtectedRoute from "./routes/ProtectedRoute";
import PublicOnlyRoute from "./routes/PublicOnlyRoute";

import MainLayout from "./components/layout/MainLayout";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";

import Dashboard from "./pages/Dashboard";
import Household from "./pages/Household";
import Rooms from "./pages/Rooms";
import Appliances from "./pages/Appliances";
import DailyUsage from "./pages/DailyUsage";
import Bills from "./pages/Bills";
import Predictions from "./pages/Predictions";
import Analytics from "./pages/Analytics";
import TariffIntelligence from "./pages/TariffIntelligence";
import Budget from "./pages/Budget";
import Goals from "./pages/Goals";
import Recommendations from "./pages/Recommendations";
import Notifications from "./pages/Notifications";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route
          path="/"
          element={<Landing />}
        />

        <Route
          element={<PublicOnlyRoute />}
        >
          <Route
            path="/login"
            element={<Login />}
          />

          <Route
            path="/register"
            element={<Register />}
          />
        </Route>

        <Route
          element={<ProtectedRoute />}
        >
          <Route
            element={<MainLayout />}
          >
            <Route
              path="/dashboard"
              element={<Dashboard />}
            />

            <Route
              path="/households"
              element={<Household />}
            />

            <Route
              path="/rooms"
              element={<Rooms />}
            />

            <Route
              path="/appliances"
              element={<Appliances />}
            />

            <Route
              path="/usage"
              element={<DailyUsage />}
            />

            <Route
              path="/daily-usage"
              element={<DailyUsage />}
            />

            <Route
              path="/bills"
              element={<Bills />}
            />

            <Route
              path="/predictions"
              element={<Predictions />}
            />

            <Route
              path="/analytics"
              element={<Analytics />}
            />

            <Route
              path="/tariff-intelligence"
              element={<TariffIntelligence />}
            />

            <Route
              path="/budget"
              element={<Budget />}
            />

            <Route
              path="/goals"
              element={<Goals />}
            />

            <Route
              path="/recommendations"
              element={<Recommendations />}
            />

            <Route
              path="/notifications"
              element={<Notifications />}
            />

            <Route
              path="/profile"
              element={<Profile />}
            />
          </Route>
        </Route>

        <Route
          element={<AdminRoute />}
        >
          <Route
            element={<MainLayout />}
          >
            <Route
              path="/admin/dashboard"
              element={<AdminDashboard />}
            />
          </Route>

          <Route
            path="/admin/users"
            element={<AdminUsers />}
          />

          <Route
            path="/admin/tariffs"
            element={<AdminTariffs />}
          />
        </Route>

        <Route
          path="*"
          element={<NotFound />}
        />
      </Routes>
    </AuthProvider>
  );
}