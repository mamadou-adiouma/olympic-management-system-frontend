import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { User, Globe, Star, Calendar, AlertTriangle } from 'lucide-react';
import Navbar from '../components/Layout/Navbar';

export default function Dashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const response = await api.get('/dashboard/stats');
            const data = response.data?.data || response.data;
            setStats(data);
        } catch (err) {
            setError('Impossible de charger les statistiques du tableau de bord.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="p-8 text-center text-slate-400 font-medium">Chargement des données...</div>;
    }

    if (error) {
        return (
            <div className="p-4 bg-rose-50 text-rose-700 rounded-lg flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                <span>{error}</span>
            </div>
        );
    }

    // LOGIQUE DONNEES KPIs CARDS
    const totalAthletes = stats?.total_athletes ?? 0;
    const athletesNouveaux = stats?.athletes_nouveaux_aujourdhui ?? 0;

    const paysParticipants = stats?.total_pays ?? 0;

    const medaillesOr = Number(stats?.medailles_or ?? 0);
    const medaillesArgent = Number(stats?.medailles_argent ?? 0);
    const medaillesBronze = Number(stats?.medailles_bronze ?? 0);
    const totalMedailles = stats?.total_medailles ?? (medaillesOr + medaillesArgent + medaillesBronze);

    const epreuvesAujourdhui = stats?.epreuves_aujourdhui?.total ?? 0;
    const epreuvesEnCours = stats?.epreuves_aujourdhui?.en_cours ?? 0;
    const epreuvesProgrammees = stats?.epreuves_aujourdhui?.programmees ?? 0;

    const chartData = stats?.evolution_medailles || [];
    const maxVal = Math.max(
        1,
        ...chartData.flatMap(item => [item.or || 0, item.argent || 0, item.bronze || 0])
    );

    const topCountries = stats?.top_pays || [];

    return (
        <section className="space-y-6">
            <Navbar title="Tableau de bord"/>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Dashboard · Dakar 2026</h1>
                    <p className="text-slate-500 text-xs">Vue d'ensemble des Jeux Olympiques de la Jeunesse</p>
                </div>
            </div>

            { /* VUES DONNEES KPIs CARDS */ }
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 px-6">
                <div className="bg-white p-5 rounded-xl border-t-4 border-t-indigo-600 border border-slate-200 shadow-sm flex flex-col justify-between h-32">
                    <div className="flex items-center justify-between text-slate-400">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">TOTAL ATHLÈTES</span>
                        <User className="w-5 h-5 text-slate-600" />
                    </div>
                    <div>
                        <p className="text-3xl font-black text-slate-900">{totalAthletes}</p>
                        <p className="text-xs text-slate-400 mt-1 font-medium">
                            {athletesNouveaux > 0 ? `+${athletesNouveaux} depuis hier` : 'Base à jour'}
                        </p>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-xl border-t-4 border-t-emerald-500 border border-slate-200 shadow-sm flex flex-col justify-between h-32">
                    <div className="flex items-center justify-between text-slate-400">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">PAYS PARTICIPANTS</span>
                        <Globe className="w-5 h-5 text-emerald-500" />
                    </div>
                    <div>
                        <p className="text-3xl font-black text-slate-900">{paysParticipants}</p>
                        <p className="text-xs text-slate-400 mt-1 font-medium">Nations enregistrées</p>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-xl border-t-4 border-t-amber-400 border border-slate-200 shadow-sm flex flex-col justify-between h-32">
                    <div className="flex items-center justify-between text-slate-400">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">TOTAL MÉDAILLES</span>
                        <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                    </div>
                    <div>
                        <p className="text-3xl font-black text-slate-900">{totalMedailles}</p>
                        <div className="flex items-center gap-3 text-xs text-slate-500 mt-1 font-semibold">
                            <span className="flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-amber-400 inline-block"></span>Or {medaillesOr}
                            </span>
                            <span className="flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-slate-300 inline-block"></span>Ag {medaillesArgent}
                            </span>
                            <span className="flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-amber-700 inline-block"></span>Br {medaillesBronze}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-xl border-t-4 border-t-rose-500 border border-slate-200 shadow-sm flex flex-col justify-between h-32">
                    <div className="flex items-center justify-between text-slate-400">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">ÉPREUVES AUJOURD'HUI</span>
                        <Calendar className="w-5 h-5 text-rose-500" />
                    </div>
                    <div>
                        <p className="text-3xl font-black text-slate-900">{epreuvesAujourdhui}</p>
                        <p className="text-xs text-slate-400 mt-1 font-medium">
                            {epreuvesEnCours} en cours · {epreuvesProgrammees} programmées
                        </p>
                    </div>
                </div>

            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 px-6">
                <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                    <div>
                        <h2 className="text-lg font-bold text-[#1a2f5e]">Évolution des médailles</h2>
                        <p className="text-xs text-slate-400 mt-0.5">Distribution journalière · Dakar 2026</p>
                    </div>

                    <div className="mt-8 relative pt-6 pb-2">
                        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none text-[10px] text-slate-300">
                            <div className="border-b border-dashed border-slate-200 w-full flex justify-between"><span>{maxVal}</span></div>
                            <div className="border-b border-dashed border-slate-200 w-full flex justify-between"><span>{Math.round(maxVal * 0.75)}</span></div>
                            <div className="border-b border-dashed border-slate-200 w-full flex justify-between"><span>{Math.round(maxVal * 0.5)}</span></div>
                            <div className="border-b border-dashed border-slate-200 w-full flex justify-between"><span>{Math.round(maxVal * 0.25)}</span></div>
                            <div className="border-b border-slate-200 w-full flex justify-between"><span>0</span></div>
                        </div>

                        {chartData.length === 0 ? (
                            <div className="h-56 flex items-center justify-center text-slate-400 text-sm">
                                Aucune médaille attribuée pour l'instant.
                            </div>
                        ) : (
                            <div className="h-56 pl-6 flex items-end justify-between gap-2 relative z-10">
                                {chartData.map((item, idx) => (
                                    <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end">
                                        <div className="w-full flex items-end justify-center gap-1 h-full">
                                            <div
                                                style={{ height: `${((item.or || 0) / maxVal) * 100}%` }}
                                                className="w-2.5 bg-amber-400 rounded-t-sm transition-all duration-300 hover:opacity-80"
                                                title={`Or: ${item.or || 0}`}
                                            ></div>
                                            <div
                                                style={{ height: `${((item.argent || 0) / maxVal) * 100}%` }}
                                                className="w-2.5 bg-slate-300 rounded-t-sm transition-all duration-300 hover:opacity-80"
                                                title={`Argent: ${item.argent || 0}`}
                                            ></div>
                                            <div
                                                style={{ height: `${((item.bronze || 0) / maxVal) * 100}%` }}
                                                className="w-2.5 bg-amber-700 rounded-t-sm transition-all duration-300 hover:opacity-80"
                                                title={`Bronze: ${item.bronze || 0}`}
                                            ></div>
                                        </div>
                                        <span className="text-[11px] font-bold text-slate-500 mt-3">{item.day || item.date}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                    <div>
                        <h2 className="text-lg font-bold text-[#1a2f5e]">Classement des pays</h2>
                        <p className="text-xs text-slate-400 mt-0.5">Or ×{medaillesOr} · Argent ×{medaillesArgent} · Bronze ×{medaillesBronze}</p>
                    </div>

                    <div className="mt-4 overflow-x-auto">
                        {topCountries.length === 0 ? (
                            <div className="p-8 text-center text-slate-400 text-sm">Aucun classement disponible.</div>
                        ) : (
                            <table className="w-full text-left text-xs">
                                <thead>
                                    <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase text-[10px]">
                                        <th className="py-2.5 w-6">#</th>
                                        <th className="py-2.5">Pays</th>
                                        <th className="py-2.5 text-center text-amber-500">🥇</th>
                                        <th className="py-2.5 text-center text-slate-400">🥈</th>
                                        <th className="py-2.5 text-center text-amber-800">🥉</th>
                                        <th className="py-2.5 text-right font-black text-slate-700">Pts</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 font-medium">
                                    {topCountries.map((c, i) => {
                                        const rankStr = String(i + 1).padStart(2, '0');
                                        const gold = Number(c.or || c.gold || 0);
                                        const silver = Number(c.argent || c.silver || 0);
                                        const bronze = Number(c.bronze || 0);
                                        const pts = c.pts ?? ((gold * 7) + (silver * 4) + (bronze * 1));

                                        return (
                                            <tr key={i} className="hover:bg-slate-50 transition-colors">
                                                <td className="py-3 font-bold text-amber-600 font-mono">{rankStr}</td>
                                                <td className="py-3 font-bold text-slate-800">{c.pays || c.nationalite || c.nom_pays}</td>
                                                <td className="py-3 text-center text-slate-600 font-bold">{gold}</td>
                                                <td className="py-3 text-center text-slate-600 font-bold">{silver}</td>
                                                <td className="py-3 text-center text-slate-600 font-bold">{bronze}</td>
                                                <td className="py-3 text-right font-black text-[#1a2f5e] text-sm">{pts}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

            </div>
        </section>
    );
}