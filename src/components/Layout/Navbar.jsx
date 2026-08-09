import React from 'react';
import { Search, Bell, Settings } from 'lucide-react';
import profileIcon from '../../assets/icons/jeux-olympiques-icon.png';

const Navbar = ({ title }) => {
    return (
        <header className="h-16 bg-white border-b border-slate-200 w-full px-8 flex items-center justify-between sticky top-0 z-40">
            <div>
                <p className="tracking-wider uppercase font-semibold text-slate-400">
                    OMS &#x2022; DAKAR 2026
                </p>
                <h1 className="text-sm font-bold text-[#1a2f5e] leading-tight">
                    {title}
                </h1>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative w-72">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Recherche rapide..."
                        className="w-full bg-slate-100/70 border border-transparent rounded-lg pl-9 pr-4 py-1.5 text-sm text-slate-700 focus:outline-none focus:bg-white focus:border-slate-300"
                    />
                </div>

                <button className="relative p-2 rounded-lg text-slate-500 hover:bg-slate-100 border border-slate-200">
                    <Bell className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>

                <button className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 border border-slate-200">
                    <Settings className="w-4 h-4" />
                </button>

                <div className="w-9 h-9">
                    <img
                        src={profileIcon}
                        alt="Profil Dashboard"
                        className="w-full h-full object-cover"
                    />
                </div>
            </div>
        </header>
    );
};

export default Navbar;