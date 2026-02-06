import React, { useState, useEffect } from 'react';

const ChefParc = () => {
  const [missions, setMissions] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [selectedMission, setSelectedMission] = useState(null);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [showVehicleStatusModal, setShowVehicleStatusModal] = useState(false);
  const [selectedVehicleForStatus, setSelectedVehicleForStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Charger les données depuis l'API
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      };

      const [missionsResponse, vehiclesResponse] = await Promise.all([
        fetch('http://localhost:8000/api/missions?for_chef_parc=true', { headers }),
        fetch('http://localhost:8000/api/vehicles', { headers })
      ]);

      if (!missionsResponse.ok || !vehiclesResponse.ok) {
        throw new Error('Erreur lors du chargement des données');
      }

      const missionsData = await missionsResponse.json();
      const vehiclesData = await vehiclesResponse.json();

      setMissions(missionsData);
      setVehicles(vehiclesData);
    } catch (err) {
      setError(err.message);
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignMission = (mission) => {
    setSelectedMission(mission);
    setShowAssignmentModal(true);
  };

  const handleConfirmAssignment = async (assignmentData) => {
    try {
      const token = localStorage.getItem('token');
      
      // Valider la mission avec le véhicule assigné
      const response = await fetch(`http://localhost:8000/api/missions/${assignmentData.missionId}/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          vehicle_id: assignmentData.vehicleId,
          start_mileage: assignmentData.startMileage
        })
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'assignation');
      }

      const updatedMission = await response.json();
      
      alert(`Mission ${updatedMission.id} validée !\nNotification envoyée au demandeur.`);

      // Rafraîchir les données
      await fetchData();
      
      setShowAssignmentModal(false);
      setSelectedMission(null);
    } catch (err) {
      console.error('Erreur:', err);
      alert('Erreur lors de l\'assignation: ' + err.message);
    }
  };

  const handleUpdateVehicleStatus = async (vehicle, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:8000/api/vehicles/${vehicle.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour du statut');
      }

      const updatedVehicle = await response.json();
      
      // Mettre à jour l'état local
      setVehicles(vehicles.map(v => 
        v.id === updatedVehicle.id ? updatedVehicle : v
      ));
      
      setShowVehicleStatusModal(false);
      setSelectedVehicleForStatus(null);
      
      alert(`Statut du véhicule ${vehicle.plate} mis à jour: ${getStatusText(newStatus)}`);
    } catch (err) {
      console.error('Erreur:', err);
      alert('Erreur lors de la mise à jour: ' + err.message);
    }
  };

  const handleOpenStatusModal = (vehicle) => {
    setSelectedVehicleForStatus(vehicle);
    setShowVehicleStatusModal(true);
  };

  const handleRefresh = async () => {
    await fetchData();
    alert('Liste actualisée avec succès');
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

  const pendingMissions = missions.filter(mission => mission.statut === 'en_attente');
  const activeMissions = missions.filter(mission => mission.statut === 'valide' || mission.statut === 'en_cours');

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">Chargement des données...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl border border-red-200 p-8 max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2 text-center">Erreur de chargement</h3>
          <p className="text-gray-600 text-center mb-4">{error}</p>
          <button
            onClick={fetchData}
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
                onClick={handleRefresh}
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
                    Employé & DOTI
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Objectif
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Itinéraire
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dates
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
                      <span className="font-bold text-blue-900">M-{mission.id}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">{mission.employe?.nom} {mission.employe?.prenom}</div>
                        <div className="text-sm text-gray-500">DOTI: {mission.doti_id}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-900">{mission.objectif}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-900">{mission.itineraire}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-gray-900">{mission.date_depart}</div>
                      <div className="text-sm text-gray-500">au {mission.date_retour}</div>
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
                {pendingMissions.length === 0 && (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                      Aucune mission en attente
                    </td>
                  </tr>
                )}
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
                        <span className="font-medium">{vehicle.current_mileage?.toLocaleString()} km</span>
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
                  const assignedVehicle = vehicles.find(v => v.id === mission.vehicle_id);
                  return (
                    <div key={mission.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow border-l-4 border-l-green-500">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-bold text-lg text-gray-800">Mission M-{mission.id}</h3>
                        <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-full">
                          EN COURS
                        </span>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex">
                          <span className="text-gray-500 text-sm w-24">Employé:</span>
                          <span className="font-medium">{mission.employe?.nom} {mission.employe?.prenom}</span>
                        </div>
                        <div className="flex">
                          <span className="text-gray-500 text-sm w-24">Objectif:</span>
                          <span className="font-medium text-sm">{mission.objectif}</span>
                        </div>
                        <div className="flex">
                          <span className="text-gray-500 text-sm w-24">Dates:</span>
                          <span className="font-medium">{mission.date_depart} - {mission.date_retour}</span>
                        </div>
                        <div className="flex">
                          <span className="text-gray-500 text-sm w-24">Véhicule:</span>
                          <span className="font-medium">
                            {assignedVehicle ? `${assignedVehicle.brand} ${assignedVehicle.model}` : 'Non attribué'}
                          </span>
                        </div>
                        {mission.start_mileage && (
                          <div className="flex">
                            <span className="text-gray-500 text-sm w-24">Km départ:</span>
                            <span className="font-medium">{mission.start_mileage.toLocaleString()} km</span>
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
                <h2 className="text-xl font-bold">Attribuer un véhicule - Mission M-{selectedMission.id}</h2>
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
                    <div className="text-sm text-gray-500">Employé</div>
                    <div className="font-medium">{selectedMission.employe?.nom} {selectedMission.employe?.prenom}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">DOTI</div>
                    <div className="font-medium">{selectedMission.doti_id}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Objectif</div>
                    <div className="font-medium">{selectedMission.objectif}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Itinéraire</div>
                    <div className="font-medium">{selectedMission.itineraire}</div>
                  </div>
                  <div className="md:col-span-2">
                    <div className="text-sm text-gray-500">Dates</div>
                    <div className="font-medium">{selectedMission.date_depart} - {selectedMission.date_retour}</div>
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
  const [startMileage, setStartMileage] = useState(vehicle.current_mileage?.toString() || '0');

  const handleAssign = () => {
    if (!startMileage || isNaN(startMileage) || parseInt(startMileage) < (vehicle.current_mileage || 0)) {
      alert(`Veuillez saisir un kilométrage valide (minimum: ${vehicle.current_mileage || 0} km)`);
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
          <p className="text-sm text-gray-500 mt-1">Kilométrage actuel: {vehicle.current_mileage?.toLocaleString() || 0} km</p>
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
              min={vehicle.current_mileage || 0}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Saisir le kilométrage"
            />
            <span className="text-gray-500 font-medium w-10">km</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Minimum: {vehicle.current_mileage?.toLocaleString() || 0} km
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