import { NavLink } from "react-router-dom";
import { LayoutDashboard, MapPin, Users, Car, BarChart3, Settings, LogOut } from "lucide-react";

export default function Sidebar() {
  return (
    <div className="w-64 min-h-screen bg-slate-900 text-white flex flex-col">

      {/* Logo Section */}
      <div className="p-5 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <LayoutDashboard size={20} />
          </div>
          <div>
            <div className="font-bold text-white text-base">
              Provincial Directorate
            </div>
            <div className="text-xs text-slate-400">
              Education Department
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">

        <NavLink
          to="/chef-service"
          end
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
              isActive 
                ? "bg-blue-600 text-white" 
                : "text-slate-300 hover:bg-slate-800 hover:text-white"
            }`
          }
        >
          <LayoutDashboard size={20} />
          <span className="font-medium">Dashboard</span>
        </NavLink>

        <NavLink
          to="/chef-service/missions"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
              isActive 
                ? "bg-blue-600 text-white" 
                : "text-slate-300 hover:bg-slate-800 hover:text-white"
            }`
          }
        >
          <MapPin size={20} />
          <span className="font-medium">Missions</span>
        </NavLink>

        <NavLink
          to="/chef-service/employes"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
              isActive 
                ? "bg-blue-600 text-white" 
                : "text-slate-300 hover:bg-slate-800 hover:text-white"
            }`
          }
        >
          <Users size={20} />
          <span className="font-medium">Employes (Order Mission)</span>
        </NavLink>

        <NavLink
          to="/chef-service/statistics"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
              isActive 
                ? "bg-blue-600 text-white" 
                : "text-slate-300 hover:bg-slate-800 hover:text-white"
            }`
          }
        >
          <BarChart3 size={20} />
          <span className="font-medium">Statistics</span>
        </NavLink>

      </nav>

      {/* Bottom Section */}
      <div className="p-4 space-y-1 border-t border-slate-800">
        
        <button className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors w-full">
          <Settings size={20} />
          <span className="font-medium">Settings</span>
        </button>

        <button className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors w-full">
          <LogOut size={20} />
          <span className="font-medium">Logout</span>
        </button>

      </div>
    </div>
  );
}