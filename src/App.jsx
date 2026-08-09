import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Trophy, Calendar, Award, Medal } from 'lucide-react';

import Dashboard from './pages/Dashboard';
import Athletes from './pages/Athletes';
import Disciplines from './pages/Disciplines';
import Epreuves from './pages/Epreuves';
import Resultats from './pages/Resultats';
import Medailles from './pages/Medailles';
import Sidebar from './components/Layout/Sidebar';

export default function App() {
  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive
      ? 'bg-indigo-600 text-white'
      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
    }`;

  return (
    <Router>
      <div className="flex min-h-screen bg-slate-100">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/athletes" element={<Athletes />} />
            <Route path="/disciplines" element={<Disciplines />} />
            <Route path="/epreuves" element={<Epreuves />} />
            <Route path="/resultats" element={<Resultats />} />
            <Route path="/medailles" element={<Medailles />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}