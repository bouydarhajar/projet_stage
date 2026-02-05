// src/App.js
import React, { useState, useEffect } from 'react';

const ChefParc = () => {
  const [missions, setMissions] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [selectedMission, setSelectedMission] = useState(null);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [showVehicleStatusModal, setShowVehicleStatusModal] = useState(false);
  const [selectedVehicleForStatus, setSelectedVehicleForStatus] = useState(null);

  // Données initiales
  const initialMissions = [
    {
      id: 'M-8821',
      requester: 'Ahmed Rami',
      department: 'Inspection Division',
      destination: 'Casablanca',
      startDate: '2024-10-12',
      endDate: '2024-10-14',
      passengers: 3,
      priority: 'HIGH',
      status: 'pending'
    },
    {
      id: 'M-8825',
      requester: 'Sarah Mansouri',
      department: 'Academic Affairs',
      destination: 'Rabat',
      startDate: '2024-10-15',
      endDate: '2024-10-15',
      passengers: 1,
      priority: 'MEDIUM',
      status: 'pending'
    },
    {
      id: 'M-8830',
      requester: 'Dr. Alami',
      department: 'HR Department',
      destination: 'Tangier',
      startDate: '2024-10-16',
      endDate: '2024-10-19',
      passengers: 4,
      priority: 'LOW',
      status: 'pending'
    }
  ];

  const initialVehicles = [
    { id: 1, brand: 'Renault', model: 'Master', plate: '12456-A-1', seats: 7, status: 'available', currentMileage: 15200 },
    { id: 2, brand: 'Peugeot', model: '308', plate: '12345-B-2', seats: 5, status: 'maintenance', currentMileage: 45000 },
    { id: 3, brand: 'Toyota', model: 'Hilux', plate: 'B-122', seats: 5, status: 'available', currentMileage: 78000 },
    { id: 4, brand: 'VW', model: 'Caddy', plate: 'C-45', seats: 7, status: 'available', currentMileage: 32000 }
  ];

  useEffect(() => {
    setMissions(initialMissions);
    setVehicles(initialVehicles);
  }, []);

  const handleAssignMission = (mission) => {
    setSelectedMission(mission);
    setShowAssignmentModal(true);
  };

  const handleConfirmAssignment = (assignmentData) => {
    const updatedMissions = missions.map(mission => {
      if (mission.id === assignmentData.missionId) {
        return { 
          ...mission, 
          status: 'validated', 
          assignedVehicleId: assignmentData.vehicleId,
          startMileage: assignmentData.startMileage
        };
      }
      return mission;
    });

    const updatedVehicles = vehicles.map(vehicle => {
      if (vehicle.id === assignmentData.vehicleId) {
        return { 
          ...vehicle, 
          status: 'on_mission',
          currentMileage: assignmentData.startMileage
        };
      }
      return vehicle;
    });

    const mission = missions.find(m => m.id === assignmentData.missionId);
    const vehicle = vehicles.find(v => v.id === assignmentData.vehicleId);
    
    alert(`Mission ${mission.id} validée !\nVéhicule: ${vehicle.brand} ${vehicle.model} (${vehicle.plate})\nNotification envoyée au demandeur.`);

    setMissions(updatedMissions);
    setVehicles(updatedVehicles);
    setShowAssignmentModal(false);
    setSelectedMission(null);
  };

  const handleUpdateVehicleStatus = (vehicle, newStatus) => {
    const updatedVehicles = vehicles.map(v => {
      if (v.id === vehicle.id) {
        return { ...v, status: newStatus };
      }
      return v;
    });
    
    setVehicles(updatedVehicles);
    setShowVehicleStatusModal(false);
    setSelectedVehicleForStatus(null);
    
    alert(`Statut du véhicule ${vehicle.plate} mis à jour: ${getStatusText(newStatus)}`);
  };

  const handleOpenStatusModal = (vehicle) => {
    setSelectedVehicleForStatus(vehicle);
    setShowVehicleStatusModal(true);
  };

  const getAvailableVehicles = () => {
    return vehicles.filter(vehicle => vehicle.status === 'available');
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'available': return 'bg-green-500';
      case 'on_mission': return 'bg-yellow-500';
      case 'maintenance': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status) => {
    switch(status) {
      case 'available': return 'DISPONIBLE';
      case 'on_mission': return 'EN MISSION';
      case 'maintenance': return 'EN MAINTENANCE';
      default: return status.toUpperCase();
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'HIGH': return 'bg-red-500';
      case 'MEDIUM': return 'bg-yellow-500';
      case 'LOW': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const pendingMissions = missions.filter(mission => mission.status === 'pending');
  const activeMissions = missions.filter(mission => mission.status === 'validated');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-900 to-blue-800 text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold mb-1">Direction Provinciale de l'Éducation</h1>
          <h2 className="text-lg font-medium text-blue-100">GESTION DU PARC AUTOMOBILE</h2>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow p-6">
            <div className="text-gray-500 text-sm font-medium mb-2">Missions en attente</div>
            <div className="text-3xl font-bold text-blue-900">{pendingMissions.length}</div>
          </div>
          <div className="bg-white rounded-xl shadow p-6">
            <div className="text-gray-500 text-sm font-medium mb-2">Missions en cours</div>
            <div className="text-3xl font-bold text-green-600">{activeMissions.length}</div>
          </div>
          <div className="bg-white rounded-xl shadow p-6">
            <div className="text-gray-500 text-sm font-medium mb-2">Véhicules disponibles</div>
            <div className="text-3xl font-bold text-blue-600">{getAvailableVehicles().length}</div>
          </div>
        </div>

        {/* Missions Section */}
        <section className="bg-white rounded-xl shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">Ordres de Mission en Attente</h2>
              <button 
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
                onClick={() => alert('Liste actualisée')}
              >
                Actualiser
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    N° Mission
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Demandeur & Service
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Destination
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dates
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    PAX
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priorité
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pendingMissions.map(mission => (
                  <tr key={mission.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-bold text-blue-900">{mission.id}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">{mission.requester}</div>
                        <div className="text-sm text-gray-500">{mission.department}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                      {mission.destination}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-gray-900">{mission.startDate}</div>
                      <div className="text-sm text-gray-500">au {mission.endDate}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-800 font-bold rounded-full">
                        {mission.passengers}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold text-white ${getPriorityColor(mission.priority)}`}>
                        {mission.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button 
                        onClick={() => handleAssignMission(mission)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm transition-colors"
                      >
                        Attribuer véhicule
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Vehicles Section */}
        <section className="bg-white rounded-xl shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-800">Parc Véhicules</h2>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {vehicles.map(vehicle => (
                <div key={vehicle.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-bold text-lg text-gray-800">{vehicle.brand} {vehicle.model}</h3>
                        <p className="text-gray-600 text-sm">{vehicle.plate}</p>
                      </div>
                      <button 
                        onClick={() => handleOpenStatusModal(vehicle)}
                        className="px-3 py-1 border border-blue-600 text-blue-600 text-sm rounded hover:bg-blue-50 transition-colors"
                      >
                        Modifier statut
                      </button>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between">
                        <span className="text-gray-500 text-sm">Places:</span>
                        <span className="font-medium">{vehicle.seats}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500 text-sm">Kilométrage:</span>
                        <span className="font-medium">{vehicle.currentMileage.toLocaleString()} km</span>
                      </div>
                    </div>
                    
                    <div className={`mt-4 py-2 text-center text-white font-medium text-sm ${getStatusColor(vehicle.status)}`}>
                      {getStatusText(vehicle.status)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Active Missions Section */}
        {activeMissions.length > 0 && (
          <section className="bg-white rounded-xl shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800">Missions en Cours</h2>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeMissions.map(mission => {
                  const assignedVehicle = vehicles.find(v => v.id === mission.assignedVehicleId);
                  return (
                    <div key={mission.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow border-l-4 border-l-green-500">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-bold text-lg text-gray-800">Mission {mission.id}</h3>
                        <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-full">
                          EN COURS
                        </span>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex">
                          <span className="text-gray-500 text-sm w-24">Destination:</span>
                          <span className="font-medium">{mission.destination}</span>
                        </div>
                        <div className="flex">
                          <span className="text-gray-500 text-sm w-24">Dates:</span>
                          <span className="font-medium">{mission.startDate} - {mission.endDate}</span>
                        </div>
                        <div className="flex">
                          <span className="text-gray-500 text-sm w-24">Véhicule:</span>
                          <span className="font-medium">
                            {assignedVehicle ? `${assignedVehicle.brand} ${assignedVehicle.model}` : 'Non attribué'}
                          </span>
                        </div>
                        {mission.startMileage && (
                          <div className="flex">
                            <span className="text-gray-500 text-sm w-24">Km départ:</span>
                            <span className="font-medium">{mission.startMileage.toLocaleString()} km</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Assignment Modal */}
      {showAssignmentModal && selectedMission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-900 to-blue-800 text-white p-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Attribuer un véhicule - Mission {selectedMission.id}</h2>
                <button 
                  onClick={() => {
                    setShowAssignmentModal(false);
                    setSelectedMission(null);
                  }}
                  className="text-2xl hover:text-gray-200 transition-colors"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
              {/* Mission Summary */}
              <div className="mb-8 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-bold text-lg text-gray-800 mb-3">Détails de la mission</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-500">Demandeur</div>
                    <div className="font-medium">{selectedMission.requester}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Service</div>
                    <div className="font-medium">{selectedMission.department}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Destination</div>
                    <div className="font-medium">{selectedMission.destination}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Passagers</div>
                    <div className="font-medium">{selectedMission.passengers}</div>
                  </div>
                  <div className="md:col-span-2">
                    <div className="text-sm text-gray-500">Dates</div>
                    <div className="font-medium">{selectedMission.startDate} - {selectedMission.endDate}</div>
                  </div>
                </div>
              </div>

              {/* Vehicle Selection */}
              <h3 className="font-bold text-lg text-gray-800 mb-4">Sélectionner un véhicule</h3>
              
              {getAvailableVehicles().length === 0 ? (
                <div className="text-center py-8 bg-yellow-50 rounded-lg">
                  <p className="text-yellow-700 font-medium">Aucun véhicule disponible</p>
                  <p className="text-yellow-600 text-sm mt-1">Veuillez modifier le statut d'un véhicule en "Disponible"</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {getAvailableVehicles().map(vehicle => (
                    <VehicleOption 
                      key={vehicle.id}
                      vehicle={vehicle}
                      mission={selectedMission}
                      onConfirm={handleConfirmAssignment}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Vehicle Status Modal */}
      {showVehicleStatusModal && selectedVehicleForStatus && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-900 to-blue-800 text-white p-6 rounded-t-xl">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Changer le statut</h2>
                <button 
                  onClick={() => {
                    setShowVehicleStatusModal(false);
                    setSelectedVehicleForStatus(null);
                  }}
                  className="text-2xl hover:text-gray-200 transition-colors"
                >
                  ×
                </button>
              </div>
              <p className="text-blue-100 mt-1">{selectedVehicleForStatus.brand} {selectedVehicleForStatus.model} - {selectedVehicleForStatus.plate}</p>
            </div>

            {/* Body */}
            <div className="p-6">
              <div className="mb-6 p-4 bg-gray-50 rounded-lg text-center">
                <p className="text-gray-600 text-sm">Statut actuel</p>
                <p className={`mt-1 font-bold text-lg ${getStatusColor(selectedVehicleForStatus.status).replace('bg-', 'text-')}`}>
                  {getStatusText(selectedVehicleForStatus.status)}
                </p>
              </div>

              <h3 className="font-bold text-gray-800 mb-4">Sélectionner le nouveau statut:</h3>
              
              <div className="space-y-3">
                <button 
                  onClick={() => handleUpdateVehicleStatus(selectedVehicleForStatus, 'available')}
                  className="w-full p-4 border-2 border-green-200 hover:border-green-500 hover:bg-green-50 rounded-lg flex items-center space-x-3 transition-all group"
                >
                  <div className="w-4 h-4 rounded-full bg-green-500 group-hover:scale-125 transition-transform"></div>
                  <div className="text-left">
                    <div className="font-bold text-gray-800">Disponible</div>
                    <div className="text-sm text-gray-600">Véhicule prêt pour une mission</div>
                  </div>
                </button>

                <button 
                  onClick={() => handleUpdateVehicleStatus(selectedVehicleForStatus, 'on_mission')}
                  className="w-full p-4 border-2 border-yellow-200 hover:border-yellow-500 hover:bg-yellow-50 rounded-lg flex items-center space-x-3 transition-all group"
                >
                  <div className="w-4 h-4 rounded-full bg-yellow-500 group-hover:scale-125 transition-transform"></div>
                  <div className="text-left">
                    <div className="font-bold text-gray-800">En mission</div>
                    <div className="text-sm text-gray-600">Véhicule actuellement en mission</div>
                  </div>
                </button>

                <button 
                  onClick={() => handleUpdateVehicleStatus(selectedVehicleForStatus, 'maintenance')}
                  className="w-full p-4 border-2 border-red-200 hover:border-red-500 hover:bg-red-50 rounded-lg flex items-center space-x-3 transition-all group"
                >
                  <div className="w-4 h-4 rounded-full bg-red-500 group-hover:scale-125 transition-transform"></div>
                  <div className="text-left">
                    <div className="font-bold text-gray-800">En maintenance</div>
                    <div className="text-sm text-gray-600">Véhicule en réparation/entretien</div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Vehicle Option Component
const VehicleOption = ({ vehicle, mission, onConfirm }) => {
  const [startMileage, setStartMileage] = useState(vehicle.currentMileage.toString());

  const handleAssign = () => {
    if (!startMileage || isNaN(startMileage) || parseInt(startMileage) < vehicle.currentMileage) {
      alert(`Veuillez saisir un kilométrage valide (minimum: ${vehicle.currentMileage} km)`);
      return;
    }

    onConfirm({
      missionId: mission.id,
      vehicleId: vehicle.id,
      startMileage: parseInt(startMileage)
    });
  };

  return (
    <div className="border border-gray-300 rounded-lg p-4 hover:border-blue-500 hover:bg-blue-50 transition-all">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
        <div>
          <h4 className="font-bold text-lg text-gray-800">{vehicle.brand} {vehicle.model}</h4>
          <p className="text-gray-600">{vehicle.plate} • {vehicle.seats} places</p>
          <p className="text-sm text-gray-500 mt-1">Kilométrage actuel: {vehicle.currentMileage.toLocaleString()} km</p>
        </div>
        <span className="mt-2 md:mt-0 px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
          DISPONIBLE
        </span>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Kilométrage de départ
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="number"
              value={startMileage}
              onChange={(e) => setStartMileage(e.target.value)}
              min={vehicle.currentMileage}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Saisir le kilométrage"
            />
            <span className="text-gray-500 font-medium w-10">km</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Minimum: {vehicle.currentMileage.toLocaleString()} km
          </p>
        </div>

        <button 
          onClick={handleAssign}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
        >
          Attribuer ce véhicule à la mission
        </button>
      </div>
    </div>
  );
};

export default ChefParc;