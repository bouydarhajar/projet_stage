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
    doti_id: '',
    fonction: '',
    lieu_affectation: '',
    objectif: '',
    itineraire: '',
    date_depart: '',
    date_retour: '',
    transport_type: '',
    statut: 'brouillon'
  });

  // Récupération des données depuis l'API
  useEffect(() => {
    fetchEmployes();
  }, []);

  const fetchEmployes = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('http://localhost:8000/api/employes', {
        method: 'GET',
        headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
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

  const getRandomColor = () => {
    const colors = [
      'bg-blue-500', 'bg-emerald-500', 'bg-rose-500', 'bg-amber-500',
      'bg-indigo-500', 'bg-purple-500', 'bg-pink-500', 'bg-cyan-500'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const formattedEmployes = employes.map(emp => ({
    ...emp,
    initiales: `${emp.prenom?.charAt(0) || ''}${emp.nom?.charAt(0) || ''}`.toUpperCase(),
    color: getRandomColor()
  }));

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

  const getTabCount = (status) => {
    if (status === 'all') return employes.length;
    return employes.filter(emp => emp.statut === status).length;
  };

  const handleAddMission = (employe) => {
    setSelectedEmploye(employe);
    
    setNewMission({
      doti_id: employe.Doti,
      fonction: employe.fonction,
      lieu_affectation: 'Direction provinciale du MENPS Ouarzazate',
      objectif: '',
      itineraire: '',
      date_depart: '',
      date_retour: '',
      transport_type: '',
      statut: 'brouillon'
    });
    
    setIsMissionModalOpen(true);
  };

  // Convertir la date du format input (YYYY-MM-DD) vers YYYY-MM-DD pour l'API
  const handleDateChange = (field, value) => {
    setNewMission(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveMission = async () => {
    if (!selectedEmploye) return;

    try {
      // Validation des champs obligatoires
      if (!newMission.objectif || !newMission.itineraire || !newMission.date_depart || !newMission.date_retour) {
        alert('Veuillez remplir tous les champs obligatoires');
        return;
      }

      // Préparer les données pour l'API selon le format attendu par MissionController
      const missionData = {
        doti_id: newMission.doti_id,
        fonction: newMission.fonction,
        lieu_affectation: newMission.lieu_affectation,
        objectif: newMission.objectif,
        itineraire: newMission.itineraire,
        date_depart: newMission.date_depart,
        date_retour: newMission.date_retour,
        transport_type: newMission.transport_type,
        statut: 'en_attente' // Selon le contrôleur, statut par défaut
      };

      console.log('Données envoyées à l\'API:', missionData);

      // Envoyer à l'API avec gestion d'erreur améliorée
      const response = await fetch('http://localhost:8000/api/missions', {
        method: 'POST',
       headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(missionData)
      });

      // Vérifier le type de contenu de la réponse
      const contentType = response.headers.get('content-type');
      
      if (!contentType || !contentType.includes('application/json')) {
        // Si la réponse n'est pas du JSON, lire le texte pour voir ce qui est retourné
        const text = await response.text();
        console.error('Réponse non-JSON:', text.substring(0, 500));
        
        if (text.includes('<!DOCTYPE')) {
          throw new Error('L\'API a retourné une page HTML au lieu de JSON. Vérifiez que l\'endpoint API existe et fonctionne correctement.');
        }
        
        throw new Error(`Réponse serveur inattendue: ${text.substring(0, 100)}...`);
      }

      const data = await response.json();

      if (!response.ok) {
        // Gérer les erreurs de validation ou autres erreurs du serveur
        if (data.errors) {
          const errorMessages = Object.values(data.errors).flat().join(', ');
          throw new Error(`Erreur de validation: ${errorMessages}`);
        }
        throw new Error(data.message || 'Erreur lors de la création de la mission');
      }

      alert('Ordre de mission créé avec succès!');
      setIsMissionModalOpen(false);
      resetMissionForm();
      
      // Rafraîchir la liste des employés
      fetchEmployes();
    } catch (err) {
      console.error('Erreur complète:', err);
      alert('Erreur lors de la création de la mission: ' + err.message);
    }
  };

  const handleSendToChefParc = async () => {
    if (!selectedEmploye) return;

    try {
      // Validation des champs obligatoires
      if (!newMission.objectif || !newMission.itineraire || !newMission.date_depart || !newMission.date_retour) {
        alert('Veuillez remplir tous les champs obligatoires');
        return;
      }

      // Préparer les données pour l'API (statut en attente)
      const missionData = {
        doti_id: newMission.doti_id,
        fonction: newMission.fonction,
        lieu_affectation: newMission.lieu_affectation,
        objectif: newMission.objectif,
        itineraire: newMission.itineraire,
        date_depart: newMission.date_depart,
        date_retour: newMission.date_retour,
        transport_type: newMission.transport_type,
        statut: 'en_attente'
      };

      console.log('Envoi au chef de parc:', missionData);

      const response = await fetch('http://localhost:8000/api/missions', {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },

        body: JSON.stringify(missionData)
      });

      // Vérifier le type de contenu de la réponse
      const contentType = response.headers.get('content-type');
      
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Réponse non-JSON:', text.substring(0, 500));
        
        if (text.includes('<!DOCTYPE')) {
          throw new Error('L\'API a retourné une page HTML au lieu de JSON. Vérifiez que l\'endpoint API existe et fonctionne correctement.');
        }
        
        throw new Error(`Réponse serveur inattendue: ${text.substring(0, 100)}...`);
      }

      const data = await response.json();

      if (!response.ok) {
        if (data.errors) {
          const errorMessages = Object.values(data.errors).flat().join(', ');
          throw new Error(`Erreur de validation: ${errorMessages}`);
        }
        throw new Error(data.message || 'Erreur lors de l\'envoi au chef de parc');
      }

      alert('Ordre de mission envoyé au chef de parc avec succès!');
      setIsMissionModalOpen(false);
      resetMissionForm();
    } catch (err) {
      console.error('Erreur complète:', err);
      alert('Erreur lors de l\'envoi: ' + err.message);
    }
  };

  const resetMissionForm = () => {
    setNewMission({
      doti_id: '',
      fonction: '',
      lieu_affectation: '',
      objectif: '',
      itineraire: '',
      date_depart: '',
      date_retour: '',
      transport_type: '',
      statut: 'brouillon'
    });
  };

  const handleMissionChange = (field, value) => {
    setNewMission(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleTransportChange = (transport) => {
    setNewMission(prev => ({
      ...prev,
      transport_type: transport === 'voiture de service' ? 'voiture' : transport
      
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
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },

      });

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression');
      }

      alert('Employé supprimé avec succès!');
      fetchEmployes();
    } catch (err) {
      console.error('Erreur:', err);
      alert('Erreur lors de la suppression: ' + err.message);
    }
  };

  // Fonction d'impression modifiée selon la règle
  const handlePrint = () => {
    // Vérifier si le moyen de transport est "voiture de service" ou "voiture"
    if (newMission.transport_type === 'voiture de service' || newMission.transport_type === 'voiture') {
      alert('L\'impression n\'est pas autorisée pour les missions en voiture de service.');
      return;
    }

    // Créer une nouvelle fenêtre pour l'impression
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    
    if (!printWindow) {
      alert('Veuillez autoriser les pop-ups pour imprimer le document.');
      return;
    }

    // HTML pour l'impression
    const printContent = `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Ordre de Mission</title>
        <style>
          @page {
            size: A4;
            margin: 20mm;
          }
          body {
            font-family: 'Times New Roman', serif;
            line-height: 1.5;
            color: #000;
            margin: 0;
            padding: 0;
          }
          .print-container {
            max-width: 210mm;
            margin: 0 auto;
            padding: 20mm;
          }
          .header {
            text-align: center;
            margin-bottom: 20px;
            border-bottom: 2px solid #000;
            padding-bottom: 10px;
          }
          .header h1 {
            font-size: 18pt;
            margin: 5px 0;
            font-weight: bold;
          }
          .header h2 {
            font-size: 16pt;
            margin: 10px 0;
          }
          .header h3 {
            font-size: 14pt;
            margin: 5px 0;
            font-weight: normal;
          }
          .order-title {
            text-align: center;
            font-size: 20pt;
            font-weight: bold;
            text-decoration: underline;
            margin: 20px 0;
          }
          .order-info {
            margin-bottom: 20px;
            font-size: 12pt;
          }
          .form-section {
            margin-bottom: 15px;
          }
          .form-row {
            display: flex;
            align-items: baseline;
            margin-bottom: 8px;
          }
          .form-label {
            font-weight: bold;
            min-width: 150px;
          }
          .form-value {
            flex: 1;
            border-bottom: 1px dotted #000;
            padding-left: 10px;
          }
          .signature-section {
            margin-top: 50px;
            display: flex;
            justify-content: space-between;
          }
          .signature-box {
            text-align: center;
            width: 40%;
          }
          .signature-line {
            border-top: 1px solid #000;
            width: 200px;
            margin: 40px auto 5px;
          }
          .no-print {
            display: none !important;
          }
          @media print {
            .no-print {
              display: none !important;
            }
          }
        </style>
      </head>
      <body>
        <div class="print-container">
          <div class="header">
            <h1>ROYAUME DU MAROC</h1>
            <h2>Ministère de l'Éducation Nationale, du Préscolaire et des Sports</h2>
            <h3>Direction Provinciale de Ouarzazate</h3>
          </div>
          
          <div class="order-title">
            ORDRE DE MISSION
          </div>
          
          <div class="order-info">
            <div><strong>Employé:</strong> ${selectedEmploye ? `${selectedEmploye.nom} ${selectedEmploye.prenom}` : ''}</div>
            <div><strong>DOTI:</strong> ${newMission.doti_id || ''}</div>
            <div><strong>Fonction:</strong> ${newMission.fonction || ''}</div>
          </div>
          
          <div class="form-section">
            <div class="form-row">
              <span class="form-label">Lieu d'Affectation :</span>
              <span class="form-value">${newMission.lieu_affectation || ''}</span>
            </div>
            
            <div class="form-row">
              <span class="form-label">Objectif de la Mission :</span>
              <span class="form-value">${newMission.objectif || ''}</span>
            </div>
            
            <div class="form-row">
              <span class="form-label">Itinéraire :</span>
              <span class="form-value">${newMission.itineraire || ''}</span>
            </div>
            
            <div class="form-row">
              <span class="form-label">Date de Départ :</span>
              <span class="form-value">${newMission.date_depart || ''}</span>
            </div>
            
            <div class="form-row">
              <span class="form-label">Date de Retour :</span>
              <span class="form-value">${newMission.date_retour || ''}</span>
            </div>
            
            <div class="form-row">
              <span class="form-label">Moyen de Transport :</span>
              <span class="form-value">${newMission.transport_type || ''}</span>
            </div>
          </div>
          
          <div class="signature-section">
            <div>
              <p><strong>Fait à Ouarzazate le :</strong></p>
              <p>${new Date().toLocaleDateString('fr-FR')}</p>
            </div>
            <div class="signature-box">
              <div class="signature-line"></div>
              <p><strong>Le Directeur provincial</strong></p>
            </div>
          </div>
        </div>
        
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
              setTimeout(function() {
                window.close();
              }, 100);
            }, 100);
          };
        </script>
      </body>
      </html>
    `;

    // Écrire le contenu et imprimer
    printWindow.document.open();
    printWindow.document.write(printContent);
    printWindow.document.close();
  };

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
        {/* Header */}
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

                <div className="col-span-1 flex items-center">
                  <span className="text-sm font-medium text-slate-700 bg-slate-100 px-2 py-1 rounded">
                    {employe.Doti}
                  </span>
                </div>

                <div className="col-span-3 flex items-center">
                  <span className="text-sm text-slate-700">{employe.grade}</span>
                </div>

                <div className="col-span-1 flex items-center">
                  <span className="text-sm font-mono text-slate-700 bg-slate-50 px-2 py-1 rounded border">
                    {employe.CIN}
                  </span>
                </div>

                <div className="col-span-3 flex items-center">
                  <div className="space-y-1">
                    <span className="text-sm text-slate-700">{employe.fonction}</span>
                  </div>
                </div>

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

      {/* Modal Ordre de Mission SIMPLIFIÉ */}
      {isMissionModalOpen && selectedEmploye && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl max-h-[95vh] overflow-y-auto rounded-xl shadow-2xl">
            
            {/* En-tête */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 rounded-t-xl">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold">Nouvel Ordre de Mission</h2>
                  <p className="opacity-90">Pour: {selectedEmploye.nom} {selectedEmploye.prenom}</p>
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
            </div>

            {/* Formulaire simplifié */}
            <div className="p-6 space-y-6">
              {/* Informations employé (lecture seule) */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-800 mb-2">Informations de l'employé</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600">DOTI</label>
                    <div className="font-mono bg-white px-3 py-2 rounded border">{selectedEmploye.Doti}</div>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600">CIN</label>
                    <div className="font-mono bg-white px-3 py-2 rounded border">{selectedEmploye.CIN}</div>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600">Grade</label>
                    <div className="bg-white px-3 py-2 rounded border">{selectedEmploye.grade}</div>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600">Fonction</label>
                    <input
                      type="text"
                      value={newMission.fonction}
                      onChange={(e) => handleMissionChange('fonction', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Détails de la mission */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Lieu d'Affectation *
                  </label>
                  <input
                    type="text"
                    value={newMission.lieu_affectation}
                    onChange={(e) => handleMissionChange('lieu_affectation', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Objectif de la Mission *
                  </label>
                  <textarea
                    value={newMission.objectif}
                    onChange={(e) => handleMissionChange('objectif', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-24"
                    placeholder="Décrivez l'objectif de la mission..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Itinéraire *
                  </label>
                  <input
                    type="text"
                    value={newMission.itineraire}
                    onChange={(e) => handleMissionChange('itineraire', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ex: Ouarzazate → Errachidia → Ouarzazate"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date de Départ *
                    </label>
                    <input
                      type="date"
                      value={newMission.date_depart}
                      onChange={(e) => handleDateChange('date_depart', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date de Retour *
                    </label>
                    <input
                      type="date"
                      value={newMission.date_retour}
                      onChange={(e) => handleDateChange('date_retour', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Moyen de Transport
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <label className={`flex items-center p-3 border rounded-lg cursor-pointer ${newMission.transport_type === 'voiture' ? 'bg-blue-50 border-blue-500' : 'border-gray-300'}`}>
                      <input
                        type="radio"
                        name="transport"
                        checked={newMission.transport_type === 'voiture'}
                        onChange={() => handleTransportChange('voiture de service')}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="ml-2">Voiture de service</span>
                    </label>
                    
                    <label className={`flex items-center p-3 border rounded-lg cursor-pointer ${newMission.transport_type === 'car' ? 'bg-blue-50 border-blue-500' : 'border-gray-300'}`}>
                      <input
                        type="radio"
                        name="transport"
                        checked={newMission.transport_type === 'car'}
                        onChange={() => handleTransportChange('car')}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="ml-2">Car</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Boutons d'action */}
            <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
              <div className="flex justify-between">
                {/* Bouton Imprimer - Conditionnel selon le type de transport */}
                {newMission.transport_type !== 'voiture' && newMission.transport_type !== 'voiture de service' && newMission.transport_type !== '' ? (
                  <button
                    onClick={handlePrint}
                    className="px-6 py-3 bg-slate-600 text-white rounded-lg font-semibold hover:bg-slate-700 transition-colors flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                    Imprimer
                  </button>
                ) : newMission.transport_type === 'voiture' || newMission.transport_type === 'voiture de service' ? (
                  <div className="px-6 py-3 bg-amber-100 border border-amber-300 rounded-lg flex items-center gap-2">
                    <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <span className="text-amber-800 font-medium">Impression non disponible pour les voitures de service</span>
                  </div>
                ) : (
                  <div className="px-6 py-3 bg-gray-100 border border-gray-300 rounded-lg flex items-center gap-2">
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="text-gray-700">Sélectionnez un moyen de transport</span>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => setIsMissionModalOpen(false)}
                    className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                  >
                    Annuler
                  </button>

                  {/* Bouton conditionnel selon le moyen de transport */}
                  {newMission.transport_type === 'voiture' || newMission.transport_type === 'voiture de service' ? (
                    <button
                      onClick={handleSendToChefParc}
                      disabled={!newMission.objectif || !newMission.itineraire || !newMission.date_depart || !newMission.date_retour}
                      className={`px-6 py-3 rounded-lg font-semibold flex items-center gap-2 ${
                        !newMission.objectif || !newMission.itineraire || !newMission.date_depart || !newMission.date_retour
                          ? 'bg-purple-400 cursor-not-allowed'
                          : 'bg-purple-600 hover:bg-purple-700'
                      } text-white transition-colors`}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                      Envoyer au Chef de Parc
                    </button>
                  ) : newMission.transport_type && newMission.transport_type !== '' ? (
                    <button
                      onClick={handleSaveMission}
                      disabled={!newMission.objectif || !newMission.itineraire || !newMission.date_depart || !newMission.date_retour}
                      className={`px-6 py-3 rounded-lg font-semibold ${
                        !newMission.objectif || !newMission.itineraire || !newMission.date_depart || !newMission.date_retour
                          ? 'bg-blue-400 cursor-not-allowed'
                          : 'bg-blue-600 hover:bg-blue-700'
                      } text-white transition-colors`}
                    >
                      Enregistrer l'Ordre
                    </button>
                  ) : null}
                </div>
              </div>

              {/* Message d'information */}
              {newMission.transport_type === 'voiture' && (
                <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-lg flex items-start gap-2">
                  <svg className="w-5 h-5 text-purple-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-sm text-purple-800">
                    <p className="font-semibold">Mission avec voiture de service</p>
                    <p className="mt-1">L'ordre sera envoyé au chef de parc qui affectera un véhicule avant validation finale.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Employes;