import { Routes, Route, Navigate } from "react-router-dom";

import Login  from "./pages/Login";
import Signup from "./pages/Signup";
import Admin  from "./pages/Admin";
import Owner  from "./pages/Owner";
import Stores from "./pages/Stores";

import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Routes>

      {/* Public */}
      <Route path="/login"  element={<Login />}  />
      <Route path="/signup" element={<Signup />} />

      {/* Admin only */}
      <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
        <Route path="/admin" element={<Admin />} />
      </Route>

      {/* Store Owner only */}
      <Route element={<ProtectedRoute allowedRoles={["store_owner"]} />}>
        <Route path="/owner" element={<Owner />} />
      </Route>

      {/* Any authenticated user */}
      <Route element={<ProtectedRoute />}>
        <Route path="/stores" element={<Stores />} />
      </Route>

      {/* Default */}
      <Route path="/"  element={<Navigate to="/login" replace />} />
      <Route path="*"  element={<Navigate to="/login" replace />} />

    </Routes>
  );
}

export default App;