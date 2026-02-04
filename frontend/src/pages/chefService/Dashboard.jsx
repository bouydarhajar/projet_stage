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
    activeMissions: 24,
    activeMissionsChange: 15,
    pendingValidations: 12,
    pendingValidationsChange: -6,
    vehicleRequests: 5,
    vehicleRequestsChange: -2,
    budgetUsed: 65,
    fleetAvailability: 4
  });

  const [recentActivity, setRecentActivity] = useState([
    {
      id: 1,
      type: "mission_request",
      title: "New Mission Request #8482",
      description: "Submitted by Mohammed Alami for regional inspection in Kenitra.",
      time: "15 MINS AGO",
      icon: "file"
    },
    {
      id: 2,
      type: "vehicle_assigned",
      title: "Vehicle Assigned",
      description: "Dacia Duster (M-12345) assigned to Mission #8480 (Fatima Zahra).",
      time: "2 HOURS AGO",
      icon: "car"
    },
    {
      id: 3,
      type: "report_submitted",
      title: "Report Submitted",
      description: "Inspection report for Rural School Cluster B is ready for review.",
      time: "YESTERDAY",
      icon: "check"
    }
  ]);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Mission Overview</h2>
        <p className="text-slate-600">
          Monitor active travel, approve requests, and manage fleet allocations.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Active Missions */}
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
            <p className="text-slate-600 text-sm mb-1">Active Missions</p>
            <p className="text-3xl font-bold text-slate-800">{stats.activeMissions}</p>
          </div>
        </div>

        {/* Pending Validations */}
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
            <p className="text-slate-600 text-sm mb-1">Pending Validations</p>
            <p className="text-3xl font-bold text-slate-800">{stats.pendingValidations}</p>
          </div>
        </div>

        {/* Vehicle Requests */}
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
            <p className="text-slate-600 text-sm mb-1">Vehicle Requests</p>
            <p className="text-3xl font-bold text-slate-800">{stats.vehicleRequests}</p>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity Feed - 2 columns */}
        <div className="lg:col-span-2 bg-white rounded-xl border p-6">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-bold text-slate-800">Recent Activity Feed</h3>
          </div>

          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-4 p-4 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <div className={`p-2 rounded-lg ${
                  activity.icon === 'file' ? 'bg-blue-50' :
                  activity.icon === 'car' ? 'bg-green-50' :
                  'bg-purple-50'
                }`}>
                  {activity.icon === 'file' && <FileText className="w-5 h-5 text-blue-600" />}
                  {activity.icon === 'car' && <Car className="w-5 h-5 text-green-600" />}
                  {activity.icon === 'check' && <CheckCircle className="w-5 h-5 text-purple-600" />}
                </div>

                <div className="flex-1">
                  <div className="flex items-start justify-between mb-1">
                    <h4 className="font-semibold text-slate-800">{activity.title}</h4>
                    <span className="text-xs text-slate-500">{activity.time}</span>
                  </div>
                  <p className="text-sm text-slate-600">{activity.description}</p>

                  {activity.icon === 'file' && (
                    <div className="flex gap-2 mt-3">
                      <button className="px-4 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
                        Approve Now
                      </button>
                      <button className="px-4 py-1.5 border border-slate-300 text-slate-700 text-sm rounded-lg hover:bg-slate-50 transition-colors">
                        View Details
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            <button className="w-full py-2 text-blue-600 hover:text-blue-700 font-medium text-sm">
              View All Activity
            </button>
          </div>
        </div>

        {/* Right Column - Map & Stats */}
        <div className="space-y-6">
          {/* Ongoing Locations Map */}
          <div className="bg-white rounded-xl border p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Ongoing Locations</h3>
            
            <div className="relative bg-slate-100 rounded-lg h-48 flex items-center justify-center mb-3">
              <div className="absolute inset-0 rounded-lg overflow-hidden">
                <img 
                  src="/api/placeholder/400/200" 
                  alt="Map"
                  className="w-full h-full object-cover opacity-60"
                />
              </div>
              <div className="relative z-10 text-center">
                <MapPin className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-700">ACTIVE FLEET TRACKING</p>
                <p className="text-xs text-slate-600">Real-time GPS of vehicles tracked</p>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-xl border p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Quick Stats</h3>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-slate-600">Monthly Budget Used</span>
                  <span className="text-sm font-bold text-slate-800">{stats.budgetUsed}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${stats.budgetUsed}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-slate-600">Fleet Availability</span>
                  <span className="text-sm font-bold text-slate-800">{stats.fleetAvailability}/12 Units</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div 
                    className="bg-orange-500 h-2 rounded-full transition-all"
                    style={{ width: `${(stats.fleetAvailability / 12) * 100}%` }}
                  />
                </div>
              </div>
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
    const res = await axios.get("http://127.0.0.1:8000/api/missions", {
      withCredentials: true,
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
      }
    });

    setMissions(res.data);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer cette mission ?")) return;

    await axios.delete(`http://127.0.0.1:8000/api/missions/${id}`, {
      withCredentials: true,
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
      }
    });

    setMissions(missions.filter((m) => m.id !== id));
  };

  const handleEdit = (id) => {
    navigate(`/chef-service/missions/${id}/edit`);
  };

  return (
    <div className="p-6">
     <Missions missions={missions} onDeleteMission={handleDelete} onEditMission={handleEdit}/> 
    </div>
  );
}

function EmployesPage() {
  return (
    <div className="p-6">
     <Employes/> 
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