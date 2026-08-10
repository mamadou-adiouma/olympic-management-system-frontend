import React, { useEffect, useState } from 'react';
import api from '../services/api';
import Navbar from '../components/Layout/Navbar';
import Toast from '../components/Common/Toast';
import { Search, Plus, Edit, Trash2, UserPlus, ChevronLeft, ChevronRight, X } from 'lucide-react';

export default function Athletes() {
    const [athletes, setAthletes] = useState([]);
    const [disciplines, setDisciplines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ current_page: 1, last_page: 1 });

    const [search, setSearch] = useState('');
    const [sexeFilter, setSexeFilter] = useState('');
    const [disciplineFilter, setDisciplineFilter] = useState('');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAthlete, setEditingAthlete] = useState(null);
    const [formData, setFormData] = useState({
        code: '', nom: '', prenom: '', sexe: 'H', date_naissance: '',
        iso_pays: 'SN', nationalite: 'Sénégal', continent: 'Afrique',
        discipline_id: '', taille: '', poids: ''
    });

    const [toast, setToast] = useState({ message: '', type: 'success' });

    useEffect(() => {
        fetchDisciplines();
    }, []);

    useEffect(() => {
        fetchAthletes(1);
    }, [search, sexeFilter, disciplineFilter]);

    const fetchDisciplines = async () => {
        try {
            const res = await api.get('/disciplines');
            setDisciplines(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchAthletes = async (page = 1) => {
        try {
            setLoading(true);
            const params = { page, search, sexe: sexeFilter, discipline_id: disciplineFilter };
            const res = await api.get('/athletes', { params });
            setAthletes(res.data.data || []);
            setPagination({
                current_page: res.data.current_page,
                last_page: res.data.last_page
            });
        } catch (err) {
            showToast('Erreur lors du chargement des athlètes', 'error');
        } finally {
            setLoading(false);
        }
    };

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast({ message: '', type: 'success' }), 4000);
    };

    const openModal = (athlete = null) => {
        if (athlete) {
            setEditingAthlete(athlete);
            setFormData({
                code: athlete.code || '',
                nom: athlete.nom || '',
                prenom: athlete.prenom || '',
                sexe: athlete.sexe || 'H',
                date_naissance: athlete.date_naissance || '',
                iso_pays: athlete.iso_pays || 'SN',
                nationalite: athlete.nationalite || 'Sénégal',
                continent: athlete.continent || 'Afrique',
                discipline_id: athlete.discipline_id || '',
                taille: athlete.taille || '',
                poids: athlete.poids || ''
            });
        } else {
            setEditingAthlete(null);
            setFormData({
                code: `ATH-${Math.floor(1000 + Math.random() * 9000)}`,
                nom: '',
                prenom: '',
                sexe: 'H',
                date_naissance: '',
                iso_pays: 'SN',
                nationalite: 'Sénégal',
                continent: 'Afrique',
                discipline_id: disciplines[0]?.id || '',
                taille: '',
                poids: ''
            });
        }
        setIsModalOpen(true);
    };


    const handleSubmit = async (e) => {
        e.preventDefault();

        const payload = {
            ...formData,
            taille: formData.taille !== '' ? parseInt(formData.taille, 10) : null,
            poids: formData.poids !== '' ? parseFloat(formData.poids) : null,
        };

        try {
            if (editingAthlete) {
                await api.put(`/athletes/${editingAthlete.id}`, formData);
                showToast('Athlète mis à jour avec succès');
            } else {
                await api.post('/athletes', formData);
                showToast('Athlète créé avec succès');
            }
            setIsModalOpen(false);
            fetchAthletes(pagination.current_page);
        } catch (err) {
            showToast(err.response?.data?.message || 'Erreur lors de l\'enregistrement', 'error');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Voulez-vous vraiment supprimer cet athlète ?')) return;
        try {
            await api.delete(`/athletes/${id}`);
            showToast('Athlète supprimé avec succès');
            fetchAthletes(pagination.current_page);
        } catch (err) {
            showToast('Erreur lors de la suppression', 'error');
        }
    };

    const CONTINENTS = ['Afrique', 'Amériques', 'Asie', 'Europe', 'Océanie'];

    return (
        <section>
            <Navbar title="Athlètes" />
            <div className="space-y-6 p-6">
                <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'success' })} />

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">Gestion des Athlètes · Dakar 2026</h1>
                        <p className="text-slate-500 text-xs">Inscrivez et gérez la liste des athlètes participants.</p>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6 flex flex-wrap items-center justify-between gap-4">
                    <button
                        onClick={() => openModal()}
                        className="bg-[#1a2f5e] text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-slate-800 transition shadow-sm"
                    >
                        <UserPlus className="w-4 h-4" />
                        <span>Ajouter un athlète</span>
                    </button>
                    <div className="relative flex-1">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Rechercher par nom, prénom ou code..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-700 focus:outline-none focus:border-slate-400 focus:bg-white transition-colors"
                        />
                    </div>

                    <select
                        value={disciplineFilter}
                        onChange={(e) => setDisciplineFilter(e.target.value)}
                        className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-600 focus:outline-none"
                    >
                        <option value="">Toutes les disciplines</option>
                        {disciplines.map((d) => (
                            <option key={d.id} value={d.id}>{d.nom}</option>
                        ))}
                    </select>

                    <select
                        value={sexeFilter}
                        onChange={(e) => setSexeFilter(e.target.value)}
                        className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-600 focus:outline-none"
                    >
                        <option value="">Tous les genres</option>
                        <option value="H">Homme</option>
                        <option value="F">Femme</option>
                    </select>

                    <p className="text-xs text-slate-400 font-medium whitespace-nowrap">{athletes.length} Résultats</p>
                </div>

                {/* INFOMATIONS ATHLETES */}
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 border-b border-slate-200 text-xs text-slate-500 uppercase">
                            <tr>
                                <th className="p-4">N°</th>
                                <th className="p-4">Code</th>
                                <th className="p-4">Nom</th>
                                <th className="p-4">Prénom</th>
                                <th className="p-4">Sexe</th>
                                <th className="p-4">Pays/Nationalité</th>
                                <th className="p-4">Discipline</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="p-8 text-center text-slate-400">Chargement des données...</td>
                                </tr>
                            ) : athletes.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="p-8 text-center text-slate-400">Aucun athlète trouvé.</td>
                                </tr>
                            ) : (
                                athletes.map((ath) => (
                                    <tr key={ath.id} className="hover:bg-slate-50/50 transition">
                                        <td className="p-4 font-mono text-xs font-semibold text-slate-600">{ath.id}</td>
                                        <td className="p-4 font-mono text-xs font-semibold text-slate-600">{ath.code}</td>
                                        <td className="p-4 font-medium text-slate-800">{ath.nom}</td>
                                        <td className="p-4 font-medium text-slate-800">{ath.prenom}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded text-xs font-semibold ${ath.sexe === 'H' ? 'bg-blue-50 text-blue-600' : 'bg-pink-50 text-pink-600'}`}>
                                                {ath.sexe}
                                            </span>
                                        </td>
                                        <td className="p-4 text-slate-600">{ath.nationalite} ({ath.iso_pays})</td>
                                        <td className="p-4 text-slate-600">{ath.discipline?.nom || '-'}</td>
                                        <td className="p-4 text-right space-x-2">
                                            <button onClick={() => openModal(ath)} className="p-1.5 text-slate-500 hover:text-indigo-600 transition">
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleDelete(ath.id)} className="p-1.5 text-slate-500 hover:text-rose-600 transition">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>

                    <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                        <span>Page {pagination.current_page} sur {pagination.last_page}</span>
                        <div className="flex gap-2">
                            <button
                                disabled={pagination.current_page <= 1}
                                onClick={() => fetchAthletes(pagination.current_page - 1)}
                                className="p-2 border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-50"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <button
                                disabled={pagination.current_page >= pagination.last_page}
                                onClick={() => fetchAthletes(pagination.current_page + 1)}
                                className="p-2 border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-50"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* MODAL D'AJOUT ET D'EDITION (ATHLETES) */}
                {isModalOpen && (
                    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50 rounded-xl">
                        <div className="bg-white rounded-xl shadow-xl w-full max-w-xl space-y-4 p-0.5">
                            <div className="bg-[#1a2f5e] rounded-t-lg flex items-center justify-between border-b p-4 px-6">
                                <h3 className="text-lg font-bold text-slate-200">
                                    {editingAthlete ? 'Modifier l\'athlète' : 'Ajouter un athlète'}
                                    <p className="text-[10px] text-white/50">Nouveau dossier athlète · Dakar 2026</p>
                                </h3>
                                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4 p-6 text-sm">
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="uppercase block text-xs font-semibold text-slate-600 mb-1">Nom</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.nom}
                                            onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                                            className="w-full px-3 py-2 bg-[#edf0f7] border border-slate-200 rounded-sm focus:ring-1 focus:ring-[#c9a227] outline-none"
                                            placeholder="Kipchoge"
                                        />
                                    </div>
                                    <div>
                                        <label className="uppercase block text-xs font-semibold text-slate-600 mb-1">Prénom</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.prenom}
                                            onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                                            className="w-full px-3 py-2 bg-[#edf0f7] border border-slate-200 rounded-sm focus:ring-1 focus:ring-[#c9a227] outline-none"
                                            placeholder="Eliud"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="uppercase block text-xs font-semibold text-slate-600 mb-1">Code</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.code}
                                            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                            className="w-full px-3 py-2 bg-[#edf0f7] border border-slate-200 rounded-sm focus:ring-1 focus:ring-[#c9a227] outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="uppercase block text-xs font-semibold text-slate-600 mb-1">Sexe</label>
                                        <select
                                            value={formData.sexe}
                                            onChange={(e) => setFormData({ ...formData, sexe: e.target.value })}
                                            className="w-full px-3 py-2 bg-[#edf0f7] border border-slate-200 rounded-sm focus:ring-1 focus:ring-[#c9a227] outline-none"
                                        >
                                            <option value="H">Homme</option>
                                            <option value="F">Femme</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="uppercase block text-xs font-semibold text-slate-600 mb-1">Date de Naissance</label>
                                        <input
                                            type="date"
                                            required
                                            value={formData.date_naissance}
                                            onChange={(e) => setFormData({ ...formData, date_naissance: e.target.value })}
                                            className="w-full px-3 py-2 bg-[#edf0f7] border border-slate-200 rounded-sm focus:ring-1 focus:ring-[#c9a227] outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="uppercase block text-xs font-semibold text-slate-600 mb-1">Discipline</label>
                                        <select
                                            required
                                            value={formData.discipline_id}
                                            onChange={(e) => setFormData({ ...formData, discipline_id: e.target.value })}
                                            className="w-full px-3 py-2 bg-[#edf0f7] border border-slate-200 rounded-sm focus:ring-1 focus:ring-[#c9a227] outline-none"
                                        >
                                            <option value="">Sélectionner</option>
                                            {disciplines.map((d) => (
                                                <option key={d.id} value={d.id}>{d.nom}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-3">
                                    <div>
                                        <label className="uppercase block text-xs font-semibold text-slate-600 mb-1">Nationalité</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.nationalite}
                                            onChange={(e) => setFormData({ ...formData, nationalite: e.target.value })}
                                            className="w-full px-3 py-2 bg-[#edf0f7] border border-slate-200 rounded-sm focus:ring-1 focus:ring-[#c9a227] outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="uppercase block text-xs font-semibold text-slate-600 mb-1">Code ISO Pays</label>
                                        <input
                                            type="text"
                                            maxLength="2"
                                            required
                                            value={formData.iso_pays}
                                            onChange={(e) => setFormData({ ...formData, iso_pays: e.target.value.toUpperCase() })}
                                            className="w-full px-3 py-2 bg-[#edf0f7] border border-slate-200 rounded-sm focus:ring-1 focus:ring-[#c9a227] outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="uppercase block text-xs font-semibold text-slate-600 mb-1">CONTINENT</label>
                                        <select
                                            value={formData.continent}
                                            onChange={(e) => setFormData({ ...formData, continent: e.target.value })}
                                            className="w-full px-3 py-2 bg-[#edf0f7] border border-slate-200 rounded-sm focus:ring-1 focus:ring-[#c9a227] outline-none"
                                            required
                                        >
                                            <option value="">Sélectionner un continent</option>
                                            {CONTINENTS.map((c) => (
                                                <option key={c} value={c}>{c}</option>
                                            ))}
                                        </select>
                                    </div>
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
                                        {editingAthlete ? 'Mettre à jour' : 'Enregistrer'}
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