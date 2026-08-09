import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutGrid, Users, Trophy, Calendar, Award, Medal, } from 'lucide-react';

export default function Sidebar() {
    const location = useLocation();

    const menuItems = [
        { path: '/', label: 'Tableau de bord', icon: LayoutGrid },
        { path: '/athletes', label: 'Athlètes', icon: Users },
        { path: '/disciplines', label: 'Disciplines', icon: Trophy },
        { path: '/epreuves', label: 'Épreuves', icon: Calendar },
        { path: '/resultats', label: 'Résultats', icon: Award },
        { path: '/medailles', label: 'Médailles', icon: Medal },
    ];

    return (
        <aside className="w-64 bg-[#0f1e3d] text-white h-screen sticky left-0 top-0 flex flex-col justify-between z-50 p-4">
            <div>

                {/* HEADER ANNEAUX JOJ */}
                <div className="pt-5 px-5 pb-4 border-b border-white/10">
                    <div className="flex items-center gap-2.5 mb-1">
                        <OlympicRings />
                    </div>
                    <p className="text-[11px] font-semibold text-[#c9a227] tracking-widest uppercase mt-2.5">
                        Olympic Management
                    </p>
                    <h1 className="text-base font-extrabold text-white leading-tight">
                        Dakar 2026
                    </h1>
                </div>

                <nav className="py-3 space-y-1">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path || (item.path === '/dashboard' && location.pathname === '/');
                        
                        return (
                            <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center gap-3 w-full py-2.5 px-5 border-l-4 transition-all duration-150 text-left ${isActive
                                ? 'bg-[#c9a227]/15 border-[#c9a227] text-white font-semibold'
                                : 'border-transparent text-white/60 hover:bg-white/5 hover:text-white font-normal'
                                    }`}
                            >
                                <Icon
                                    className={`w-5 h-5 shrink-0 ${isActive ? 'text-[#c9a227]' : 'text-white/45'
                                    }`}
                                    />
                                <span className="text-xs tracking-wide">
                                    {item.label}
                                </span>
                            </Link>
                        );
                    })}
                </nav>
            </div>

            <div className="py-4 px-5 border-t border-white/10">
                <div className="text-[10px] text-white/30 tracking-wider">
                    &copy; Adiouma Kane | UN-CHK
                </div>
            </div>
        </aside>
    );
}

{/* FUNC ANNEAUX JOJ */}
function OlympicRings() {
    const colors = ['#0085c7', '#f4c300', '#000000', '#009f3d', '#df0024'];
    return (
        <svg width="80" height="32" viewBox="0 0 80 32">
            {[0, 1, 2, 3, 4].map((i) => (
                <circle
                    key={i}
                    cx={8 + i * 16}
                    cy={i % 2 === 0 ? 10 : 18}
                    r={7}
                    fill="none"
                    stroke={colors[i]}
                    strokeWidth={2.5}
                />
            ))}
        </svg>
    );
}