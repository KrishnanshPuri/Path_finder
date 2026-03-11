import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import Simulator from './components/Simulator';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* The Landing Page is the first thing you see ("/") */}
        <Route path="/" element={<LandingPage />} />
        
        {/* The Simulator loads when you click the button ("/simulator") */}
        <Route path="/simulator" element={<Simulator />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;