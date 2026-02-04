// src/components/Missions.jsx
import React, { useEffect, useState } from "react";
import api from '../../api/axios';
import { Edit2, Trash2, RefreshCw, Download, Truck, X, Save, Calendar, Clock, MapPin, User, Car, Users } from "lucide-react";

function Missions() {
  const [missions, setMissions] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingMission, setEditingMission] = useState(null);
  const [formData, setFormData] = useState({
    doti_id: "",
    fonction: "",
    lieu_affectation: "",
    objectif: "",
    itineraire: "",
    date_depart: "",
    date_retour: "",
    heure_depart: "",
    heure_retour: "",
    transport_type: "",
    accompagnateurs: "",
    statut: "en_attente"
  });

  // Fonction pour charger les employés depuis l'API
  const loadEmployees = async () => {
    try {
      const token = localStorage.getItem("token");
      
      if (!token) {
        return;
      }

      const res = await api.get("/employes", {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });
      
      console.log("Réponse API employés:", res.data);
      
      // Les données sont directement dans res.data (tableau d'employés)
      const employeesData = Array.isArray(res.data) ? res.data : [];
      setEmployees(employeesData);
      
    } catch (err) {
      console.error("Erreur lors du chargement des employés:", err);
    }
  };

  // Fonction pour charger les missions depuis l'API
  const loadMissions = async () => {
    try {
      setLoading(true);
      setError("");
      
      console.log("Chargement des missions depuis l'API...");
      
      // Récupérer le token d'authentification
      const token = localStorage.getItem("token");
      
      if (!token) {
        setError("Vous devez être authentifié pour voir les missions");
        setLoading(false);
        return;
      }

      const res = await api.get("/missions", {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });
      
      console.log("Réponse API missions:", res.data);
      
      // Les données sont directement dans res.data (tableau de missions)
      const missionsData = Array.isArray(res.data) ? res.data : [];
      setMissions(missionsData);
      
    } catch (err) {
      console.error("Erreur lors du chargement des missions:", err);
      
      if (err.response?.status === 401) {
        setError("Session expirée. Veuillez vous reconnecter.");
      } else if (err.response?.status === 403) {
        setError("Vous n'avez pas l'autorisation de voir les missions.");
      } else if (!err.response) {
        setError("Impossible de se connecter au serveur. Vérifiez que Laravel est démarré.");
      } else {
        setError(err.response?.data?.message || "Erreur lors du chargement des missions");
      }
    } finally {
      setLoading(false);
    }
  };

  // Fonction utilitaire pour trouver un employé par DOTI
  const findEmployeeByDoti = (doti) => {
    if (!doti) return null;
    
    // Chercher l'employé avec différents formats de clés
    return employees.find(emp => 
      emp.Doti === doti || 
      emp.doti === doti ||
      emp.doti_id === doti
    ) || null;
  };

  // Fonction utilitaire pour extraire le DOTI d'une mission
  const getDoti = (mission) => {
    if (!mission) return "Non défini";
    
    // Récupérer la valeur
    let doti = "";
    
    // Essayer toutes les clés possibles
    const possibleKeys = [
      mission.employee?.Doti,
      mission.employee?.doti,
      mission.employee?.doti_id,
      mission.doti,
      mission.doti_id
    ];
    
    for (const key of possibleKeys) {
      if (key !== undefined && key !== null && key !== "") {
        doti = String(key); // Convertir explicitement en string
        break;
      }
    }
    
    return doti || "Non défini";
  };

  // Fonction utilitaire pour extraire le nom d'une mission
  const getNom = (mission) => {
    const doti = getDoti(mission);
    const employee = findEmployeeByDoti(doti);
    
    if (employee) {
      // Chercher le nom dans différents formats
      if (employee.nom) return String(employee.nom);
    }
    
    // Vérifier dans l'objet mission
    if (mission.employee?.nom) return String(mission.employee.nom);
    
    return "Non défini";
  };

  // Fonction utilitaire pour extraire le CIN d'une mission
  const getCin = (mission) => {
    const doti = getDoti(mission);
    const employee = findEmployeeByDoti(doti);
    
    if (employee) {
      if (employee.CIN) return String(employee.CIN);
    }
    
    // Vérifier dans l'objet mission
    if (mission.employee?.CIN) return String(mission.employee.CIN);
    return "Non défini";
  };

  // Fonction utilitaire pour extraire le grade d'une mission
  const getGrade = (mission) => {
    const doti = getDoti(mission);
    const employee = findEmployeeByDoti(doti);
    
    if (employee) {
      if (employee.grade) return String(employee.grade);
    }
    
    // Vérifier dans l'objet mission
    if (mission.employee?.grade) return String(mission.employee.grade);
    
    return "Non défini";
  };

  useEffect(() => {
    const loadData = async () => {
      await loadEmployees();
      await loadMissions();
    };
    
    loadData();
  }, []);

  // Fonction pour fermer le modal
  const handleCloseModal = () => {
    setIsEditModalOpen(false);
    setEditingMission(null);
    setFormData({
      doti_id: "",
      fonction: "",
      lieu_affectation: "",
      objectif: "",
      itineraire: "",
      date_depart: "",
      date_retour: "",
      heure_depart: "",
      heure_retour: "",
      transport_type: "",
      accompagnateurs: "",
      statut: "en_attente"
    });
  };

  // Fonction pour gérer les changements dans le formulaire
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Fonction pour ouvrir le modal d'édition
  const handleEdit = (mission) => {
    setEditingMission(mission);
    const doti = getDoti(mission);
    
    // Trouver l'employé correspondant pour pré-remplir le formulaire
    const employee = findEmployeeByDoti(doti);
    
    setFormData({
      doti_id: doti !== "Non défini" ? doti : "",
      fonction: mission.fonction || "",
      lieu_affectation: mission.lieu_affectation || "",
      objectif: mission.objectif || "",
      itineraire: mission.itineraire || "",
      date_depart: mission.date_depart ? mission.date_depart.split('T')[0] : "",
      date_retour: mission.date_retour ? mission.date_retour.split('T')[0] : "",
      heure_depart: mission.heure_depart || "",
      heure_retour: mission.heure_retour || "",
      transport_type: mission.transport_type || "",
      accompagnateurs: mission.accompagnateurs || "",
      statut: mission.statut || "en_attente"
    });
    setIsEditModalOpen(true);
  };

  // Fonction pour soumettre la modification
  const handleUpdate = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem("token");
      
      if (!token) {
        alert("Session expirée. Veuillez vous reconnecter.");
        return;
      }

      // Préparer les données pour l'API
      const updateData = {
        doti_id: formData.doti_id,
        fonction: formData.fonction,
        lieu_affectation: formData.lieu_affectation,
        objectif: formData.objectif,
        itineraire: formData.itineraire,
        date_depart: formData.date_depart,
        date_retour: formData.date_retour,
        heure_depart: formData.heure_depart || null,
        heure_retour: formData.heure_retour || null,
        transport_type: formData.transport_type || null,
        accompagnateurs: formData.accompagnateurs || null,
        statut: formData.statut
      };

      // Nettoyer les données (supprimer les champs vides)
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === null || updateData[key] === undefined || updateData[key] === '') {
          delete updateData[key];
        }
      });

      console.log("Données envoyées à l'API:", updateData);
      
      // Appeler l'API de mise à jour
      const response = await api.put(`/missions/${editingMission.id}`, updateData, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      console.log("Mission mise à jour:", response.data);
      
      // Afficher un message de succès
      alert("Mission mise à jour avec succès !");
      
      // Fermer le modal et recharger les missions
      handleCloseModal();
      await loadMissions();
      
    } catch (err) {
      console.error("Erreur lors de la mise à jour:", err);
      
      if (err.response?.status === 404) {
        alert("Mission non trouvée. Elle a peut-être été supprimée.");
      } else if (err.response?.status === 401) {
        alert("Session expirée. Veuillez vous reconnecter.");
      } else if (err.response?.status === 403) {
        alert("Vous n'avez pas l'autorisation de modifier cette mission.");
      } else if (err.response?.status === 422) {
        const errors = err.response.data.errors;
        if (errors && typeof errors === 'object') {
          const errorMessages = Object.values(errors).flat().join('\n');
          alert(`Erreurs de validation:\n${errorMessages}`);
        } else {
          alert("Erreur de validation des données.");
        }
      } else if (err.response?.data?.message) {
        alert(`Erreur: ${err.response.data.message}`);
      } else {
        alert("Erreur lors de la mise à jour de la mission");
      }
    }
  };

  // Fonction pour supprimer une mission
  const handleDelete = async (missionId) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette mission ? Cette action est irréversible.")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      
      if (!token) {
        alert("Vous devez être authentifié pour supprimer une mission");
        return;
      }

      // Appeler l'API de suppression
      const response = await api.delete(`/missions/${missionId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (response.status === 200) {
        alert("Mission supprimée avec succès");
        await loadMissions();
      } else {
        alert("Erreur lors de la suppression de la mission");
      }
      
    } catch (err) {
      console.error("Erreur lors de la suppression de la mission:", err);
      
      if (err.response?.status === 404) {
        alert("Mission non trouvée. Elle a peut-être déjà été supprimée.");
      } else if (err.response?.status === 401) {
        alert("Session expirée. Veuillez vous reconnecter.");
      } else if (err.response?.status === 403) {
        alert("Vous n'avez pas l'autorisation de supprimer cette mission.");
      } else if (!err.response) {
        alert("Impossible de se connecter au serveur. Vérifiez que Laravel est démarré.");
      } else {
        alert(err.response?.data?.message || "Erreur lors de la suppression de la mission");
      }
    }
  };

  // Fonction pour exporter en CSV
  const handleExportCSV = () => {
    const csvHeaders = ['ID', 'Employé', 'DOTI', 'Fonction', 'Lieu Affectation', 'Objectif', 'Date Départ', 'Date Retour', 'Statut', 'Transport'];
    const csvRows = filteredMissions.map(m => [
      m.id,
      getNom(m),
      getDoti(m),
      m.fonction || 'N/A',
      m.lieu_affectation || 'N/A',
      m.objectif || 'N/A',
      m.date_depart || 'N/A',
      m.date_retour || 'N/A',
      m.statut || 'N/A',
      m.transport_type || 'Non affecté'
    ]);

    const csvContent = [
      csvHeaders.join(','),
      ...csvRows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `missions_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  // Fonction helper pour convertir en string et lowercase de manière sécurisée
  const safeToLower = (value) => {
    if (value === null || value === undefined) return "";
    return String(value).toLowerCase();
  };

  // Mapper les statuts de l'API au format d'affichage
  const formatStatut = (statut) => {
    const statutMap = {
      'en_attente': 'En Attente',
      'approuve': 'Approuvées',
      'en_cours': 'En Cours',
      'termine': 'Terminées',
      'rejete': 'Rejetées',
      'brouillon': 'Brouillons'
    };
    return statutMap[statut] || statut;
  };

  // Calculer les statistiques des onglets
  const tabs = [
    { key: "all", label: "Toutes les Missions", count: missions.length },
    {
      key: "brouillon",
      label: "Brouillons",
      count: missions.filter((m) => m.statut === "brouillon").length,
    },
    {
      key: "en_attente",
      label: "En Attente",
      count: missions.filter((m) => m.statut === "en_attente").length,
    },
    {
      key: "approuve",
      label: "Approuvées",
      count: missions.filter((m) => m.statut === "approuve").length,
    },
    {
      key: "en_cours",
      label: "En Cours",
      count: missions.filter((m) => m.statut === "en_cours").length,
    },
    {
      key: "termine",
      label: "Terminées",
      count: missions.filter((m) => m.statut === "termine").length,
    },
    {
      key: "rejete",
      label: "Rejetées",
      count: missions.filter((m) => m.statut === "rejete").length,
    },
  ];

  // Filtrer les missions selon les critères - VERSION CORRIGÉE
  const filteredMissions = missions.filter((m) => {
    // Filtrer par onglet actif
    if (activeTab !== "all" && m.statut !== activeTab) {
      return false;
    }

    // Filtrer par recherche - Utilisation de safeToLower pour éviter les erreurs
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      
      if (
        !safeToLower(getNom(m)).includes(query) &&
        !safeToLower(getDoti(m)).includes(query) &&
        !safeToLower(m.lieu_affectation).includes(query) &&
        !safeToLower(m.objectif).includes(query)
      ) {
        return false;
      }
    }

    // Filtrer par plage de dates
    if (dateFrom && m.date_depart) {
      try {
        if (new Date(m.date_depart) < new Date(dateFrom)) return false;
      } catch (err) {
        console.error("Erreur de conversion de date:", err);
        return false;
      }
    }
    
    if (dateTo && m.date_depart) {
      try {
        if (new Date(m.date_depart) > new Date(dateTo)) return false;
      } catch (err) {
        console.error("Erreur de conversion de date:", err);
        return false;
      }
    }

    return true;
  });

  const calculateDuration = (depart, retour) => {
    if (!depart || !retour) return "";
    const start = new Date(depart);
    const end = new Date(retour);
    const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    return `${diff} jour${diff > 1 ? "s" : ""}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // Affichage du chargement
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
          <p className="text-gray-600">Chargement des missions...</p>
        </div>
      </div>
    );
  }

  // Affichage de l'erreur
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-white rounded-lg shadow-lg border border-red-200 p-8 max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2 text-center">Erreur</h3>
          <p className="text-slate-600 text-center mb-4">{error}</p>
          <button
            onClick={() => {
              loadEmployees();
              loadMissions();
            }}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Gestion des Missions
              </h1>
              <p className="text-gray-500 mt-1">
                Examiner et gérer les autorisations de voyage pour tout le personnel
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  loadEmployees();
                  loadMissions();
                }}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Actualiser
              </button>
              <button 
                onClick={handleExportCSV}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Download className="w-4 h-4" />
                Exporter CSV
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-8">
          <div className="flex gap-1 border-b border-gray-200 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-3 text-sm font-medium transition-colors relative whitespace-nowrap ${
                  activeTab === tab.key
                    ? "text-blue-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {tab.label}
                <span
                  className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                    activeTab === tab.key
                      ? "bg-blue-100 text-blue-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {tab.count}
                </span>
                {activeTab === tab.key && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-8 py-6">
        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex gap-4 items-center">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Rechercher par DOTI, employé, destination, objectif..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <svg
                className="w-5 h-5 text-gray-400 absolute left-3 top-2.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              placeholder="Date de début"
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              placeholder="Date de fin"
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {(searchQuery || dateFrom || dateTo) && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setDateFrom("");
                  setDateTo("");
                }}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 font-medium"
              >
                Réinitialiser
              </button>
            )}
          </div>
        </div>

        {/* Missions Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  DOTI
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Fonction
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Itinéraire
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Dates
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Transport
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredMissions.length === 0 && (
                <tr>
                  <td
                    colSpan="7"
                    className="px-6 py-12 text-center"
                  >
                    <div className="flex flex-col items-center">
                      <svg className="w-12 h-12 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p className="text-gray-500 font-medium">Aucune mission trouvée</p>
                      <p className="text-gray-400 text-sm mt-1">
                        {searchQuery || dateFrom || dateTo
                          ? "Essayez de modifier vos filtres de recherche"
                          : "Aucune mission n'a été créée pour le moment"}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
              {filteredMissions.map((m, index) => {
                const doti = getDoti(m);
                const nom = getNom(m);
                
                return (
                  <tr
                    key={m.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-gray-900">
                          #{m.id}
                        </span>
                        <span className={`text-xs font-medium mt-1 ${
                          m.statut === 'approuve' ? 'text-green-600' :
                          m.statut === 'en_cours' ? 'text-blue-600' :
                          m.statut === 'termine' ? 'text-gray-600' :
                          m.statut === 'en_attente' ? 'text-yellow-600' :
                          m.statut === 'brouillon' ? 'text-gray-400' :
                          'text-red-600'
                        }`}>
                          {formatStatut(m.statut)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <div className="text-sm font-medium text-gray-900">
                          {doti}
                        </div>
                        {nom !== "Non défini" && (
                          <div className="text-xs text-gray-500 mt-0.5">
                            {nom}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-700">{m.fonction || "Non défini"}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <svg
                          className="w-4 h-4 text-gray-400 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        <span className="text-sm font-medium text-gray-900">
                          {m.itineraire || "Non défini"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-start gap-2">
                        <svg
                          className="w-4 h-4 text-gray-400 mt-0.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {formatDate(m.date_depart)}
                          </div>
                          <div className="text-xs text-gray-500">
                            au {formatDate(m.date_retour)}
                          </div>
                          <div className="text-xs text-gray-400 mt-0.5">
                            {calculateDuration(m.date_depart, m.date_retour)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {m.transport_type ? (
                        <div className="flex items-center gap-2">
                          <Truck className="w-4 h-4 text-blue-600" />
                          <div>
                            <div className="text-sm font-medium text-gray-900 capitalize">
                              {m.transport_type}
                            </div>
                            {m.vehicle && (
                              <div className="text-xs text-gray-500">
                                {m.vehicle.marque} - {m.vehicle.immatriculation}
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400 italic">Non affecté</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleEdit(m)}
                          title="Modifier"
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(m.id)}
                          title="Supprimer"
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Pagination Info */}
          {filteredMissions.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Affichage de <span className="font-semibold">{filteredMissions.length}</span> mission(s) sur{" "}
                  <span className="font-semibold">{missions.length}</span> au total
                </p>
                <div className="flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                    <span className="text-gray-600">En Attente: {missions.filter(m => m.statut === 'en_attente').length}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span className="text-gray-600">Approuvées: {missions.filter(m => m.statut === 'approuve').length}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <span className="text-gray-600">En Cours: {missions.filter(m => m.statut === 'en_cours').length}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal d'édition de mission */}
      {isEditModalOpen && editingMission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            {/* En-tête du modal */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Modifier l'Ordre de Mission</h2>
                <p className="text-sm text-gray-600">Mission #{editingMission.id} - {getNom(editingMission)}</p>
              </div>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Contenu du modal - Formulaire en forme d'ordre de mission */}
            <form onSubmit={handleUpdate} className="p-6">
              {/* En-tête ministériel */}
              <div className="text-center mb-6">
                <h3 className="text-lg font-bold">Royaume du Maroc</h3>
                <h4 className="text-md font-semibold">
                  Ministère de l'Éducation Nationale, du Préscolaire et des sports
                </h4>
                <p className="text-sm">
                  Académie Régionale de l'Éducation et de la Formation de la région Drâa Tafilalet
                </p>
                <p className="text-sm font-semibold">Direction Provinciale de Ouarzazate</p>
                <h2 className="text-xl font-bold mt-2 border-t border-b border-gray-300 py-2">
                  ORDRE DE MISSION
                </h2>
                <div className="flex justify-between items-center mt-2 text-sm">
                  <span>1/2026</span>
                  <span>Service ......</span>
                </div>
              </div>

              {/* Informations de l'employé */}
              <div className="mb-6">
                <p className="mb-4">
                  Il est ordonné à Mr Nom : <span className="font-semibold">{getNom(editingMission)}</span>
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <span className="font-semibold">DOTI :</span> {getDoti(editingMission)}
                    </label>
                    <input
                      type="text"
                      name="doti_id"
                      value={formData.doti_id}
                      onChange={handleInputChange}
                      className="hidden"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <span className="font-semibold">CIN :</span> {getCin(editingMission)}
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Grade</label>
                    <div className="text-sm p-2 border border-gray-300 rounded bg-gray-50">
                      {getGrade(editingMission)}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fonction *</label>
                    <input
                      type="text"
                      name="fonction"
                      value={formData.fonction}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="ADJOINT PEDAGOGIQUE DE SEME GRADE"
                      required
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Lieu d'Affectation</label>
                  <div className="text-sm p-2 border border-gray-300 rounded bg-gray-50">
                    Direction provinciale du MENPS Ouarzazate
                  </div>
                </div>
              </div>

              {/* Détails de la mission */}
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">De se Rendre à *</label>
                  <input
                    type="text"
                    name="lieu_affectation"
                    value={formData.lieu_affectation}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: ERRACHIDIA"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Objet de la Mission *</label>
                  <input
                    type="text"
                    name="objectif"
                    value={formData.objectif}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: Mission administrative"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Itinéraire</label>
                  <input
                    type="text"
                    name="itineraire"
                    value={formData.itineraire}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: Ouarzazate - ERRACHIDIA Ouarzazate -"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date de Départ *</label>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <input
                        type="date"
                        name="date_depart"
                        value={formData.date_depart}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Heure de Départ</label>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <input
                        type="time"
                        name="heure_depart"
                        value={formData.heure_depart}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date de Retour *</label>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <input
                        type="date"
                        name="date_retour"
                        value={formData.date_retour}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Heure de Retour</label>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <input
                        type="time"
                        name="heure_retour"
                        value={formData.heure_retour}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Moyen de Transport</label>
                  <div className="flex items-center gap-2">
                    <Car className="w-4 h-4 text-gray-400" />
                    <select
                      name="transport_type"
                      value={formData.transport_type}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Sélectionner un moyen de transport</option>
                      <option value="voiture de service">Voiture de service</option>
                      <option value="voiture personnelle">Voiture personnelle</option>
                      <option value="transport public">Transport public</option>
                      <option value="avion">Avion</option>
                      <option value="train">Train</option>
                      <option value="autre">Autre</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Accompagné de</label>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      name="accompagnateurs"
                      value={formData.accompagnateurs}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ex: Deux élèves et un professeur"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Statut de la mission</label>
                  <select
                    name="statut"
                    value={formData.statut}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="brouillon">Brouillon</option>
                    <option value="en_attente">En Attente</option>
                    <option value="approuve">Approuvée</option>
                    <option value="en_cours">En Cours</option>
                    <option value="termine">Terminée</option>
                    <option value="rejete">Rejetée</option>
                  </select>
                </div>
              </div>

              <div className="text-sm text-gray-500 italic mb-6">
                <p>A Ouarzazate le : {new Date().toLocaleDateString('fr-FR')}</p>
                <p className="mt-2">Le Directeur provincial</p>
              </div>

              {/* Boutons d'action */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Enregistrer les modifications
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Missions;