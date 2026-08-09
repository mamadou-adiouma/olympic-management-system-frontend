import React, { useEffect, useState } from 'react';
import api from '../services/api';
import Navbar from '../components/Layout/Navbar';
import Toast from '../components/Common/Toast';
import { Plus, Edit, Trash2, MapPin, X, Search, Eye } from 'lucide-react';

const topBorderColors = [
    'border-t-[#1a2f5e]',
    'border-t-[#00a8ff]',
    'border-t-[#e84118]',
    'border-t-[#fbc531]',
    'border-t-[#4cd137]',
    'border-t-[#9c88ff]'
];

export default function Disciplines() {
    const [disciplines, setDisciplines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

    const [selectedDiscipline, setSelectedDiscipline] = useState(null);

    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');

    const [formData, setFormData] = useState({
        code: '', nom: '', description: '', categorie: 'Sports individuels', lieu: '', statut: 'Actif'
    });

    const [toast, setToast] = useState({ message: '', type: 'success' });

    useEffect(() => {
        fetchDisciplines();
    }, []);

    const fetchDisciplines = async () => {
        try {
            setLoading(true);
            const res = await api.get('/disciplines');
            setDisciplines(res.data);
        } catch (err) {
            showToast('Erreur lors du chargement des disciplines', 'error');
        } finally {
            setLoading(false);
        }
    };

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast({ message: '', type: 'success' }), 4000);
    };

    const openModal = (discipline = null) => {
        if (discipline) {
            setEditingItem(discipline);
            setFormData(discipline);
        } else {
            setEditingItem(null);
            setFormData({
                code: `DIS-00${disciplines.length + 1}`,
                nom: '', description: '', categorie: 'Sports individuels', lieu: 'Dakar Arena', statut: 'Actif'
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingItem) {
                await api.put(`/disciplines/${editingItem.id}`, formData);
                showToast('Discipline mise à jour avec succès');
            } else {
                await api.post('/disciplines', formData);
                showToast('Discipline ajoutée avec succès');
            }
            setIsModalOpen(false);
            fetchDisciplines();
        } catch (err) {
            showToast('Erreur lors de l\'enregistrement', 'error');
        }
    };

    const handleDelete = async (e, id) => {
        e.stopPropagation(); 

        if (!window.confirm('Voulez-vous supprimer cette discipline ?')) return;
        try {
            await api.delete(`/disciplines/${id}`);
            showToast('Discipline supprimée');
            fetchDisciplines();
        } catch (err) {
            showToast('Erreur lors de la suppression', 'error');
        }
    };

    const categories = Array.from(new Set(disciplines.map(d => d.categorie).filter(Boolean)));

    // FILTRAGE DISCIPLINES COTE CLIENT
    const filteredDisciplines = disciplines.filter((item) => {
        const matchesSearch =
            item.nom?.toLowerCase().includes(search.toLowerCase()) ||
            item.code?.toLowerCase().includes(search.toLowerCase()) ||
            item.lieu?.toLowerCase().includes(search.toLowerCase());

        const matchesCategory = categoryFilter ? item.categorie === categoryFilter : true;

        return matchesSearch && matchesCategory;
    });

    const getStatusStyle = (statut) => {
        return statut?.toLowerCase() === 'actif'
            ? 'bg-emerald-50 text-emerald-600'
            : 'bg-rose-50 text-rose-600';
    };

    return (
        <section>
            <Navbar title="Disciplines" />
            <div className="space-y-6 font-sans p-6">
                <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'success' })} />

                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">Gestion des disciplines · Dakar 2026</h1>
                        <p className="text-slate-500 text-xs">Gestion des disciplines.</p>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
                    <button
                        onClick={() => openModal()}
                        className="bg-[#1a2f5e] hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition shadow-sm"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Ajouter une discipline</span>
                    </button>

                    <div className="relative flex-1 min-w-50">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Rechercher..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-700 focus:outline-none focus:border-slate-400 focus:bg-white transition-colors"
                        />
                    </div>

                    <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-600 focus:outline-none"
                    >
                        <option value="">Toutes les catégories</option>
                        {categories.map((cat, idx) => (
                            <option key={idx} value={cat}>{cat}</option>
                        ))}
                    </select>

                    <p className="text-xs text-slate-400 font-medium whitespace-nowrap">
                        {filteredDisciplines.length} disciplines
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {loading ? (
                        <p className="text-slate-400 col-span-full text-center py-8">Chargement des données...</p>
                    ) : filteredDisciplines.length === 0 ? (
                        <p className="text-slate-400 col-span-full text-center py-8">Aucune discipline trouvée.</p>
                    ) : (
                        filteredDisciplines.map((item, index) => {
                            const topBorderClass = topBorderColors[index % topBorderColors.length];
                            return (
                                <div
                                    key={item.id}
                                    onClick={() => setSelectedDiscipline(item)}
                                    className={`bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition cursor-pointer border-t-4 ${topBorderClass} p-5 flex flex-col justify-between relative group`}
                                >
                                    <div className="space-y-2">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h3 className="font-bold text-xl text-slate-800 leading-tight">{item.nom}</h3>
                                                <p className="text-xs text-slate-400 font-medium mt-0.5">{item.categorie}</p>
                                            </div>
                                            <span className={`text-xs px-2.5 py-1 rounded-md font-medium ${getStatusStyle(item.statut)}`}>
                                                {item.statut}
                                            </span>
                                        </div>

                                        <p className="text-xs text-slate-500 line-clamp-2 min-h-8">
                                            {item.description || 'Aucune description disponible.'}
                                        </p>

                                        <div className="flex items-center gap-1.5 text-xs text-slate-500 pt-1">
                                            <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                                            <span className="truncate">{item.lieu}</span>
                                        </div>
                                    </div>

                                    <div className="border-t border-slate-100 mt-4 pt-3 flex items-end justify-between">
                                        <div className="flex gap-6">
                                            <div>
                                                <span className="block text-lg font-extrabold text-slate-800 leading-none">
                                                    {item.epreuves_count ?? item.epreuves ?? 0}
                                                </span>
                                                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                                                    ÉPREUVES
                                                </span>
                                            </div>
                                            <div>
                                                <span className="block text-lg font-extrabold text-slate-800 leading-none">
                                                    {item.athletes_count ?? item.athletes ?? 0}
                                                </span>
                                                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                                                    ATHLÈTES
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <div className="opacity-0 group-hover:opacity-100 transition flex items-center gap-1 mr-2">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); openModal(item); }}
                                                    className="p-1 text-slate-400 hover:text-indigo-600 transition"
                                                    title="Modifier"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={(e) => handleDelete(e, item.id)}
                                                    className="p-1 text-slate-400 hover:text-rose-600 transition"
                                                    title="Supprimer"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <span className="font-mono text-xs font-semibold text-slate-300">
                                                {item.code}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* MODAL D'AJOUT ET D'EDITION (DISCIPLINES) */}
                {selectedDiscipline && (
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                            <div className="bg-[#1a2f5e] p-6 text-white flex justify-between items-start">
                                <div>
                                    <h2 className="text-2xl font-bold">{selectedDiscipline.nom}</h2>
                                    <p className="text-xs text-slate-300 mt-1">
                                        {selectedDiscipline.code} · {selectedDiscipline.categorie}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setSelectedDiscipline(null)}
                                    className="p-1 bg-white/10 hover:bg-white/20 rounded-lg text-slate-200 hover:text-white transition"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="p-6 space-y-4 text-sm text-slate-700">
                                <div className="grid grid-cols-3 gap-2">
                                    <span className="uppercase text-xs font-bold text-slate-400 tracking-wider">DESCRIPTION</span>
                                    <p className="col-span-2 text-slate-800 font-medium">{selectedDiscipline.description || 'Non renseignée'}</p>
                                </div>

                                <div className="grid grid-cols-3 gap-2">
                                    <span className="uppercase text-xs font-bold text-slate-400 tracking-wider">LIEU</span>
                                    <p className="col-span-2 text-slate-800 font-medium">{selectedDiscipline.lieu}</p>
                                </div>

                                <div className="grid grid-cols-3 gap-2">
                                    <span className="uppercase text-xs font-bold text-slate-400 tracking-wider">CATÉGORIE</span>
                                    <p className="col-span-2 text-slate-800 font-medium">{selectedDiscipline.categorie}</p>
                                </div>

                                <div className="grid grid-cols-3 gap-2 items-center">
                                    <span className="uppercase text-xs font-bold text-slate-400 tracking-wider">STATUT</span>
                                    <div className="col-span-2">
                                        <span className={`text-xs px-2.5 py-1 rounded-md font-semibold inline-block ${getStatusStyle(selectedDiscipline.statut)}`}>
                                            {selectedDiscipline.statut}
                                        </span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 pt-2">
                                    <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4">
                                        <span className="text-3xl font-extrabold text-[#1a2f5e] block">
                                            {selectedDiscipline.epreuves_count ?? selectedDiscipline.epreuves ?? 0}
                                        </span>
                                        <span className="text-xs uppercase font-bold text-slate-400 tracking-wider mt-1 block">
                                            ÉPREUVES
                                        </span>
                                    </div>
                                    <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4">
                                        <span className="text-3xl font-extrabold text-emerald-600 block">
                                            {selectedDiscipline.athletes_count ?? selectedDiscipline.athletes ?? 0}
                                        </span>
                                        <span className="text-xs uppercase font-bold text-slate-400 tracking-wider mt-1 block">
                                            ATHLÈTES
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-slate-50 p-4 border-t border-slate-100 flex justify-end gap-3">
                                <button
                                    onClick={() => setSelectedDiscipline(null)}
                                    className="px-5 py-2 border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-100 transition"
                                >
                                    Fermer
                                </button>
                                <button
                                    onClick={() => {
                                        const disc = selectedDiscipline;
                                        setSelectedDiscipline(null);
                                        openModal(disc);
                                    }}
                                    className="px-5 py-2 bg-[#1a2f5e] hover:bg-slate-800 text-white rounded-lg text-sm font-semibold transition"
                                >
                                    Modifier
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {isModalOpen && (
                    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-xl shadow-xl w-full max-w-xl overflow-hidden">
                            <div className="bg-[#1a2f5e] flex items-center justify-between p-4 px-6 text-white">
                                <div>
                                    <h3 className="text-lg font-bold">
                                        {editingItem ? 'Modifier la discipline' : 'Nouvelle discipline'}
                                    </h3>
                                    <p className="text-[10px] text-white/50">Gestion disciplines · Dakar 2026</p>
                                </div>
                                <button onClick={() => setIsModalOpen(false)} className="text-white/70 hover:text-white transition">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4 p-6 text-sm">
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="uppercase block text-xs font-semibold text-slate-600 mb-1">Code</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.code}
                                            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                            className="w-full px-3 py-2 bg-[#edf0f7] border border-slate-200 rounded-sm focus:ring-1 focus:ring-[#c9a227] outline-none"
                                            placeholder="ex: DIS-001"
                                        />
                                    </div>
                                    <div>
                                        <label className="uppercase block text-xs font-semibold text-slate-600 mb-1">Statut</label>
                                        <select
                                            value={formData.statut}
                                            onChange={(e) => setFormData({ ...formData, statut: e.target.value })}
                                            className="w-full px-3 py-2 bg-[#edf0f7] border border-slate-200 rounded-sm focus:ring-1 focus:ring-[#c9a227] outline-none"
                                        >
                                            <option value="Actif">Actif</option>
                                            <option value="Inactif">Inactif</option>
                                            <option value="Terminé">Terminé</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="uppercase block text-xs font-semibold text-slate-600 mb-1">Nom de la discipline</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.nom}
                                        onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                                        className="w-full px-3 py-2 bg-[#edf0f7] border border-slate-200 rounded-sm focus:ring-1 focus:ring-[#c9a227] outline-none"
                                        placeholder="ex: Athlétisme"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="uppercase block text-xs font-semibold text-slate-600 mb-1">Catégorie</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.categorie}
                                            onChange={(e) => setFormData({ ...formData, categorie: e.target.value })}
                                            className="w-full px-3 py-2 bg-[#edf0f7] border border-slate-200 rounded-sm focus:ring-1 focus:ring-[#c9a227] outline-none"
                                            placeholder="ex: Sports individuels"
                                        />
                                    </div>
                                    <div>
                                        <label className="uppercase block text-xs font-semibold text-slate-600 mb-1">Lieu principal</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.lieu}
                                            onChange={(e) => setFormData({ ...formData, lieu: e.target.value })}
                                            className="w-full px-3 py-2 bg-[#edf0f7] border border-slate-200 rounded-sm focus:ring-1 focus:ring-[#c9a227] outline-none"
                                            placeholder="ex: Dakar Arena"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="uppercase block text-xs font-semibold text-slate-600 mb-1">Description</label>
                                    <textarea
                                        rows="3"
                                        value={formData.description || ''}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full px-3 py-2 bg-[#edf0f7] border border-slate-200 rounded-sm focus:ring-1 focus:ring-[#c9a227] outline-none"
                                        placeholder="Description de la discipline..."
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
                                        {editingItem ? 'Mettre à jour' : 'Enregistrer'}
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