import React from 'react';
import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white relative overflow-hidden">
      
      {/* Cool background glow effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/20 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="z-10 text-center px-4">
        <h1 className="text-6xl md:text-8xl font-black mb-6 tracking-tighter">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500">
            Graph
          </span>
          <br />
          Visualizer
        </h1>
        
        <p className="text-lg md:text-xl text-slate-400 mb-12 max-w-2xl mx-auto font-light leading-relaxed">
          A high-performance C++ WebAssembly engine. Simulate Dijkstra's, Bellman-Ford, and Floyd-Warshall algorithms in real-time with interactive node deletion and dynamic path recalculation.
        </p>

        <Link 
          to="/simulator" 
          className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white transition-all duration-200 bg-emerald-600 font-pj rounded-xl hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-600 shadow-[0_0_40px_rgba(16,185,129,0.4)] hover:shadow-[0_0_60px_rgba(16,185,129,0.6)] hover:-translate-y-1"
        >
          Launch Simulator
          <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
          </svg>
        </Link>
      </div>
    </div>
  );
}