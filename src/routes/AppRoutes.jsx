import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import CatalogSearchPage from "../components/CatalogSearchPage";
import ModoAdminCSV from "../components/ModoAdminCSV";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/cataleg" replace />} />

      <Route path="/csv-importacio" element={<ModoAdminCSV />} />
      <Route path="/cataleg" element={<CatalogSearchPage />} />
    </Routes>
  );
}

export default AppRoutes;
