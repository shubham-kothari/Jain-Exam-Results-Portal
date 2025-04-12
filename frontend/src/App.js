import React from "react";
import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import CreatePage from "./pages/CreatePage";
import Result from "./pages/Result";
import "./App.scss"
const App = () => {
  return (
    <Routes>
      <Route path="/bulkresult" element={<Result />} />
      <Route path="/" element={<HomePage />} />
      <Route path="/create" element={<CreatePage />} />
    </Routes>
  );
};

export default App;
