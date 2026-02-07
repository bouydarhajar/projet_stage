// src/components/Missions.jsx
import React, { useEffect, useState } from "react";
import api from '../../api/axios';
import { Edit2, Trash2, RefreshCw, Download, X, Save, Calendar, Clock, Car, Users, Printer, Search, } from "lucide-react";

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
    
    return employees.find(emp => 
      emp.Doti === doti || 
      emp.doti === doti ||
      emp.doti_id === doti
    ) || null;
  };

  // Fonction utilitaire pour extraire le DOTI d'une mission
  const getDoti = (mission) => {
    if (!mission) return "Non défini";
    
    let doti = "";
    
    const possibleKeys = [
      mission.employee?.Doti,
      mission.employee?.doti,
      mission.employee?.doti_id,
      mission.doti,
      mission.doti_id
    ];
    
    for (const key of possibleKeys) {
      if (key !== undefined && key !== null && key !== "") {
        doti = String(key);
        break;
      }
    }
    
    return doti || "Non défini";
  };

  // Fonction utilitaire pour extraire le nom d'une mission
   // Fonction utilitaire pour extraire le nom d'une mission
const getNom = (mission) => {
  // Vérifier d'abord si la relation employee existe
  if (mission?.employee?.nom) {
    return String(mission.employee.nom);
  }

  // Sinon, chercher dans la liste des employés par DOTI
  const doti = getDoti(mission);
  const employee = findEmployeeByDoti(doti);

  if (employee?.nom) {
    return String(employee.nom);
  }

  // Debug: afficher ce qui est disponible
  console.warn("Nom non trouvé pour la mission:", mission);
  console.warn("DOTI:", doti);
  console.warn("Employee trouvé:", employee);

  return "Non défini";
};

  // Fonction utilitaire pour extraire le prénom d'une mission
  const getPrenom = (mission) => {
    const doti = getDoti(mission);
    const employee = findEmployeeByDoti(doti);
    
    if (employee) {
      if (employee.prenom) return String(employee.prenom);
    }
    
    if (mission.employee?.prenom) return String(mission.employee.prenom);
    
    return "";
  };

  // Fonction utilitaire pour extraire le CIN d'une mission
  const getCin = (mission) => {
    const doti = getDoti(mission);
    const employee = findEmployeeByDoti(doti);
    
    if (employee) {
      if (employee.CIN) return String(employee.CIN);
    }
    
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
    
    if (mission.employee?.grade) return String(mission.employee.grade);
    
    return "Non défini";
  };

  // Fonction pour les badges de statut (copiée du dashboard chef)
  const getStatusBadge = (statut) => {
    const statusConfig = {
      'brouillon': { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Brouillon' },
      'en_attente': { bg: 'bg-yellow-100', text: 'text-yellow-800', label: '⏳ En attente' },
      'valide': { bg: 'bg-green-100', text: 'text-green-800', label: '✓ Validée' },
      'en_cours': { bg: 'bg-blue-100', text: 'text-blue-800', label: '🚗 En cours' },
      'terminee': { bg: 'bg-slate-100', text: 'text-slate-800', label: '✓ Terminée' },
      'annulee': { bg: 'bg-red-100', text: 'text-red-800', label: '✗ Annulée' },
      'approuve': { bg: 'bg-green-100', text: 'text-green-800', label: '✓ Validée' },
      'termine': { bg: 'bg-slate-100', text: 'text-slate-800', label: '✓ Terminée' },
      'rejete': { bg: 'bg-red-100', text: 'text-red-800', label: '✗ Annulée' },
    };

    const config = statusConfig[statut] || statusConfig['brouillon'];

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-bold ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  // Fonction pour les badges de transport (copiée du dashboard chef)
  const getTransportBadge = (type) => {
    if (type === 'voiture' || type === 'voiture de service') {
      return <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded">🚗 Voiture</span>;
    }
    if (type === 'car') {
      return <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">🚌 Car</span>;
    }
    return <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded">-</span>;
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

      Object.keys(updateData).forEach(key => {
        if (updateData[key] === null || updateData[key] === undefined || updateData[key] === '') {
          delete updateData[key];
        }
      });

      console.log("Données envoyées à l'API:", updateData);
      
      const response = await api.put(`/missions/${editingMission.id}`, updateData, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      console.log("Mission mise à jour:", response.data);
      
      alert("Mission mise à jour avec succès !");
      
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

  // Fonction pour vérifier si une mission peut être imprimée
  const canPrintMission = (mission) => {
    // Si c'est une mission en voiture de service
    if (mission.transport_type === 'voiture' || mission.transport_type === 'voiture de service') {
      // Vérifier si un véhicule a été affecté
      return mission.vehicle && mission.vehicle.id;
    }
    // Pour les autres types de transport, l'impression est toujours autorisée
    return true;
  };

  // Fonction pour imprimer une mission (copiée du dashboard chef)
  const handlePrint = (mission) => {
    // Vérifier si l'impression est autorisée
    if (!canPrintMission(mission)) {
      alert('⚠️ L\'impression n\'est pas autorisée. Pour les missions en voiture de service, un véhicule doit être affecté.');
      return;
    }

    const selectedEmploye = {
      nom: getNom(mission),
      prenom: getPrenom(mission)
    };

    const newMission = {
      doti_id: getDoti(mission),
      fonction: mission.fonction || "",
      lieu_affectation: mission.lieu_affectation || "",
      objectif: mission.objectif || "",
      itineraire: mission.itineraire || "",
      date_depart: mission.date_depart || "",
      date_retour: mission.date_retour || "",
      transport_type: mission.transport_type || "",
      vehicle: mission.vehicle || null
    };

    const printWindow = window.open('', '_blank', 'width=800,height=600');
    
    if (!printWindow) {
      alert('⚠️ Veuillez autoriser les pop-ups pour imprimer le document.');
      return;
    }

    // Préparer les informations du véhicule si disponible
    const vehicleInfo = newMission.vehicle ? 
      `${newMission.vehicle.brand || ''} ${newMission.vehicle.model || ''} - ${newMission.vehicle.plate || ''}` : 
      '';

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
              <span class="form-value">${newMission.date_depart ? new Date(newMission.date_depart).toLocaleDateString('fr-FR') : ''}</span>
            </div>
            
            <div class="form-row">
              <span class="form-label">Date de Retour :</span>
              <span class="form-value">${newMission.date_retour ? new Date(newMission.date_retour).toLocaleDateString('fr-FR') : ''}</span>
            </div>
            
            <div class="form-row">
              <span class="form-label">Moyen de Transport :</span>
              <span class="form-value">${newMission.transport_type || ''} ${vehicleInfo ? `(${vehicleInfo})` : ''}</span>
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

    printWindow.document.open();
    printWindow.document.write(printContent);
    printWindow.document.close();
  };

  // Fonction pour exporter en CSV
  const handleExportCSV = () => {
    const csvHeaders = ['ID', 'Employé', 'DOTI', 'Fonction', 'Lieu Affectation', 'Objectif', 'Date Départ', 'Date Retour', 'Statut', 'Transport'];
    const csvRows = filteredMissions.map(m => [
      m.id,
      `${getNom(m)} ${getPrenom(m)}`,
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
      key: "valide",
      label: "Validées",
      count: missions.filter((m) => m.statut === "valide" || m.statut === "approuve").length,
    },
    {
      key: "en_cours",
      label: "En Cours",
      count: missions.filter((m) => m.statut === "en_cours").length,
    },
    {
      key: "terminee",
      label: "Terminées",
      count: missions.filter((m) => m.statut === "terminee" || m.statut === "termine").length,
    },
    {
      key: "annulee",
      label: "Annulées",
      count: missions.filter((m) => m.statut === "annulee" || m.statut === "rejete").length,
    },
  ];

  // Filtrer les missions selon les critères
  const filteredMissions = missions.filter((m) => {
    // Filtrer par onglet actif
    if (activeTab !== "all" && m.statut !== activeTab) {
      // Gérer les statuts équivalents
      if (activeTab === "valide" && (m.statut === "valide" || m.statut === "approuve")) {
        return true;
      }
      if (activeTab === "terminee" && (m.statut === "terminee" || m.statut === "termine")) {
        return true;
      }
      if (activeTab === "annulee" && (m.statut === "annulee" || m.statut === "rejete")) {
        return true;
      }
      return false;
    }

    // Filtrer par recherche
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      
      if (
        !safeToLower(getNom(m)).includes(query) &&
        !safeToLower(getPrenom(m)).includes(query) &&
        !safeToLower(getDoti(m)).includes(query) &&
        !safeToLower(m.lieu_affectation).includes(query) &&
        !safeToLower(m.objectif).includes(query) &&
        !safeToLower(m.itineraire).includes(query)
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
    <div className="min-h-screen bg-slate-50 p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Gestion des Missions</h1>
            <p className="text-slate-600 mt-1">Tableau de bord complet des missions</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => {
                loadEmployees();
                loadMissions();
              }}
              className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 transition-colors flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Actualiser
            </button>
            <button 
              onClick={handleExportCSV}
              className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Exporter CSV
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden mb-8">
        <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-white">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-800">Liste des Missions</h2>
            <div className="text-right">
              <div className="text-xs text-slate-500">Mise à jour</div>
              <div className="text-sm font-semibold text-slate-700">{new Date().toLocaleDateString('fr-FR')}</div>
            </div>
          </div>
        </div>

        <div className="p-6 border-b border-slate-200 bg-slate-50">
          <div className="flex gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                  activeTab === tab.key
                    ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {tab.label}
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                  activeTab === tab.key ? 'bg-blue-100' : 'bg-slate-100'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Search and Filters */}
        <div className="p-6 border-b border-slate-100">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher par nom, DOTI, destination, objectif..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2">
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                placeholder="Date de début"
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                placeholder="Date de fin"
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            {(searchQuery || dateFrom || dateTo) && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setDateFrom("");
                  setDateTo("");
                }}
                className="px-4 py-3 text-slate-600 hover:text-slate-900 font-medium bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Réinitialiser les filtres
              </button>
            )}
          </div>
        </div>

        {/* Missions Table - Copiée du dashboard chef */}
        <div className="overflow-x-auto">
          {filteredMissions.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">Aucune mission trouvée</h3>
              <p className="text-slate-500">
                {searchQuery || dateFrom || dateTo
                  ? "Essayez de modifier vos critères de recherche"
                  : "Aucune mission n'a été créée pour le moment"}
              </p>
            </div>
          ) : (
            <>
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">N° Mission</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Employé</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Itinéraire</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Dates</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Transport</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Statut</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Véhicule</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-100">
                  {filteredMissions.map((mission) => (
                    <tr key={mission.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-bold text-purple-900">M-{mission.id}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-slate-500">DOTI: {getDoti(mission)}</div>
                      </td>
                      <td className="px-6 py-4 max-w-xs">
                        <span className="text-sm text-slate-700 line-clamp-1">{mission.itineraire}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-900">{formatDate(mission.date_depart)}</div>
                        <div className="text-xs text-slate-500">au {formatDate(mission.date_retour)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getTransportBadge(mission.transport_type)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(mission.statut)}
                      </td>
                      <td className="px-6 py-4">
                        {mission.vehicle ? (
                          <div className="text-sm">
                            <div className="font-medium text-slate-900">
                              {mission.vehicle.brand} {mission.vehicle.model}
                            </div>
                            <div className="text-slate-500">{mission.vehicle.plate}</div>
                          </div>
                        ) : mission.statut === 'en_attente' && (mission.transport_type === 'voiture' || mission.transport_type === 'voiture de service') ? (
                          <span className="text-sm text-amber-600 font-medium">⏳ Affectation en cours</span>
                        ) : (
                          <span className="text-sm text-slate-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handlePrint(mission)}
                            className={`p-2 rounded-lg transition-colors ${
                              canPrintMission(mission) 
                                ? 'text-blue-600 hover:text-blue-800 hover:bg-blue-50' 
                                : 'text-slate-300 hover:bg-slate-100 cursor-not-allowed'
                            }`}
                            title={canPrintMission(mission) ? "Imprimer" : "Impression non disponible - Véhicule non affecté"}
                            disabled={!canPrintMission(mission)}
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleEdit(mission)}
                            className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Modifier"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(mission.id)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Footer Summary */}
              <div className="px-6 py-4 border-t border-slate-200 bg-slate-50">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-500">
                    Total: <span className="font-semibold text-slate-700">{filteredMissions.length}</span> mission(s) sur {missions.length}
                  </p>
                  <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                      <span className="text-slate-600">En attente: {missions.filter(m => m.statut === 'en_attente').length}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <span className="text-slate-600">Validées: {missions.filter(m => m.statut === 'valide' || m.statut === 'approuve').length}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      <span className="text-slate-600">En cours: {missions.filter(m => m.statut === 'en_cours').length}</span>
                    </div>
                  </div>
                </div>
              </div>
            </>
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