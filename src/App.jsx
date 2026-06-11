import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Simulator from './pages/Simulator';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/simulator" element={<Simulator />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;