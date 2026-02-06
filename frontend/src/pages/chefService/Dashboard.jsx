import { useEffect, useState } from "react";
import axios from "axios";
import { Routes, Route, useNavigate } from "react-router-dom";
import Sidebar from "../../component/sidbar";
import TopBar from "../../component/Topbar";
import Missions from "./Missions";

import {
  Users,
  Car,
  MapPin,
  Calendar,
  Pencil,
  Trash2,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  FileText,
  CheckCircle,
  Clock
} from "lucide-react";
import Employes from "./employes";

function Home() {
  const [stats, setStats] = useState({
    activeMissions: 0,
    activeMissionsChange: 0,
    pendingValidations: 0,
    pendingValidationsChange: 0,
    vehicleRequests: 0,
    vehicleRequestsChange: 0,
    budgetUsed: 0,
    fleetAvailability: 0
  });

  const [loading, setLoading] = useState(true);
  const [missionsData, setMissionsData] = useState([]);

  // Fonction pour charger les missions depuis l'API
  const loadMissions = async () => {
    try {
      setLoading(true);
      
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("Aucun token trouvé");
        return;
      }

      const response = await axios.get("http://localhost:8000/api/missions", {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      const missions = Array.isArray(response.data) ? response.data : [];
      setMissionsData(missions);
      
      // Calculer les statistiques dynamiques
      calculateStats(missions);
      
    } catch (err) {
      console.error("Erreur lors du chargement des missions:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour calculer les statistiques basées sur les missions
  const calculateStats = (missions) => {
    if (!missions || missions.length === 0) {
      setStats({
        activeMissions: 0,
        activeMissionsChange: 0,
        pendingValidations: 0,
        pendingValidationsChange: 0,
        vehicleRequests: 0,
        vehicleRequestsChange: 0,
        budgetUsed: 0,
        fleetAvailability: 0
      });
      return;
    }

    // Missions actives (en_cours)
    const activeMissions = missions.filter(m => 
      m.statut === 'en_cours' || m.statut === 'en cours'
    ).length;

    // Validations en attente (en_attente)
    const pendingValidations = missions.filter(m => 
      m.statut === 'en_attente' || m.statut === 'en attente'
    ).length;

    // Demandes de véhicules (missions avec transport_type = 'voiture' et statut = 'en_attente')
    const vehicleRequests = missions.filter(m => 
      (m.transport_type === 'voiture' || m.transport_type === 'voiture de service') &&
      (m.statut === 'en_attente' || m.statut === 'en attente')
    ).length;

    // Calcul des pourcentages de changement (simulés pour l'exemple)
    const activeMissionsChange = activeMissions > 0 ? 15 : 0;
    const pendingValidationsChange = pendingValidations > 0 ? -6 : 0;
    const vehicleRequestsChange = vehicleRequests > 0 ? -2 : 0;

    // Budget utilisé (simulé basé sur le nombre de missions)
    const budgetUsed = Math.min(100, Math.round((missions.length / 50) * 100));
    
    // Disponibilité de la flotte (simulée)
    const totalVehicles = 12;
    const assignedVehicles = missions.filter(m => 
      m.vehicle_id && (m.statut === 'en_cours' || m.statut === 'en cours')
    ).length;
    const fleetAvailability = totalVehicles - Math.min(assignedVehicles, totalVehicles);

    setStats({
      activeMissions,
      activeMissionsChange,
      pendingValidations,
      pendingValidationsChange,
      vehicleRequests,
      vehicleRequestsChange,
      budgetUsed,
      fleetAvailability
    });
  };

  // Charger les données au démarrage
  useEffect(() => {
    loadMissions();
    
    // Rafraîchir les données toutes les 30 secondes
    const intervalId = setInterval(loadMissions, 30000);
    
    return () => clearInterval(intervalId);
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600 font-semibold">Chargement des données...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Tableau de bord des missions</h2>
          <p className="text-slate-600">
            {missionsData.length > 0 
              ? `Suivi de ${missionsData.length} mission(s) - ${stats.activeMissions} en cours`
              : "Aucune mission disponible pour le moment"}
          </p>
        </div>
        <button
          onClick={loadMissions}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Actualiser
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Missions actives */}
        <div className="bg-white rounded-xl border p-5 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <MapPin className="w-5 h-5 text-blue-600" />
            </div>
            <div className={`flex items-center gap-1 text-sm ${
              stats.activeMissionsChange > 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {stats.activeMissionsChange > 0 ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              <span>{Math.abs(stats.activeMissionsChange)}%</span>
            </div>
          </div>
          <div>
            <p className="text-slate-600 text-sm mb-1">Missions Actives</p>
            <p className="text-3xl font-bold text-slate-800">{stats.activeMissions}</p>
            <p className="text-xs text-slate-500 mt-1">
              {stats.activeMissions === 0 
                ? "Aucune mission en cours" 
                : `${stats.activeMissions} mission(s) en cours de réalisation`}
            </p>
          </div>
        </div>

        {/* Validations en attente */}
        <div className="bg-white rounded-xl border p-5 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-3">
            <div className="p-2 bg-orange-50 rounded-lg">
              <AlertCircle className="w-5 h-5 text-orange-600" />
            </div>
            <div className={`flex items-center gap-1 text-sm ${
              stats.pendingValidationsChange > 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {stats.pendingValidationsChange > 0 ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              <span>{Math.abs(stats.pendingValidationsChange)}%</span>
            </div>
          </div>
          <div>
            <p className="text-slate-600 text-sm mb-1">Validations en attente</p>
            <p className="text-3xl font-bold text-slate-800">{stats.pendingValidations}</p>
            <p className="text-xs text-slate-500 mt-1">
              {stats.pendingValidations === 0 
                ? "Toutes les missions sont traitées" 
                : "Attente de validation"}
            </p>
          </div>
        </div>

        {/* Demandes de véhicules */}
        <div className="bg-white rounded-xl border p-5 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-3">
            <div className="p-2 bg-purple-50 rounded-lg">
              <Car className="w-5 h-5 text-purple-600" />
            </div>
            <div className={`flex items-center gap-1 text-sm ${
              stats.vehicleRequestsChange > 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {stats.vehicleRequestsChange > 0 ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              <span>{Math.abs(stats.vehicleRequestsChange)}%</span>
            </div>
          </div>
          <div>
            <p className="text-slate-600 text-sm mb-1">Demandes de véhicules</p>
            <p className="text-3xl font-bold text-slate-800">{stats.vehicleRequests}</p>
            <p className="text-xs text-slate-500 mt-1">
              {stats.vehicleRequests === 0 
                ? "Aucune demande en attente" 
                : "Attente d'affectation de véhicule"}
            </p>
          </div>
        </div>
      </div>

      {/* Sections Répartition et Statistiques en plein écran */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Répartition des missions - en plein écran */}
        <div className="bg-white rounded-xl border p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-slate-800">Répartition des missions</h3>
            <span className="text-sm text-slate-500">
              Total: {missionsData.length} mission(s)
            </span>
          </div>
          
          {missionsData.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <MapPin className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-slate-500">Aucune mission disponible</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-medium text-slate-700">Missions terminées</span>
                  <span className="text-lg font-bold text-slate-800">
                    {missionsData.filter(m => m.statut === 'termine' || m.statut === 'terminee').length}
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3">
                  <div 
                    className="bg-green-600 h-3 rounded-full transition-all"
                    style={{ 
                      width: `${Math.round((missionsData.filter(m => m.statut === 'termine' || m.statut === 'terminee').length / Math.max(missionsData.length, 1)) * 100)}%` 
                    }}
                  />
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  {Math.round((missionsData.filter(m => m.statut === 'termine' || m.statut === 'terminee').length / Math.max(missionsData.length, 1)) * 100)}% du total
                </p>
              </div>

              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-medium text-slate-700">Missions en cours</span>
                  <span className="text-lg font-bold text-slate-800">{stats.activeMissions}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3">
                  <div 
                    className="bg-blue-600 h-3 rounded-full transition-all"
                    style={{ 
                      width: `${Math.round((stats.activeMissions / Math.max(missionsData.length, 1)) * 100)}%` 
                    }}
                  />
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  {Math.round((stats.activeMissions / Math.max(missionsData.length, 1)) * 100)}% du total
                </p>
              </div>

              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-medium text-slate-700">Missions en attente</span>
                  <span className="text-lg font-bold text-slate-800">{stats.pendingValidations}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3">
                  <div 
                    className="bg-orange-500 h-3 rounded-full transition-all"
                    style={{ 
                      width: `${Math.round((stats.pendingValidations / Math.max(missionsData.length, 1)) * 100)}%` 
                    }}
                  />
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  {Math.round((stats.pendingValidations / Math.max(missionsData.length, 1)) * 100)}% du total
                </p>
              </div>

              {/* Légende */}
              <div className="flex items-center justify-center gap-4 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                  <span className="text-xs text-slate-600">Terminées</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                  <span className="text-xs text-slate-600">En cours</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <span className="text-xs text-slate-600">En attente</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Statistiques rapides - en plein écran */}
        <div className="bg-white rounded-xl border p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-slate-800">Statistiques rapides</h3>
            <span className="text-sm text-slate-500">
              Aperçu global
            </span>
          </div>
          
          <div className="space-y-6">
            {/* Cartes de statistiques */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-2 bg-white rounded-lg">
                    <FileText className="w-4 h-4 text-blue-600" />
                  </div>
                  <p className="text-xs text-blue-600 font-medium">Total missions</p>
                </div>
                <p className="text-3xl font-bold text-slate-800">{missionsData.length}</p>
                <p className="text-xs text-slate-500 mt-1">
                  {missionsData.length === 0 ? "Aucune mission" : "Toutes missions confondues"}
                </p>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-2 bg-white rounded-lg">
                    <Car className="w-4 h-4 text-green-600" />
                  </div>
                  <p className="text-xs text-green-600 font-medium">Véhicules utilisés</p>
                </div>
                <p className="text-3xl font-bold text-slate-800">
                  {missionsData.filter(m => m.transport_type === 'voiture' || m.transport_type === 'voiture de service').length}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Missions avec véhicule
                </p>
              </div>
            </div>

            {/* Disponibilité de la flotte */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-purple-50 rounded">
                    <Car className="w-4 h-4 text-purple-600" />
                  </div>
                  <span className="text-sm font-medium text-slate-700">Disponibilité flotte</span>
                </div>
                <span className="text-lg font-bold text-slate-800">{stats.fleetAvailability}/12 Unités</span>
              </div>
              
              <div className="w-full bg-slate-100 rounded-full h-3 mb-2">
                <div 
                  className="bg-purple-600 h-3 rounded-full transition-all"
                  style={{ width: `${Math.round((stats.fleetAvailability / 12) * 100)}%` }}
                />
              </div>
              
              <div className="flex justify-between items-center">
                <p className="text-xs text-slate-500">
                  {stats.fleetAvailability === 12 
                    ? "Tous les véhicules sont disponibles" 
                    : `${stats.fleetAvailability} véhicule(s) disponible(s)`}
                </p>
                <span className="text-xs font-medium text-purple-600">
                  {Math.round((stats.fleetAvailability / 12) * 100)}%
                </span>
              </div>
            </div>

            {/* Budget utilisé */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-orange-50 rounded">
                    <TrendingUp className="w-4 h-4 text-orange-600" />
                  </div>
                  <span className="text-sm font-medium text-slate-700">Budget utilisé</span>
                </div>
                <span className="text-lg font-bold text-slate-800">{stats.budgetUsed}%</span>
              </div>
              
              <div className="w-full bg-slate-100 rounded-full h-3 mb-2">
                <div 
                  className="bg-orange-500 h-3 rounded-full transition-all"
                  style={{ width: `${stats.budgetUsed}%` }}
                />
              </div>
              
              <p className="text-xs text-slate-500">
                {stats.budgetUsed < 50 
                  ? "Budget bien maîtrisé" 
                  : stats.budgetUsed < 80 
                  ? "Utilisation modérée du budget" 
                  : "Budget presque épuisé"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MissionsTable() {
  const [missions, setMissions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadMissions();
  }, []);

  const loadMissions = async () => {
    try {
      const res = await axios.get("http://localhost:8000/api/missions", {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });

      setMissions(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Erreur lors du chargement des missions:", err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer cette mission ?")) return;

    try {
      await axios.delete(`http://localhost:8000/api/missions/${id}`, {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });

      setMissions(missions.filter((m) => m.id !== id));
    } catch (err) {
      console.error("Erreur lors de la suppression:", err);
    }
  };

  const handleEdit = (id) => {
    navigate(`/chef-service/missions/${id}/edit`);
  };

  return (
    <div className="p-6">
      <Missions missions={missions} onDeleteMission={handleDelete} onEditMission={handleEdit} onRefresh={loadMissions} />
    </div>
  );
}

function EmployesPage() {
  return (
    <div className="p-6">
      <Employes /> 
    </div>
  );
}

export default function ChefServiceDashboard() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <div className="flex-1 bg-slate-50">
        <TopBar profile="Chef de service" />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/missions" element={<MissionsTable />} />
          <Route path="/employes" element={<EmployesPage />} />
        </Routes>
      </div>
    </div>
  );
}