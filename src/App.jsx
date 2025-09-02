// src/App.jsx
import React from "react";
import { Content } from "@carbon/react";
import HeaderBar from "./components/HeaderBar";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Glossary from "./pages/Glossary";
import Letter from "./pages/Letter"; // 🔥 new page

function App({ toggleTheme, theme }) {
  return (
    <BrowserRouter basename="/glossary-of-research-terms">
      <HeaderBar theme={theme} toggleTheme={toggleTheme} />
      <Content>
        <Routes>
          <Route path="/" element={<Glossary />} />
          <Route path="/letter/:letter" element={<Letter />} /> {/* 🔥 new route */}
          <Route path="*" element={<Glossary />} />
        </Routes>
      </Content>
    </BrowserRouter>
  );
}

export default App;