import React, { useState, useEffect } from 'react';

const Employes = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [employes, setEmployes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isMissionModalOpen, setIsMissionModalOpen] = useState(false);
  const [selectedEmploye, setSelectedEmploye] = useState(null);
  const [newMission, setNewMission] = useState({
    numero: '',
    service: '',
    employe_id: '',
    nom_employe: '',
    Doti: '',
    CIN: '',
    grade: '',
    fonction: '',
    lieu_affectation: '',
    destination: '',
    objet_mission: '',
    itineraire: '',
    date_depart: '',
    heure_depart: '',
    date_retour: '',
    heure_retour: '',
    moyen_transport: '',
    immatriculation: '',
    kilometrage: '',
    accompagnateurs: '',
    date_creation: '',
    signataire: 'Le Directeur provincial'
  });

  // Récupération des données depuis l'API
  useEffect(() => {
    fetchEmployes();
  }, []);

  const fetchEmployes = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Remplacer par votre URL d'API
      const response = await fetch('http://localhost:8000/api/employes', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Ajoutez vos headers d'authentification si nécessaire
          // 'Authorization': `Bearer ${token}`
        },
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des données');
      }

      const data = await response.json();
      setEmployes(data);
    } catch (err) {
      setError(err.message);
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour obtenir des couleurs aléatoires pour les avatars
  const getRandomColor = () => {
    const colors = [
      'bg-blue-500', 'bg-emerald-500', 'bg-rose-500', 'bg-amber-500',
      'bg-indigo-500', 'bg-purple-500', 'bg-pink-500', 'bg-cyan-500'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  // Ajouter les initiales et couleurs aux employés
  const formattedEmployes = employes.map(emp => ({
    ...emp,
    initiales: `${emp.prenom?.charAt(0) || ''}${emp.nom?.charAt(0) || ''}`.toUpperCase(),
    color: getRandomColor()
  }));

  // Filtrer les employés selon la recherche et l'onglet actif
  const filteredEmployes = formattedEmployes.filter(employe => {
    const matchesSearch = 
      employe.nom?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employe.prenom?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employe.Doti?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employe.grade?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employe.CIN?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employe.fonction?.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeTab === 'all') return matchesSearch;
    if (activeTab === 'Actif') return matchesSearch && employe.statut === 'Actif';
    if (activeTab === 'En Mission') return matchesSearch && employe.statut === 'En Mission';
    return matchesSearch;
  });

  // Compter les employés par statut
  const getTabCount = (status) => {
    if (status === 'all') return employes.length;
    return employes.filter(emp => emp.statut === status).length;
  };

  const handleAddMission = (employe) => {
    setSelectedEmploye(employe);
    
    // Initialiser les données de la mission avec les informations de l'employé
    const currentDate = new Date();
    const missionNumber = `${currentDate.getFullYear()}/${Math.floor(Math.random() * 1000)}`;
    
    setNewMission({
      numero: missionNumber,
      service: 'Service ......',
      employe_id: employe.id,
      nom_employe: `${employe.nom} ${employe.prenom}`,
      Doti: employe.Doti,
      CIN: employe.CIN,
      grade: employe.grade,
      fonction: employe.fonction,
      lieu_affectation: 'Direction provinciale du MENPS Ouarzazate',
      date_creation: formatDate(currentDate),
      signataire: 'Le Directeur provincial',
      destination: '',
      objet_mission: '',
      itineraire: '',
      date_depart: '',
      heure_depart: '',
      date_retour: '',
      heure_retour: '',
      moyen_transport: '',
      immatriculation: '',
      kilometrage: '',
      accompagnateurs: ''
    });
    
    setIsMissionModalOpen(true);
  };

  const formatDate = (date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handleSaveMission = async () => {
    if (!selectedEmploye) return;

    try {
      // Validation des champs obligatoires
      if (!newMission.destination || !newMission.objet_mission || !newMission.date_depart || !newMission.date_retour) {
        alert('Veuillez remplir tous les champs obligatoires');
        return;
      }

      // Envoi de la mission à l'API
      const response = await fetch('http://localhost:8000/api/missions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newMission)
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la création de la mission');
      }

      const data = await response.json();
      alert('Ordre de mission créé avec succès!');
      setIsMissionModalOpen(false);
      setNewMission({});
      
      // Rafraîchir la liste des employés si nécessaire
      fetchEmployes();
    } catch (err) {
      console.error('Erreur:', err);
      alert('Erreur lors de la création de la mission: ' + err.message);
    }
  };

  const handleMissionChange = (field, value) => {
    setNewMission(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet employé ?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:8000/api/employes/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression');
      }

      alert('Employé supprimé avec succès!');
      // Rafraîchir la liste
      fetchEmployes();
    } catch (err) {
      console.error('Erreur:', err);
      alert('Erreur lors de la suppression: ' + err.message);
    }
  };

  // Affichage du loader
  if (loading) {
    return (
      <div className="p-8 bg-slate-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-semibold">Chargement des données...</p>
        </div>
      </div>
    );
  }

  // Affichage de l'erreur
  if (error) {
    return (
      <div className="p-8 bg-slate-50 min-h-screen flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl border border-red-200 p-8 max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2 text-center">Erreur de chargement</h3>
          <p className="text-slate-600 text-center mb-4">{error}</p>
          <button
            onClick={fetchEmployes}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Gestion du Personnel</h1>
          </div>
          <button
            onClick={fetchEmployes}
            className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Actualiser
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Header avec logo institutionnel */}
        <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-white">
          <div className="flex items-center justify-between">
            <div className="text-right">
              <div className="text-xs text-slate-500">Mise à jour</div>
              <div className="text-sm font-semibold text-slate-700">{new Date().toLocaleDateString('fr-FR')}</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="p-6 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                  activeTab === 'all'
                    ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Tous les Employés
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                  activeTab === 'all' ? 'bg-blue-100' : 'bg-slate-100'
                }`}>
                  {getTabCount('all')}
                </span>
              </button>
              <button
                onClick={() => setActiveTab('Actif')}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                  activeTab === 'Actif'
                    ? 'bg-emerald-50 text-emerald-600 border-b-2 border-emerald-600'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Actifs
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                  activeTab === 'Actif' ? 'bg-emerald-100' : 'bg-slate-100'
                }`}>
                  {getTabCount('Actif')}
                </span>
              </button>
              <button
                onClick={() => setActiveTab('En Mission')}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                  activeTab === 'En Mission'
                    ? 'bg-amber-50 text-amber-600 border-b-2 border-amber-600'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                En Mission
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                  activeTab === 'En Mission' ? 'bg-amber-100' : 'bg-slate-100'
                }`}>
                  {getTabCount('En Mission')}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="p-6 border-b border-slate-100">
          <div className="relative">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Rechercher par nom, Doti, grade, CIN, fonction..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
          <div className="col-span-2">Nom Prénom</div>
          <div className="col-span-1">Doti</div>
          <div className="col-span-3">Grade</div>
          <div className="col-span-1">CIN</div>
          <div className="col-span-3">Fonction</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-slate-100">
          {filteredEmployes.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">Aucun employé trouvé</h3>
              <p className="text-slate-500">Essayez de modifier votre recherche</p>
            </div>
          ) : (
            filteredEmployes.map((employe) => (
              <div key={employe.id} className="grid grid-cols-12 gap-4 px-6 py-5 hover:bg-slate-50 transition-all group">
                {/* Employee Info */}
                <div className="col-span-2 flex items-center gap-3">
                  <div className={`w-12 h-12 ${employe.color} rounded-xl flex items-center justify-center text-white font-bold shadow-lg`}>
                    {employe.initiales}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">
                      {employe.nom} {employe.prenom}
                    </h3>
                  </div>
                </div>

                {/* Doti */}
                <div className="col-span-1 flex items-center">
                  <span className="text-sm font-medium text-slate-700 bg-slate-100 px-2 py-1 rounded">
                    {employe.Doti}
                  </span>
                </div>

                {/* Grade */}
                <div className="col-span-3 flex items-center">
                  <span className="text-sm text-slate-700">{employe.grade}</span>
                </div>

                {/* CIN */}
                <div className="col-span-1 flex items-center">
                  <span className="text-sm font-mono text-slate-700 bg-slate-50 px-2 py-1 rounded border">
                    {employe.CIN}
                  </span>
                </div>

                {/* Fonction */}
                <div className="col-span-3 flex items-center">
                  <div className="space-y-1">
                    <span className="text-sm text-slate-700">{employe.fonction}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="col-span-2 flex items-center justify-end gap-2">
                  <button
                    onClick={() => handleAddMission(employe)}
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg text-xs font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-md flex items-center gap-1.5 group/btn"
                  >
                    <svg className="w-3.5 h-3.5 group-hover/btn:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Ordre de Mission
                  </button>
                  <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors group/btn">
                    <svg className="w-4 h-4 text-slate-400 group-hover/btn:text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button 
                    onClick={() => handleDelete(employe.id)}
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors group/btn"
                  >
                    <svg className="w-4 h-4 text-slate-400 group-hover/btn:text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Summary */}
        {filteredEmployes.length > 0 && (
          <div className="px-6 py-4 border-t border-slate-200 bg-slate-50">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500">
                Total: <span className="font-semibold text-slate-700">{filteredEmployes.length}</span> employé(s) sur {employes.length}
              </p>
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                  <span className="text-slate-600">Actifs: {getTabCount('Actif')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                  <span className="text-slate-600">En Mission: {getTabCount('En Mission')}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal Ordre de Mission */}
      {isMissionModalOpen && selectedEmploye && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl">
            {/* En-tête avec logo institutionnel */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs opacity-90">Royaume du Maroc</div>
                  <h2 className="text-2xl font-bold mt-1">ORDRE DE MISSION</h2>
                  <div className="text-sm mt-2 opacity-90">
                    Ministère de l'Éducation Nationale, du Préscolaire et des sports
                    <br />
                    Direction Provinciale de Ouarzazate
                  </div>
                </div>
                <button
                  onClick={() => setIsMissionModalOpen(false)}
                  className="text-white hover:bg-white/20 p-2 rounded-full transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="mt-4 flex items-center justify-between text-sm">
                <div className="bg-white/20 px-4 py-2 rounded-lg">
                  N°: <span className="font-bold">{newMission.numero}</span>
                </div>
                <div>
                  Service: <span className="font-bold">{newMission.service}</span>
                </div>
              </div>
            </div>

            {/* Contenu du formulaire */}
            <div className="p-8 space-y-6">
              {/* Informations de l'employé */}
              <div className="border-2 border-blue-200 rounded-xl p-6 bg-blue-50">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Nom & Prénom
                    </label>
                    <input
                      type="text"
                      value={newMission.nom_employe}
                      onChange={(e) => handleMissionChange('nom_employe', e.target.value)}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Doti
                    </label>
                    <input
                      type="text"
                      value={newMission.Doti}
                      onChange={(e) => handleMissionChange('Doti', e.target.value)}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg bg-slate-50 font-mono"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      CIN
                    </label>
                    <input
                      type="text"
                      value={newMission.CIN}
                      onChange={(e) => handleMissionChange('CIN', e.target.value)}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg bg-slate-50"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Grade
                    </label>
                    <input
                      type="text"
                      value={newMission.grade}
                      onChange={(e) => handleMissionChange('grade', e.target.value)}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Fonction
                    </label>
                    <input
                      type="text"
                      value={newMission.fonction}
                      onChange={(e) => handleMissionChange('fonction', e.target.value)}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Lieu d'Affectation
                    </label>
                    <input
                      type="text"
                      value={newMission.lieu_affectation}
                      onChange={(e) => handleMissionChange('lieu_affectation', e.target.value)}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg"
                    />
                  </div>
                </div>
              </div>

              {/* Détails de la mission */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Destination *
                  </label>
                  <input
                    type="text"
                    value={newMission.destination}
                    onChange={(e) => handleMissionChange('destination', e.target.value)}
                    placeholder="Ex: ERRACHIDIA"
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Objet de la Mission *
                  </label>
                  <input
                    type="text"
                    value={newMission.objet_mission}
                    onChange={(e) => handleMissionChange('objet_mission', e.target.value)}
                    placeholder="Ex: Mission administrative"
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Itinéraire
                  </label>
                  <input
                    type="text"
                    value={newMission.itineraire}
                    onChange={(e) => handleMissionChange('itineraire', e.target.value)}
                    placeholder="Ex: Ouarzazate - ERRACHIDIA - Ouarzazate"
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              {/* Dates et heures */}
              <div className="grid grid-cols-4 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Date Départ *
                  </label>
                  <input
                    type="date"
                    value={newMission.date_depart}
                    onChange={(e) => handleMissionChange('date_depart', e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Heure Départ
                  </label>
                  <input
                    type="time"
                    value={newMission.heure_depart}
                    onChange={(e) => handleMissionChange('heure_depart', e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Date Retour *
                  </label>
                  <input
                    type="date"
                    value={newMission.date_retour}
                    onChange={(e) => handleMissionChange('date_retour', e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Heure Retour
                  </label>
                  <input
                    type="time"
                    value={newMission.heure_retour}
                    onChange={(e) => handleMissionChange('heure_retour', e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              {/* Transport et accompagnateurs */}
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Moyen de Transport
                  </label>
                  <select
                    value={newMission.moyen_transport}
                    onChange={(e) => handleMissionChange('moyen_transport', e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg"
                  >
                    <option value="">Sélectionner</option>
                    <option value="voiture de service">Voiture de service</option>
                    <option value="train">Train</option>
                    <option value="avion">Avion</option>
                    <option value="bus">Bus</option>
                    <option value="véhicule personnel">Véhicule personnel</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Immatriculation
                  </label>
                  <input
                    type="text"
                    value={newMission.immatriculation}
                    onChange={(e) => handleMissionChange('immatriculation', e.target.value)}
                    placeholder="Ex: M 234414"
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Kilométrage
                  </label>
                  <input
                    type="text"
                    value={newMission.kilometrage}
                    onChange={(e) => handleMissionChange('kilometrage', e.target.value)}
                    placeholder="Ex: 300 Km"
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg"
                  />
                </div>
                <div className="col-span-3">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Accompagné de
                  </label>
                  <textarea
                    value={newMission.accompagnateurs}
                    onChange={(e) => handleMissionChange('accompagnateurs', e.target.value)}
                    placeholder="Ex: Deux élèves et un professeur"
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg h-20"
                    rows={3}
                  />
                </div>
              </div>

              {/* Signature et date */}
              <div className="border-t-2 border-blue-200 pt-6">
                <div className="flex justify-between items-center">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Date de création
                    </label>
                    <input
                      type="text"
                      value={newMission.date_creation}
                      onChange={(e) => handleMissionChange('date_creation', e.target.value)}
                      className="px-4 py-2 border border-slate-300 rounded-lg bg-slate-50"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Signataire
                    </label>
                    <input
                      type="text"
                      value={newMission.signataire}
                      onChange={(e) => handleMissionChange('signataire', e.target.value)}
                      className="px-4 py-2 border border-slate-300 rounded-lg text-center"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Boutons d'action */}
            <div className="p-6 border-t border-slate-200 bg-slate-50 rounded-b-2xl flex justify-between">
              <button
                onClick={() => window.print()}
                className="px-6 py-3 bg-slate-600 text-white rounded-lg font-semibold hover:bg-slate-700 transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Imprimer
              </button>
              <div className="flex gap-3">
                <button
                  onClick={() => setIsMissionModalOpen(false)}
                  className="px-6 py-3 border border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-100 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSaveMission}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Enregistrer l'Ordre
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Employes;