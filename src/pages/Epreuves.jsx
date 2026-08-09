import React, { useEffect, useState } from 'react';
import api from '../services/api';
import Navbar from '../components/Layout/Navbar';
import Toast from '../components/Common/Toast';
import { Plus, Edit, Trash2, Eye, Search, X } from 'lucide-react';

export default function Epreuves() {
    const [epreuves, setEpreuves] = useState([]);
    const [disciplines, setDisciplines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const [search, setSearch] = useState('');
    const [disciplineFilter, setDisciplineFilter] = useState('');
    const [sexeFilter, setSexeFilter] = useState('');
    const [statutFilter, setStatutFilter] = useState('');

    const initialFormState = {
        code: '',
        nom: '',
        discipline_id: '',
        sexe: 'H',
        date_epreuve: '',
        heure_epreuve: '10:00',
        lieu: '',
        nb_inscrits: 8,
        statut: 'Programmé'
    };

    const [formData, setFormData] = useState(initialFormState);
    const [toast, setToast] = useState({ message: '', type: 'success' });

    useEffect(() => {
        fetchDisciplines();
        fetchEpreuves();
    }, []);

    const fetchDisciplines = async () => {
        try {
            const res = await api.get('/disciplines');
            setDisciplines(res.data.data || res.data || []);
        } catch (err) {
            showToast('Erreur lors du chargement des disciplines', 'error');
        }
    };

    const fetchEpreuves = async () => {
        try {
            setLoading(true);
            const res = await api.get('/epreuves');
            setEpreuves(res.data.data || res.data || []);
        } catch (err) {
            showToast('Erreur de chargement des épreuves', 'error');
        } finally {
            setLoading(false);
        }
    };

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast({ message: '', type: 'success' }), 4000);
    };

    const handleOpenCreateModal = () => {
        setEditingId(null);
        setFormData({
            ...initialFormState,
            code: `EPR-00${epreuves.length + 1}`,
            discipline_id: disciplines[0]?.id || '',
            date_epreuve: '2026-08-05',
            heure_epreuve: '14:00',
            lieu: 'Stade Léopold Sédar Senghor'
        });
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (epreuve) => {
        setEditingId(epreuve.id);
        setFormData({
            code: epreuve.code || '',
            nom: epreuve.nom || '',
            discipline_id: epreuve.discipline_id || epreuve.discipline?.id || '',
            sexe: epreuve.sexe || 'H',
            date_epreuve: epreuve.date_epreuve || '',
            heure_epreuve: epreuve.heure_epreuve || epreuve.heure || '10:00',
            lieu: epreuve.lieu || '',
            nb_inscrits: epreuve.nb_inscrits || epreuve.inscrits || 8,
            statut: epreuve.statut || 'Programmé'
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await api.put(`/epreuves/${editingId}`, formData);
                showToast('Épreuve modifiée avec succès');
            } else {
                await api.post('/epreuves', formData);
                showToast('Épreuve planifiée avec succès');
            }
            setIsModalOpen(false);
            fetchEpreuves();
        } catch (err) {
            showToast(
                editingId ? 'Erreur lors de la modification' : 'Erreur lors de la planification',
                'error'
            );
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Voulez-vous vraiment supprimer cette épreuve ?')) {
            return;
        }

        try {
            await api.delete(`/epreuves/${id}`);
            showToast('Épreuve supprimée avec succès');
            fetchEpreuves();
        } catch (err) {
            showToast('Erreur lors de la suppression de l\'épreuve', 'error');
        }
    };

    const totalEpreuves = epreuves.length;
    const enCours = epreuves.filter(e => e.statut === 'En cours').length;
    const terminees = epreuves.filter(e => e.statut === 'Terminé' || e.statut === 'Terminée').length;
    const programmees = epreuves.filter(e => e.statut === 'Programmé' || e.statut === 'Programmée').length;

    const filteredEpreuves = epreuves.filter((item) => {
        const matchesSearch =
            item.nom?.toLowerCase().includes(search.toLowerCase()) ||
            item.code?.toLowerCase().includes(search.toLowerCase()) ||
            item.lieu?.toLowerCase().includes(search.toLowerCase());

        const matchesDiscipline = disciplineFilter ? String(item.discipline_id || item.discipline?.id) === String(disciplineFilter) : true;
        const matchesSexe = sexeFilter ? item.sexe === sexeFilter : true;
        const matchesStatut = statutFilter ? item.statut === statutFilter : true;

        return matchesSearch && matchesDiscipline && matchesSexe && matchesStatut;
    });

    return (
        <section>
            <Navbar title="Epreuves" />
            <div className="space-y-6 p-6">
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast({ message: '', type: 'success' })}
                />
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">Gestion des Epreuves · Dakar 2026</h1>
                        <p className="text-slate-500 text-xs">Planifiez des épreuves, Supprimez/Changez le status d'une épreuves.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white p-5 rounded-xl border-t-4 border-slate-700 border-x border-b shadow-sm">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">TOTAL ÉPREUVES</p>
                        <p className="text-3xl font-bold text-slate-800 mt-2">{totalEpreuves}</p>
                    </div>

                    <div className="bg-white p-5 rounded-xl border-t-4 border-orange-500 border-x border-b shadow-sm">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">EN COURS</p>
                        <p className="text-3xl font-bold text-orange-500 mt-2">{enCours}</p>
                    </div>

                    <div className="bg-white p-5 rounded-xl border-t-4 border-emerald-500 border-x border-b shadow-sm">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">TERMINÉES</p>
                        <p className="text-3xl font-bold text-emerald-500 mt-2">{terminees}</p>
                    </div>

                    <div className="bg-white p-5 rounded-xl border-t-4 border-blue-600 border-x border-b shadow-sm">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">PROGRAMMÉES</p>
                        <p className="text-3xl font-bold text-blue-600 mt-2">{programmees}</p>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
                    <button
                        onClick={handleOpenCreateModal}
                        className="bg-[#1a2f5e] text-white px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-slate-800 transition shadow-sm"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Planifier une épreuve</span>
                    </button>

                    <div className="relative flex-1 min-w-50">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Rechercher une épreuve..."
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
                        {disciplines.map((d) => (
                            <option key={d.id} value={d.id}>{d.nom}</option>
                        ))}
                    </select>

                    <select
                        value={sexeFilter}
                        onChange={(e) => setSexeFilter(e.target.value)}
                        className="bg-[#edf0f7]/60 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-600 focus:outline-none"
                    >
                        <option value="">Tous</option>
                        <option value="H">Hommes (H)</option>
                        <option value="F">Femmes (F)</option>
                        <option value="M">Mixte</option>
                    </select>

                    <select
                        value={statutFilter}
                        onChange={(e) => setStatutFilter(e.target.value)}
                        className="bg-[#edf0f7]/60 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-600 focus:outline-none"
                    >
                        <option value="">Tous</option>
                        <option value="Programmé">Programmé</option>
                        <option value="En cours">En cours</option>
                        <option value="Terminé">Terminé</option>
                        <option value="Annulé">Annulé</option>
                    </select>

                    <p className="text-xs text-slate-400 font-medium whitespace-nowrap">
                        {filteredEpreuves.length} résultats
                    </p>
                </div>
                { /* VUES DONNEES EPREUVES (TABLEAU) */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-600 border-collapse whitespace-nowrap">
                            <thead className="bg-slate-50 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-3.5">CODE</th>
                                    <th className="px-6 py-3.5">ÉPREUVE</th>
                                    <th className="px-6 py-3.5">DISCIPLINE</th>
                                    <th className="px-6 py-3.5">SEXE</th>
                                    <th className="px-6 py-3.5">DATE</th>
                                    <th className="px-6 py-3.5">HEURE</th>
                                    <th className="px-6 py-3.5">LIEU</th>
                                    <th className="px-6 py-3.5 text-center">INSCRITS</th>
                                    <th className="px-6 py-3.5">STATUT</th>
                                    <th className="px-6 py-3.5 text-center">ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan="10" className="px-6 py-8 text-center text-slate-400">
                                            Chargement des épreuves...
                                        </td>
                                    </tr>
                                ) : filteredEpreuves.length === 0 ? (
                                    <tr>
                                        <td colSpan="10" className="px-6 py-8 text-center text-slate-400">
                                            Aucune épreuve trouvée.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredEpreuves.map((e) => (
                                        <tr key={e.id} className="hover:bg-slate-50/80 transition-colors">
                                            <td className="px-6 py-4 font-mono text-xs font-semibold text-slate-400">
                                                {e.code}
                                            </td>
                                            <td className="px-6 py-4 font-bold text-slate-800 text-xs">
                                                {e.nom}
                                            </td>
                                            <td className="px-6 py-4 text-slate-500">
                                                {e.discipline?.nom || disciplines.find(d => String(d.id) === String(e.discipline_id))?.nom || '-'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center justify-center w-6 h-6 rounded text-xs font-bold ${e.sexe === 'H' ? 'bg-sky-100 text-sky-700' :
                                                    e.sexe === 'F' ? 'bg-pink-100 text-pink-700' : 'bg-purple-100 text-purple-700'
                                                    }`}>
                                                    {e.sexe || 'H'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-slate-600 font-mono text-xs">
                                                {e.date_epreuve}
                                            </td>
                                            <td className="px-6 py-4 font-mono font-bold text-slate-800 text-xs">
                                                {e.heure_epreuve || e.heure}
                                            </td>
                                            <td className="px-6 py-4 text-slate-500 text-xs">
                                                {e.lieu}
                                            </td>
                                            <td className="px-6 py-4 text-center font-bold text-slate-800">
                                                {e.nb_inscrits || e.inscrits || 0}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-block px-2.5 py-1 rounded text-xs font-semibold ${e.statut === 'Terminé' || e.statut === 'Terminée' ? 'bg-emerald-100 text-emerald-700' :
                                                    e.statut === 'En cours' ? 'bg-orange-100 text-orange-700' :
                                                        e.statut === 'Annulé' ? 'bg-slate-100 text-slate-600' :
                                                            'bg-blue-100 text-blue-700'
                                                    }`}>
                                                    {e.statut}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-center gap-1.5">
                                                    <button onClick={() => handleOpenEditModal(e)} title="Voir" className="p-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded transition">
                                                        <Eye className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button onClick={() => handleOpenEditModal(e)} title="Modifier" className="p-1.5 bg-amber-50 text-amber-600 hover:bg-amber-100 rounded transition">
                                                        <Edit className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button onClick={() => handleDelete(e.id)} title="Supprimer" className="p-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded transition">
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* MODAL DE PLANIFICATION D'EPREUVE (EPREUVES) */}
                {isModalOpen && (
                    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-xl shadow-xl w-full max-w-xl space-y-4 p-0.5 overflow-hidden">
                            <div className="bg-[#1a2f5e] rounded-t-lg flex items-center justify-between border-b p-4 px-6">
                                <div>
                                    <h3 className="text-lg font-bold text-white">
                                        {editingId ? 'Modifier l\'épreuve' : 'Planifier une épreuve'}
                                    </h3>
                                    <p className="text-[10px] text-white/50">Programme officiel · Dakar 2026</p>
                                </div>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="text-white/70 hover:text-white transition"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4 p-6 text-sm">
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="uppercase block text-xs font-semibold text-slate-600 mb-1">Code Épreuve</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.code}
                                            onChange={(ev) => setFormData({ ...formData, code: ev.target.value })}
                                            className="w-full px-3 py-2 bg-[#edf0f7] border border-slate-200 rounded-sm focus:ring-1 focus:ring-[#c9a227] outline-none"
                                            placeholder="ex: EPR-001"
                                        />
                                    </div>
                                    <div>
                                        <label className="uppercase block text-xs font-semibold text-slate-600 mb-1">Discipline</label>
                                        <select
                                            required
                                            value={formData.discipline_id}
                                            onChange={(ev) => setFormData({ ...formData, discipline_id: ev.target.value })}
                                            className="w-full px-3 py-2 bg-[#edf0f7] border border-slate-200 rounded-sm focus:ring-1 focus:ring-[#c9a227] outline-none"
                                        >
                                            <option value="">Sélectionner une discipline</option>
                                            {disciplines.map((d) => (
                                                <option key={d.id} value={d.id}>{d.nom}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="uppercase block text-xs font-semibold text-slate-600 mb-1">Nom de l'épreuve</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.nom}
                                        onChange={(ev) => setFormData({ ...formData, nom: ev.target.value })}
                                        className="w-full px-3 py-2 bg-[#edf0f7] border border-slate-200 rounded-sm focus:ring-1 focus:ring-[#c9a227] outline-none"
                                        placeholder="ex: 100m Hommes"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="uppercase block text-xs font-semibold text-slate-600 mb-1">Sexe</label>
                                        <select
                                            value={formData.sexe}
                                            onChange={(ev) => setFormData({ ...formData, sexe: ev.target.value })}
                                            className="w-full px-3 py-2 bg-[#edf0f7] border border-slate-200 rounded-sm focus:ring-1 focus:ring-[#c9a227] outline-none"
                                        >
                                            <option value="H">Homme (H)</option>
                                            <option value="F">Femme (F)</option>
                                            <option value="M">Mixte (M)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="uppercase block text-xs font-semibold text-slate-600 mb-1">Statut</label>
                                        <select
                                            value={formData.statut}
                                            onChange={(ev) => setFormData({ ...formData, statut: ev.target.value })}
                                            className="w-full px-3 py-2 bg-[#edf0f7] border border-slate-200 rounded-sm focus:ring-1 focus:ring-[#c9a227] outline-none"
                                        >
                                            <option value="Programmé">Programmé</option>
                                            <option value="En cours">En cours</option>
                                            <option value="Terminé">Terminé</option>
                                            <option value="Annulé">Annulé</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="uppercase block text-xs font-semibold text-slate-600 mb-1">Date</label>
                                        <input
                                            type="date"
                                            required
                                            value={formData.date_epreuve}
                                            onChange={(ev) => setFormData({ ...formData, date_epreuve: ev.target.value })}
                                            className="w-full px-3 py-2 bg-[#edf0f7] border border-slate-200 rounded-sm focus:ring-1 focus:ring-[#c9a227] outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="uppercase block text-xs font-semibold text-slate-600 mb-1">Heure</label>
                                        <input
                                            type="time"
                                            required
                                            value={formData.heure_epreuve}
                                            onChange={(ev) => setFormData({ ...formData, heure_epreuve: ev.target.value })}
                                            className="w-full px-3 py-2 bg-[#edf0f7] border border-slate-200 rounded-sm focus:ring-1 focus:ring-[#c9a227] outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="uppercase block text-xs font-semibold text-slate-600 mb-1">Lieu</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.lieu}
                                            onChange={(ev) => setFormData({ ...formData, lieu: ev.target.value })}
                                            className="w-full px-3 py-2 bg-[#edf0f7] border border-slate-200 rounded-sm focus:ring-1 focus:ring-[#c9a227] outline-none"
                                            placeholder="ex: Stade Léopold Sédar Senghor"
                                        />
                                    </div>
                                    <div>
                                        <label className="uppercase block text-xs font-semibold text-slate-600 mb-1">Nombre d'inscrits</label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={formData.nb_inscrits}
                                            onChange={(ev) => setFormData({ ...formData, nb_inscrits: parseInt(ev.target.value) || 0 })}
                                            className="w-full px-3 py-2 bg-[#edf0f7] border border-slate-200 rounded-sm focus:ring-1 focus:ring-[#c9a227] outline-none"
                                        />
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
                                        {editingId ? 'Mettre à jour' : 'Enregistrer'}
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