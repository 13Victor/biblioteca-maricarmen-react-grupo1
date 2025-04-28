import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
// Make sure you're NOT importing BrowserRouter, HashRouter, etc. here
import CatalogSearchPage from "../components/CatalogSearchPage";
import ModoAdminCSV from "../components/ModoAdminCSV";
import LoanCreationForm from "../components/LoanCreationForm";
import LibrarianRoute from "../components/LibrarianRoute";
import HistorialPrestecs from "../components/HistorialPrestecs";

function AppRoutes() {
  return (
    // Only use Routes and Route here, NOT another Router
    <Routes>
      <Route path="/" element={<Navigate to="/cataleg" replace />} />
      <Route path="/csv-importacio" element={<ModoAdminCSV />} />
      <Route path="/cataleg" element={<CatalogSearchPage />} />

      <Route
        path="/crear-prestamo/:exemplarId"
        element={
          <LibrarianRoute>
            <LoanCreationForm />
          </LibrarianRoute>
        }
      />
      <Route path="/historial-prestecs" element={<HistorialPrestecs />} />
    </Routes>
  );
}

export default AppRoutes;
