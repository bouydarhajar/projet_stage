import { Search, Bell, MessageSquare, User } from "lucide-react";

export default function TopBar({ profile = "Chef de Service" }) {
  return (
    <div className="h-16 bg-white border-b flex items-center justify-between px-6">
      
      {/* Left Section - Title */}
      <div>
        <h1 className="text-xl font-bold text-slate-800">
          Chef de Service Dashboard
        </h1>
      </div>

      {/* Right Section - Search, Notifications, Profile */}
      <div className="flex items-center gap-4">
        
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search missions, personnel..."
            className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
          />
        </div>

        {/* Notifications */}
        <button className="relative p-2 hover:bg-slate-100 rounded-lg transition-colors">
          <Bell size={20} className="text-slate-600" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* Messages */}
        <button className="relative p-2 hover:bg-slate-100 rounded-lg transition-colors">
          <MessageSquare size={20} className="text-slate-600" />
        </button>

        {/* Profile */}
        <div className="flex items-center gap-3 pl-4 border-l">
          <div className="text-right">
            <div className="text-sm font-semibold text-slate-800">
              Dr. Sarah Mansouri
            </div>
            <div className="text-xs text-slate-500">
              {profile}
            </div>
          </div>
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white font-semibold">
            SM
          </div>
        </div>

      </div>
    </div>
  );
}