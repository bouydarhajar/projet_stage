import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./auth/login";
import ChefServiceDashboard from "./pages/chefService/Dashboard";
import ChefParcDashboard from "./pages/chefParc/Dashboard";

function PrivateRoute({ children }) {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/" replace />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route
          path="/chef-service/*"
          element={
            <PrivateRoute>
              <ChefServiceDashboard />
            </PrivateRoute>
          }
        />

        <Route
          path="/chef-parc"
          element={
            <PrivateRoute>
              <ChefParcDashboard />
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
