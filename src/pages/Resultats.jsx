import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Navbar from '../components/Layout/Navbar';
import Toast from '../components/Common/Toast';
import { Search, Plus, X, Medal } from 'lucide-react';

export default function Resultats() {
    const [resultatsGroupes, setResultatsGroupes] = useState([]);
    const [epreuves, setEpreuves] = useState([]);
    const [athletes, setAthletes] = useState([]);
    const [stats, setStats] = useState({
        epreuveTerminees: 0,
        recordsMondiaux: 0,
        recordsOlympiques: 0,
        medaillesAttribuees: 0
    });
    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState('');
    const [disciplineFilter, setDisciplineFilter] = useState('');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [toast, setToast] = useState({ message: '', type: 'success' });

    const [formData, setFormData] = useState({
        epreuve_id: '',
        athlete_id: '',
        rang: 1,
        performance: '',
        medaille: 'OR',
        est_record_olympique: false,
        est_record_mondial: false
    });

    useEffect(() => {
        fetchResultats();
        fetchEpreuvesAndAthletes();
    }, []);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast({ message: '', type: 'success' }), 4000);
    };

    const fetchEpreuvesAndAthletes = async () => {
        try {
            const [resEpreuves, resAthletes] = await Promise.all([
                api.get('/epreuves'),
                api.get('/athletes')
            ]);
            setEpreuves(resEpreuves.data?.data || resEpreuves.data || []);
            setAthletes(resAthletes.data?.data || resAthletes.data || []);
        } catch (err) {
            console.error('Erreur chargement épreuves/athlètes', err);
        }
    };

    const fetchResultats = async () => {
        try {
            setLoading(true);
            const res = await api.get('/resultats');
            const dataGrouped = res.data?.data || res.data || {};

            const listFormatted = Object.keys(dataGrouped).map((epreuveId) => {
                const items = dataGrouped[epreuveId];
                const epreuveInfo = items[0]?.epreuve;

                return {
                    id: `RES-00${epreuveId}`,
                    epreuve_id: epreuveId,
                    epreuve: epreuveInfo?.nom || 'Épreuve sans nom',
                    discipline: epreuveInfo?.discipline?.nom || 'Discipline',
                    date: epreuveInfo?.date_epreuve || '',
                    isRecordOlympique: items.some(i => i.est_record_olympique),
                    isRecordMondial: items.some(i => i.est_record_mondial),
                    podium: items
                        .filter(i => ['OR', 'ARGENT', 'BRONZE'].includes(i.medaille))
                        .sort((a, b) => a.rang - b.rang)
                        .map(i => ({
                            rang: i.rang,
                            athlete: `${i.athlete?.prenom || ''} ${i.athlete?.nom || ''}`,
                            pays: i.athlete?.iso_pays || i.athlete?.nationalite || '',
                            perf: i.performance,
                            medaille: i.medaille
                        }))
                };
            });

            setResultatsGroupes(listFormatted);

            let totalMedailles = 0;
            let recordsO = 0;
            let recordsM = 0;

            Object.values(dataGrouped).forEach(group => {
                group.forEach(item => {
                    if (['OR', 'ARGENT', 'BRONZE'].includes(item.medaille)) totalMedailles++;
                    if (item.est_record_olympique) recordsO++;
                    if (item.est_record_mondial) recordsM++;
                });
            });

            setStats({
                epreuveTerminees: Object.keys(dataGrouped).length,
                recordsMondiaux: recordsM,
                recordsOlympiques: recordsO,
                medaillesAttribuees: totalMedailles
            });

        } catch (err) {
            showToast('Erreur lors du chargement des résultats', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = () => {
        setFormData({
            epreuve_id: epreuves[0]?.id || '',
            athlete_id: athletes[0]?.id || '',
            rang: 1,
            performance: '',
            medaille: 'OR',
            est_record_olympique: false,
            est_record_mondial: false
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/resultats', formData);
            showToast('Résultat enregistré avec succès');
            setIsModalOpen(false);
            fetchResultats();
        } catch (err) {
            showToast('Erreur lors de la saisie du résultat', 'error');
        }
    };

    const disciplinesUniques = Array.from(
        new Set(resultatsGroupes.map(r => r.discipline))
    ).filter(Boolean);

    const filteredResultats = resultatsGroupes.filter((res) => {
        const matchesSearch =
            res.epreuve.toLowerCase().includes(search.toLowerCase()) ||
            res.discipline.toLowerCase().includes(search.toLowerCase()) ||
            res.podium.some(p => p.athlete.toLowerCase().includes(search.toLowerCase()));

        const matchesDiscipline = disciplineFilter ? res.discipline === disciplineFilter : true;

        return matchesSearch && matchesDiscipline;
    });

    // STYLES PERSONNALISES DES MEDAILLES SELON LE RANG
    const getMedalBadgeConfig = (rang) => {
        switch (rang) {
            case 1:
                return {
                    badgeBg: 'bg-amber-400',
                    iconColor: 'text-amber-800',
                    labelColor: 'text-amber-600',
                    labelText: '1ER'
                };
            case 2:
                return {
                    badgeBg: 'bg-slate-300',
                    iconColor: 'text-slate-600',
                    labelColor: 'text-slate-500',
                    labelText: '2ÈME'
                };
            case 3:
                return {
                    badgeBg: 'bg-amber-700',
                    iconColor: 'text-amber-100',
                    labelColor: 'text-amber-700',
                    labelText: '3ÈME'
                };
            default:
                return {
                    badgeBg: 'bg-slate-200',
                    iconColor: 'text-slate-500',
                    labelColor: 'text-slate-400',
                    labelText: `${rang}E`
                };
        }
    };

    return (
        <section>
            <Navbar title="Résultats" />
            <div className="space-y-6 p-6">
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast({ message: '', type: 'success' })}
                />

                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">Gestion des Résultats · Dakar 2026</h1>
                        <p className="text-slate-500 text-xs">Ajoutez des résultats, attribuez des médailles.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white p-5 rounded-xl border-t-4 border-slate-700 border-x border-b shadow-sm">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">ÉPREUVES TERMINÉES</p>
                        <p className="text-3xl font-bold text-slate-800 mt-2">{stats.epreuveTerminees}</p>
                    </div>

                    <div className="bg-white p-5 rounded-xl border-t-4 border-rose-500 border-x border-b shadow-sm">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">RECORDS MONDIAUX</p>
                        <p className="text-3xl font-bold text-rose-500 mt-2">{stats.recordsMondiaux}</p>
                    </div>

                    <div className="bg-white p-5 rounded-xl border-t-4 border-amber-500 border-x border-b shadow-sm">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">RECORDS OLYMPIQUES</p>
                        <p className="text-3xl font-bold text-amber-500 mt-2">{stats.recordsOlympiques}</p>
                    </div>

                    <div className="bg-white p-5 rounded-xl border-t-4 border-emerald-500 border-x border-b shadow-sm">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">MÉDAILLES ATTRIBUÉES</p>
                        <p className="text-3xl font-bold text-emerald-500 mt-2">{stats.medaillesAttribuees}</p>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
                    <button
                        onClick={handleOpenModal}
                        className="bg-[#1a2f5e] text-white px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-slate-800 transition shadow-sm"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Saisir un résultat</span>
                    </button>

                    <div className="relative flex-1 min-w-50">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Rechercher une épreuve ou un athlète..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-[#edf0f7]/60 border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-700 focus:outline-none focus:border-slate-400 focus:bg-white transition-colors"
                        />
                    </div>

                    <select
                        value={disciplineFilter}
                        onChange={(e) => setDisciplineFilter(e.target.value)}
                        className="bg-[#edf0f7]/60 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-600 focus:outline-none"
                    >
                        <option value="">Toutes</option>
                        {disciplinesUniques.map((d, idx) => (
                            <option key={idx} value={d}>{d}</option>
                        ))}
                    </select>

                    <p className="text-xs text-slate-400 font-medium whitespace-nowrap">
                        {filteredResultats.length} résultats
                    </p>
                </div>

                {loading ? (
                    <div className="bg-white rounded-xl p-8 text-center text-slate-400 border border-slate-200 shadow-sm">
                        Chargement des résultats...
                    </div>
                ) : filteredResultats.length === 0 ? (
                    <div className="bg-white rounded-xl p-8 text-center text-slate-400 border border-slate-200 shadow-sm">
                        Aucun résultat trouvé.
                    </div>
                ) : (
                    <div className="space-y-5">
                        {filteredResultats.map((res) => (
                            <div key={res.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                                <div className="bg-slate-50 p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
                                    <div>
                                        <span className="text-xs font-mono font-semibold text-slate-400 mr-3">{res.id}</span>
                                        <span className="font-bold text-slate-800 text-base">{res.epreuve}</span>
                                        <p className="text-xs text-slate-500 mt-0.5">{res.discipline} · {res.date}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {res.isRecordMondial && (
                                            <span className="bg-rose-500 text-white text-[10px] font-black px-2.5 py-1 rounded tracking-widest uppercase">
                                                RECORD MONDIAL
                                            </span>
                                        )}
                                        {res.isRecordOlympique && (
                                            <span className="bg-amber-500 text-white text-[10px] font-black px-2.5 py-1 rounded tracking-widest uppercase">
                                                RECORD OLYMPIQUE
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* PODIUM (BARRETTES) DES MEDAILLE */}
                                <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100 p-2">
                                    {res.podium.map((p) => {
                                        const medalConfig = getMedalBadgeConfig(p.rang);
                                        return (
                                            <div key={p.rang} className="flex items-center gap-4 p-3">
                                                <div className="flex flex-col items-center shrink-0">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center relative shadow-sm ${medalConfig.badgeBg}`}>
                                                        <span className="absolute -top-1 w-2.5 h-1.5 bg-blue-500 rounded-xs"></span>
                                                        <Medal className={`w-4 h-4 ${medalConfig.iconColor}`} />
                                                        <span className="absolute text-[9px] font-black text-white leading-none pt-2">
                                                            {p.rang}
                                                        </span>
                                                    </div>
                                                    <span className={`text-[10px] font-extrabold uppercase mt-1 tracking-tight ${medalConfig.labelColor}`}>
                                                        {medalConfig.labelText}
                                                    </span>
                                                </div>

                                                <div className="min-w-0 flex-1">
                                                    <p className="text-xs text-slate-400 uppercase font-mono truncate">
                                                        <span className="font-bold text-slate-800 mr-1.5">{p.pays}</span>
                                                        <span className="font-bold text-slate-900 text-sm">{p.athlete}</span>
                                                    </p>
                                                    <p className="text-[#c9a227] font-black text-base mt-0.5">{p.perf}</p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* MODAL DE SAISIE DES RESULATS (RESULTATS) */}
                {isModalOpen && (
                    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-xl shadow-xl w-full max-w-lg space-y-4 p-0.5 overflow-hidden">
                            <div className="bg-[#1a2f5e] rounded-t-lg flex items-center justify-between border-b p-4 px-6">
                                <div>
                                    <h3 className="text-lg font-bold text-white">Saisir un résultat</h3>
                                    <p className="text-[10px] text-white/50">Résultats officiels · Dakar 2026</p>
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
                                    <label className="uppercase block text-xs font-semibold text-slate-600 mb-1">Épreuve</label>
                                    <select
                                        required
                                        value={formData.epreuve_id}
                                        onChange={(e) => setFormData({ ...formData, epreuve_id: e.target.value })}
                                        className="w-full px-3 py-2 bg-[#edf0f7] border border-slate-200 rounded-sm focus:ring-1 focus:ring-[#c9a227] outline-none"
                                    >
                                        <option value="">Sélectionner une épreuve</option>
                                        {epreuves.map((e) => (
                                            <option key={e.id} value={e.id}>{e.nom} ({e.code})</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="uppercase block text-xs font-semibold text-slate-600 mb-1">Athlète</label>
                                    <select
                                        required
                                        value={formData.athlete_id}
                                        onChange={(e) => setFormData({ ...formData, athlete_id: e.target.value })}
                                        className="w-full px-3 py-2 bg-[#edf0f7] border border-slate-200 rounded-sm focus:ring-1 focus:ring-[#c9a227] outline-none"
                                    >
                                        <option value="">Sélectionner un athlète</option>
                                        {athletes.map((a) => (
                                            <option key={a.id} value={a.id}>{a.prenom} {a.nom} ({a.nationalite || a.iso_pays})</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-3 gap-3">
                                    <div>
                                        <label className="uppercase block text-xs font-semibold text-slate-600 mb-1">Rang</label>
                                        <input
                                            type="number"
                                            min="1"
                                            required
                                            value={formData.rang}
                                            onChange={(e) => {
                                                const val = parseInt(e.target.value) || 1;
                                                let med = 'AUCUNE';
                                                if (val === 1) med = 'OR';
                                                else if (val === 2) med = 'ARGENT';
                                                else if (val === 3) med = 'BRONZE';
                                                setFormData({ ...formData, rang: val, medaille: med });
                                            }}
                                            className="w-full px-3 py-2 bg-[#edf0f7] border border-slate-200 rounded-sm focus:ring-1 focus:ring-[#c9a227] outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="uppercase block text-xs font-semibold text-slate-600 mb-1">Médaille</label>
                                        <select
                                            value={formData.medaille}
                                            onChange={(e) => setFormData({ ...formData, medaille: e.target.value })}
                                            className="w-full px-3 py-2 bg-[#edf0f7] border border-slate-200 rounded-sm focus:ring-1 focus:ring-[#c9a227] outline-none"
                                        >
                                            <option value="OR">OR</option>
                                            <option value="ARGENT">ARGENT</option>
                                            <option value="BRONZE">BRONZE</option>
                                            <option value="AUCUNE">AUCUNE</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="uppercase block text-xs font-semibold text-slate-600 mb-1">Performance</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="ex: 9.72s"
                                            value={formData.performance}
                                            onChange={(e) => setFormData({ ...formData, performance: e.target.value })}
                                            className="w-full px-3 py-2 bg-[#edf0f7] border border-slate-200 rounded-sm focus:ring-1 focus:ring-[#c9a227] outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2 border-t border-slate-100 pt-3">
                                    <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.est_record_olympique}
                                            onChange={(e) => setFormData({ ...formData, est_record_olympique: e.target.checked })}
                                            className="rounded border-slate-300 text-[#1a2f5e] focus:ring-[#c9a227]"
                                        />
                                        <span>Record Olympique</span>
                                    </label>
                                    <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.est_record_mondial}
                                            onChange={(e) => setFormData({ ...formData, est_record_mondial: e.target.checked })}
                                            className="rounded border-slate-300 text-[#1a2f5e] focus:ring-[#c9a227]"
                                        />
                                        <span>Record Mondial</span>
                                    </label>
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