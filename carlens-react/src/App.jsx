import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";

import Home from "./pages/Home";
import Predict from "./pages/Predict";
import Compare from "./pages/Compare";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";

function ProtectedRoute({ children }) {
  const isLoggedIn =
    localStorage.getItem("carlensLoggedIn") === "true";

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* PUBLIC */}
        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        {/* PROTECTED */}
        <Route
          path="/predict"
          element={
            <ProtectedRoute>
              <Predict />
            </ProtectedRoute>
          }
        />

        <Route
          path="/compare"
          element={
            <ProtectedRoute>
              <Compare />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* UNKNOWN URL */}
        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;