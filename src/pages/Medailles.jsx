import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Navbar from '../components/Layout/Navbar';
import Toast from '../components/Common/Toast';
import { Search, Plus, X, Medal, Award } from 'lucide-react';

export default function Medailles() {
    const [medailles, setMedailles] = useState([]);
    const [countries, setCountries] = useState([]);
    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState('');
    const [continentFilter, setContinentFilter] = useState('');
    const [sortBy, setSortBy] = useState('gold');

    const [stats, setStats] = useState({
        totalOr: 0,
        totalArgent: 0,
        totalBronze: 0,
        totalMedailles: 0
    });

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [toast, setToast] = useState({ message: '', type: 'success' });

    const [formData, setFormData] = useState({
        pays_id: '',
        type_medaille: 'OR',
        epreuve_nom: '',
        athlete_nom: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast({ message: '', type: 'success' }), 4000);
    };

    const fetchData = async () => {
        try {
            setLoading(true);
            const [resMedailles, resCountries] = await Promise.all([
                api.get('/medailles/tableau'),
                api.get('/countries').catch(() => ({ data: { data: [] } }))
            ]);

            const dataMedailles = resMedailles.data?.data || resMedailles.data || [];
            const dataCountries = resCountries.data?.data || resCountries.data || [];

            setMedailles(dataMedailles);
            setCountries(dataCountries);

            let gold = 0, silver = 0, bronze = 0;
            dataMedailles.forEach((item) => {
                gold += Number(item.or || item.gold || 0);
                silver += Number(item.argent || item.silver || 0);
                bronze += Number(item.bronze || 0);
            });

            setStats({
                totalOr: gold,
                totalArgent: silver,
                totalBronze: bronze,
                totalMedailles: gold + silver + bronze
            });

        } catch (err) {
            showToast('Erreur lors du chargement du tableau des médailles', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = () => {
        setFormData({
            pays_id: countries[0]?.id || '',
            type_medaille: 'OR',
            epreuve_nom: '',
            athlete_nom: ''
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/medailles/attribuer', formData);
            showToast('Médaille attribuée avec succès');
            setIsModalOpen(false);
            fetchData();
        } catch (err) {
            showToast("Erreur lors de l'attribution de la médaille", 'error');
        }
    };

    const continents = Array.from(new Set(medailles.map(m => m.continent))).filter(Boolean);

    const processedMedailles = medailles.map((m) => {
        const gold = Number(m.or || m.gold || 0);
        const silver = Number(m.argent || m.silver || 0);
        const bronze = Number(m.bronze || 0);
        const total = Number(m.total ?? (gold + silver + bronze));
        const points = Number(m.points ?? ((gold * 7) + (silver * 4) + (bronze * 1)));

        const nomPays = m.nationalite || m.nom_pays || '';
        const isoPays = m.iso_pays || m.iso_code || '';

        return {
            ...m,
            nomPays,
            isoPays,
            gold,
            silver,
            bronze,
            total,
            points
        };
    });

    const filteredMedailles = processedMedailles
        .filter((item) => {
            const matchesSearch = item.nomPays.toLowerCase().includes(search.toLowerCase()) ||
                item.isoPays.toLowerCase().includes(search.toLowerCase());
            const matchesContinent = continentFilter ? item.continent === continentFilter : true;
            return matchesSearch && matchesContinent;
        })
        .sort((a, b) => {
            if (sortBy === 'gold') {
                if (b.gold !== a.gold) return b.gold - a.gold;
                if (b.silver !== a.silver) return b.silver - a.silver;
                return b.bronze - a.bronze;
            } else if (sortBy === 'points') {
                return b.points - a.points;
            } else if (sortBy === 'total') {
                return b.total - a.total;
            }
            return 0;
        });

    return (
        <section>
            <Navbar title="Médailles" />
            <div className="space-y-6 p-6">
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast({ message: '', type: 'success' })}
                />

                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-black text-slate-800">Tableau des Médailles · Dakar 2026</h1>
                        <p className="text-xs text-slate-500 mt-1">
                            Classement officiel des nations et médailles d'attribution
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-amber-50/50 p-5 rounded-xl border-t-4 border-amber-400 border-x border-b shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">MÉDAILLES D'OR</p>
                            <p className="text-3xl font-black text-amber-900 mt-1">{stats.totalOr}</p>
                        </div>
                        <div className="w-10 h-10 rounded-lg bg-amber-400/20 flex items-center justify-center text-amber-600">
                            <Medal className="w-6 h-6" />
                        </div>
                    </div>

                    <div className="bg-slate-50 p-5 rounded-xl border-t-4 border-slate-400 border-x border-b shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">MÉDAILLES D'ARGENT</p>
                            <p className="text-3xl font-black text-slate-800 mt-1">{stats.totalArgent}</p>
                        </div>
                        <div className="w-10 h-10 rounded-lg bg-slate-300/30 flex items-center justify-center text-slate-600">
                            <Medal className="w-6 h-6" />
                        </div>
                    </div>

                    <div className="bg-amber-900/5 p-5 rounded-xl border-t-4 border-amber-700 border-x border-b shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-[11px] font-bold text-amber-900 uppercase tracking-wider">MÉDAILLES DE BRONZE</p>
                            <p className="text-3xl font-black text-amber-950 mt-1">{stats.totalBronze}</p>
                        </div>
                        <div className="w-10 h-10 rounded-lg bg-amber-700/10 flex items-center justify-center text-amber-700">
                            <Medal className="w-6 h-6" />
                        </div>
                    </div>

                    <div className="bg-emerald-50/50 p-5 rounded-xl border-t-4 border-emerald-500 border-x border-b shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">TOTAL MÉDAILLES</p>
                            <p className="text-3xl font-black text-emerald-900 mt-1">{stats.totalMedailles}</p>
                        </div>
                        <div className="w-10 h-10 rounded-lg bg-emerald-500/15 flex items-center justify-center text-emerald-600">
                            <Award className="w-6 h-6" />
                        </div>
                    </div>
                </div>


                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">

                    {/* FONCTIONALITE (ATTRIBUTION MEDAILLE) DESACTIVE */}

                    {/* <button
                    onClick={handleOpenModal}
                    className="bg-[#1a2f5e] text-white px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-slate-800 transition shadow-sm"
                >
                    <Plus className="w-4 h-4" />
                    <span>Attribuer une médaille</span>
                </button> */}

                    <div className="relative flex-1 min-w-50">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Rechercher un pays..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-[#edf0f7]/60 border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-700 focus:outline-none focus:border-slate-400 focus:bg-white transition-colors"
                        />
                    </div>

                    <select
                        value={continentFilter}
                        onChange={(e) => setContinentFilter(e.target.value)}
                        className="bg-[#edf0f7]/60 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-600 focus:outline-none"
                    >
                        <option value="">Tous les continents</option>
                        {continents.map((c, idx) => (
                            <option key={idx} value={c}>{c}</option>
                        ))}
                    </select>

                    <div className="flex items-center bg-[#edf0f7] p-1 rounded-lg border border-slate-200 text-xs font-semibold">
                        <button
                            onClick={() => setSortBy('gold')}
                            className={`px-3 py-1.5 rounded-md transition ${sortBy === 'gold' ? 'bg-[#1a2f5e] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                                }`}
                        >
                            Or d'abord
                        </button>
                        <button
                            onClick={() => setSortBy('points')}
                            className={`px-3 py-1.5 rounded-md transition ${sortBy === 'points' ? 'bg-[#1a2f5e] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                                }`}
                        >
                            Points (Or×7, Ag×4, Br×1)
                        </button>
                        <button
                            onClick={() => setSortBy('total')}
                            className={`px-3 py-1.5 rounded-md transition ${sortBy === 'total' ? 'bg-[#1a2f5e] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                                }`}
                        >
                            Total médailles
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                        <h3 className="font-bold text-slate-800 text-base">Classement par Pays</h3>
                        <span className="text-xs text-slate-400 font-medium">
                            {filteredMedailles.length} Nations classées
                        </span>
                    </div>

                    {loading ? (
                        <div className="p-8 text-center text-slate-400">Chargement du tableau...</div>
                    ) : filteredMedailles.length === 0 ? (
                        <div className="p-8 text-center text-slate-400">Aucune nation trouvée.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase text-slate-400 tracking-wider">
                                    <tr>
                                        <th className="py-3 px-4 w-12 text-center">#</th>
                                        <th className="py-3 px-4">Pays / Nation</th>
                                        <th className="py-3 px-4">Continent</th>
                                        <th className="py-3 px-4 text-center text-amber-600 font-black">
                                            <div className="flex items-center justify-center gap-1">
                                                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block"></span>
                                                <span>OR</span>
                                            </div>
                                        </th>
                                        <th className="py-3 px-4 text-center text-slate-500 font-black">
                                            <div className="flex items-center justify-center gap-1">
                                                <span className="w-2.5 h-2.5 rounded-full bg-slate-300 inline-block"></span>
                                                <span>ARGENT</span>
                                            </div>
                                        </th>
                                        <th className="py-3 px-4 text-center text-amber-800 font-black">
                                            <div className="flex items-center justify-center gap-1">
                                                <span className="w-2.5 h-2.5 rounded-full bg-amber-700 inline-block"></span>
                                                <span>BRONZE</span>
                                            </div>
                                        </th>
                                        <th className="py-3 px-4 text-center font-black text-slate-700">TOTAL</th>
                                        <th className="py-3 px-4 text-center font-black text-slate-700">POINTS</th>
                                        <th className="py-3 px-4 text-center">TENDANCE</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredMedailles.map((item, index) => {
                                        const rank = index + 1;
                                        const sumMedals = item.total || 1;
                                        const pctGold = (item.gold / sumMedals) * 100;
                                        const pctSilver = (item.silver / sumMedals) * 100;
                                        const pctBronze = (item.bronze / sumMedals) * 100;

                                        return (
                                            <tr key={`${item.isoPays || item.iso_pays}-${index}`} className="hover:bg-slate-50/60 transition-colors">
                                                <td className="py-3.5 px-4 text-center font-bold font-mono text-slate-400">
                                                    {rank <= 3 ? (
                                                        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-black ${rank === 1 ? 'bg-amber-400 text-white' :
                                                            rank === 2 ? 'bg-slate-300 text-slate-700' :
                                                                'bg-amber-700 text-white'
                                                            }`}>
                                                            {rank}
                                                        </span>
                                                    ) : (
                                                        `#${rank}`
                                                    )}
                                                </td>
                                                <td className="py-3.5 px-4">
                                                    <div className="flex items-center gap-2">
                                                        <span className="bg-slate-100 font-mono text-[11px] font-bold text-slate-500 px-1.5 py-0.5 rounded uppercase">
                                                            {item.iso_pays || item.iso_code || 'SN'}
                                                        </span>
                                                        <span className="font-bold text-slate-800">
                                                            {item.nationalite || item.nom_pays}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="py-3.5 px-4">
                                                    {item.continent ? (
                                                        <span className="bg-rose-50 text-rose-600 text-[11px] font-bold px-2 py-0.5 rounded-full">
                                                            {item.continent}
                                                        </span>
                                                    ) : (
                                                        <span className="text-slate-300">-</span>
                                                    )}
                                                </td>
                                                <td className="py-3.5 px-4 text-center font-bold text-slate-800">{item.gold}</td>
                                                <td className="py-3.5 px-4 text-center font-bold text-slate-800">{item.silver}</td>
                                                <td className="py-3.5 px-4 text-center font-bold text-slate-800">{item.bronze}</td>
                                                <td className="py-3.5 px-4 text-center font-black text-slate-900">{item.total}</td>
                                                <td className="py-3.5 px-4 text-center font-black text-slate-900">{item.points}</td>
                                                <td className="py-3.5 px-4 text-center w-28">
                                                    {item.total > 0 ? (
                                                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
                                                            <div style={{ width: `${pctGold}%` }} className="bg-amber-400 h-full"></div>
                                                            <div style={{ width: `${pctSilver}%` }} className="bg-slate-300 h-full"></div>
                                                            <div style={{ width: `${pctBronze}%` }} className="bg-amber-700 h-full"></div>
                                                        </div>
                                                    ) : (
                                                        <div className="h-2 w-full bg-slate-100 rounded-full"></div>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* MODAL D'ATTRIBUTION MEDAILLE (MEDAILLE) - DESACTIVE */}
                {isModalOpen && (
                    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-xl shadow-xl w-full max-w-lg space-y-4 p-0.5 overflow-hidden">
                            <div className="bg-[#1a2f5e] rounded-t-lg flex items-center justify-between border-b p-4 px-6">
                                <div>
                                    <h3 className="text-lg font-bold text-white">Attribuer une médaille</h3>
                                    <p className="text-[10px] text-white/50">Attribution officielle · Dakar 2026</p>
                                </div>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="text-white/70 hover:text-white transition"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4 p-6 text-sm">
                                <div>
                                    <label className="uppercase block text-xs font-semibold text-slate-600 mb-1">Pays / Nation</label>
                                    <select
                                        required
                                        value={formData.pays_id}
                                        onChange={(e) => setFormData({ ...formData, pays_id: e.target.value })}
                                        className="w-full px-3 py-2 bg-[#edf0f7] border border-slate-200 rounded-sm focus:ring-1 focus:ring-[#c9a227] outline-none"
                                    >
                                        <option value="">Sélectionner un pays</option>
                                        {countries.map((c, idx) => (
                                            <option key={c.id || idx} value={c.id}>{c.nom || c.nationalite} ({c.code_iso || c.iso_pays})</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="uppercase block text-xs font-semibold text-slate-600 mb-1">Type de Médaille</label>
                                        <select
                                            value={formData.type_medaille}
                                            onChange={(e) => setFormData({ ...formData, type_medaille: e.target.value })}
                                            className="w-full px-3 py-2 bg-[#edf0f7] border border-slate-200 rounded-sm focus:ring-1 focus:ring-[#c9a227] outline-none"
                                        >
                                            <option value="OR">OR</option>
                                            <option value="ARGENT">ARGENT</option>
                                            <option value="BRONZE">BRONZE</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="uppercase block text-xs font-semibold text-slate-600 mb-1">Épreuve</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="ex: 100m Hommes"
                                            value={formData.epreuve_nom}
                                            onChange={(e) => setFormData({ ...formData, epreuve_nom: e.target.value })}
                                            className="w-full px-3 py-2 bg-[#edf0f7] border border-slate-200 rounded-sm focus:ring-1 focus:ring-[#c9a227] outline-none"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="uppercase block text-xs font-semibold text-slate-600 mb-1">Athlète (Optionnel)</label>
                                    <input
                                        type="text"
                                        placeholder="Nom de l'athlète..."
                                        value={formData.athlete_nom}
                                        onChange={(e) => setFormData({ ...formData, athlete_nom: e.target.value })}
                                        className="w-full px-3 py-2 bg-[#edf0f7] border border-slate-200 rounded-sm focus:ring-1 focus:ring-[#c9a227] outline-none"
                                    />
                                </div>

                                <div className="flex justify-end gap-3 border-t pt-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:text-red-500 transition"
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-[#1a2f5e] hover:bg-slate-800 text-white rounded-lg transition"
                                    >
                                        Enregistrer
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}