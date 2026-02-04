import React, { useState } from 'react';
import { Calendar, MapPin, User, Car, Settings, ChevronDown, Check, AlertCircle } from 'lucide-react';

const FleetManagement = () => {
  const [selectedTab, setSelectedTab] = useState('pending');
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [selectedDriver, setSelectedDriver] = useState('');

  const assignments = [
    {
      id: 'M-8821',
      requester: 'Ahmed Rami',
      department: 'Rabat/Sola Oceanica',
      destination: 'Casablanca',
      dates: '12 Oct - 14 Oct',
      pax: 3,
      priority: 'ÉLEVÉE'
    },
    {
      id: 'M-8825',
      requester: 'Sarah Mansouri',
      department: 'Ministère des Affaires',
      destination: 'Rabat',
      dates: '15 Oct - 15 Oct',
      pax: 1,
      priority: 'MOYENNE'
    },
    {
      id: 'M-8830',
      requester: 'Dr. Alami',
      department: 'Département',
      destination: 'Tanger',
      dates: '16 Oct - 19 Oct',
      pax: 4,
      priority: 'BASSE'
    }
  ];

  const vehicles = [
    { id: 1, name: 'Renault Master', model: 'Fourgon 9 pl. 10456-A-1', status: 'DISPONIBLE' },
    { id: 2, name: 'Dacia Duster', model: '5 Places - VN 36621-B-4', status: 'DISPONIBLE' },
    { id: 3, name: 'Peugeot 308', model: 'Maintenance programmée', status: 'EN ATELIER' }
  ];

  const fleetTimeline = [
    { vehicle: 'Toyota Hiace (B-1234)', days: ['LUN 12', 'MAR 13', 'MER 14'], status: 'assigned' },
    { vehicle: 'VW Caddy (C-4567)', days: ['MER 14', 'JEU 15', 'VEN 16'], status: 'assigned' }
  ];

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'ÉLEVÉE': return 'bg-red-100 text-red-700 border-red-200';
      case 'MOYENNE': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'BASSE': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'DISPONIBLE': return 'bg-emerald-100 text-emerald-700 border-emerald-300';
      case 'EN ATELIER': return 'bg-rose-100 text-rose-700 border-rose-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-blue-600 p-2.5 rounded-xl shadow-lg shadow-blue-600/30">
                <Car className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  Direction Provinciale de l'Éducation
                </h1>
                <p className="text-sm text-slate-500 mt-0.5">GESTION DE FLOTTE - Tableau de bord Chef de Parc</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <nav className="flex gap-1 bg-slate-100 rounded-xl p-1">
                {['Missions', 'Flotte', 'Chauffeurs', 'Planning'].map((item) => (
                  <button
                    key={item}
                    className="px-4 py-2 rounded-lg text-sm font-medium transition-all hover:bg-white hover:shadow-sm text-slate-600 hover:text-slate-900"
                  >
                    {item}
                  </button>
                ))}
              </nav>
              <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <Settings className="w-5 h-5 text-slate-600" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-[1600px] mx-auto px-6 py-8">
        <div className="grid grid-cols-3 gap-8">
          {/* Left Column - Assignments */}
          <div className="col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
              <div className="p-6 border-b border-slate-100">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-slate-800">Affectation Véhicule & Chauffeur</h2>
                  <button className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50">
                    Imprimer Ordre Groupé
                  </button>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 border-b border-slate-200">
                  {[
                    { id: 'pending', label: 'Affectations en Attente', count: 15 },
                    { id: 'scheduled', label: 'Planifiées' },
                    { id: 'progress', label: 'En Cours' }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setSelectedTab(tab.id)}
                      className={`px-4 py-3 font-medium text-sm transition-all relative ${
                        selectedTab === tab.id
                          ? 'text-blue-600'
                          : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      {tab.label}
                      {tab.count && (
                        <span className="ml-2 bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full text-xs font-semibold">
                          {tab.count}
                        </span>
                      )}
                      {selectedTab === tab.id && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Assignments List */}
              <div className="divide-y divide-slate-100">
                {assignments.map((assignment) => (
                  <div
                    key={assignment.id}
                    className="p-6 hover:bg-slate-50 transition-colors cursor-pointer group"
                    onClick={() => setSelectedVehicle(assignment.id)}
                  >
                    <div className="flex items-start gap-4">
                      <div className="bg-blue-600 text-white px-3 py-2 rounded-lg font-bold text-sm shadow-md min-w-[80px] text-center">
                        {assignment.id}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-bold text-slate-800 text-lg group-hover:text-blue-600 transition-colors">
                              {assignment.requester}
                            </h3>
                            <p className="text-sm text-slate-500 mt-0.5">{assignment.department}</p>
                          </div>
                          <span className={`px-3 py-1 rounded-lg text-xs font-bold border ${getPriorityColor(assignment.priority)}`}>
                            {assignment.priority}
                          </span>
                        </div>
                        <div className="flex items-center gap-6 text-sm text-slate-600">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-slate-400" />
                            <span className="font-medium">{assignment.destination}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-slate-400" />
                            <span>{assignment.dates}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-slate-400" />
                            <span>{assignment.pax} PAX</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Fleet Timeline */}
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-800">Calendrier de Disponibilité de la Flotte</h3>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span className="text-slate-600">Affecté</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-slate-200"></div>
                    <span className="text-slate-600">Disponible</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-8 gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  <div className="col-span-2"></div>
                  {['Lun 12', 'Mar 13', 'Mer 14', 'Jeu 15', 'Ven 16', 'Sam 17'].map((day) => (
                    <div key={day} className="text-center">{day}</div>
                  ))}
                </div>

                {fleetTimeline.map((item, idx) => (
                  <div key={idx} className="grid grid-cols-8 gap-2 items-center">
                    <div className="col-span-2 text-sm font-medium text-slate-700">{item.vehicle}</div>
                    {['LUN 12', 'MAR 13', 'MER 14', 'JEU 15', 'VEN 16', 'SAM 17'].map((day) => (
                      <div
                        key={day}
                        className={`h-10 rounded-lg transition-all ${
                          item.days.includes(day)
                            ? 'bg-blue-500 shadow-md'
                            : 'bg-slate-100 hover:bg-slate-200'
                        }`}
                      />
                    ))}
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-slate-200">
                <div className="flex items-center gap-4">
                  <div className="text-sm text-slate-500">Stats Hebdomadaires</div>
                  <div className="flex-1 bg-slate-100 rounded-full h-3 overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full" style={{ width: '82%' }}></div>
                  </div>
                  <div className="text-2xl font-bold text-slate-800">82%</div>
                  <div className="text-sm text-slate-500">Utilisation</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Active Assignment */}
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-2xl p-6 text-white">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold opacity-90">AFFECTATION ACTIVE</h3>
                <button className="p-1 hover:bg-white/20 rounded-lg transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-6 border border-white/20">
                <div className="text-sm opacity-75 mb-1">Mission M-8821</div>
                <div className="text-xl font-bold">Rabat/Sola Oceanica</div>
                <div className="text-sm mt-2 opacity-90">12 Oct, 14 Oct (3 Jours)</div>
              </div>

              <div className="space-y-4">
                {/* Select Vehicle */}
                <div>
                  <label className="block text-sm font-medium mb-3 opacity-90">Sélectionner un Véhicule</label>
                  <div className="space-y-2">
                    {vehicles.map((vehicle) => (
                      <button
                        key={vehicle.id}
                        onClick={() => setSelectedVehicle(vehicle.id)}
                        disabled={vehicle.status === 'EN ATELIER'}
                        className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                          selectedVehicle === vehicle.id
                            ? 'bg-white text-slate-800 border-white shadow-lg'
                            : vehicle.status === 'EN ATELIER'
                            ? 'bg-white/5 border-white/10 opacity-40 cursor-not-allowed'
                            : 'bg-white/10 border-white/20 hover:bg-white/20 hover:border-white/30'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="font-bold text-base">{vehicle.name}</div>
                            <div className={`text-xs mt-1 ${selectedVehicle === vehicle.id ? 'text-slate-500' : 'opacity-75'}`}>
                              {vehicle.model}
                            </div>
                          </div>
                          <span className={`px-3 py-1 rounded-lg text-xs font-bold border ${
                            selectedVehicle === vehicle.id
                              ? getStatusColor(vehicle.status)
                              : 'border-white/40 bg-white/20'
                          }`}>
                            {vehicle.status}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Assign Driver */}
                <div>
                  <label className="block text-sm font-medium mb-3 opacity-90">Affecter un Chauffeur</label>
                  <div className="relative">
                    <select
                      value={selectedDriver}
                      onChange={(e) => setSelectedDriver(e.target.value)}
                      className="w-full p-4 pr-10 rounded-xl bg-white/10 border-2 border-white/20 text-white appearance-none cursor-pointer hover:bg-white/20 transition-all focus:outline-none focus:ring-2 focus:ring-white/50"
                    >
                      <option value="" className="text-slate-800">Mustapha Eskimi (Disponible)</option>
                      <option value="driver2" className="text-slate-800">Hassan Alami (Disponible)</option>
                      <option value="driver3" className="text-slate-800">Fatima Zahra (En Mission)</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none" />
                  </div>
                  <div className="mt-3 p-3 bg-blue-500/30 rounded-lg border border-blue-400/30 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <p className="text-xs leading-relaxed">
                      Le chauffeur Mustapha est certifié pour les véhicules lourds de transport de passagers (Permis B)
                    </p>
                  </div>
                </div>

                {/* Conflicts */}
                <div className="p-4 bg-emerald-500/20 rounded-xl border border-emerald-400/30 flex items-center gap-2">
                  <Check className="w-5 h-5 text-emerald-300" />
                  <span className="text-sm font-medium">Aucun conflit de planning détecté</span>
                </div>

                {/* Confirm Button */}
                <button className="w-full bg-white text-blue-600 py-4 rounded-xl font-bold text-base shadow-2xl hover:shadow-3xl hover:scale-[1.02] transition-all">
                  Confirmer & Dispatcher
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FleetManagement;