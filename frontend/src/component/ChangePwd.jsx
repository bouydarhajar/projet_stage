import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function ChangePassword() {
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const navigate = useNavigate();

  const handleChangePassword = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        "http://localhost:8000/api/change-password",
        {
          password: password,
          password_confirmation: passwordConfirm,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setMessage("Mot de passe changé avec succès !");
      setIsError(false);
      setPassword("");
      setPasswordConfirm("");

      // Redirection après 2 secondes
      setTimeout(() => {
        localStorage.removeItem("token"); // Optionnel : supprimer le token
        navigate("/");
      }, 2000);
    } catch (error) {
      console.error("Erreur :", error);
      setIsError(true);
      if (error.response && error.response.data.errors) {
        setMessage(Object.values(error.response.data.errors).join(" "));
      } else {
        setMessage("Erreur lors du changement de mot de passe");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Changer le mot de passe
        </h2>

        <form onSubmit={handleChangePassword} className="space-y-5">
          {/* Nouveau mot de passe */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Nouveau mot de passe
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
              placeholder="Entrez votre nouveau mot de passe"
              required
            />
          </div>

          {/* Confirmer mot de passe */}
          <div>
            <label
              htmlFor="passwordConfirm"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Confirmer le mot de passe
            </label>
            <input
              id="passwordConfirm"
              type="password"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
              placeholder="Confirmez votre mot de passe"
              required
            />
          </div>

          {/* Bouton */}
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2.5 px-4 rounded-lg font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition duration-200 shadow-md"
          >
            Changer le mot de passe
          </button>

          {/* Message */}
          {message && (
            <div
              className={`p-4 rounded-lg text-sm font-medium ${
                isError
                  ? "bg-red-50 text-red-800 border border-red-200"
                  : "bg-green-50 text-green-800 border border-green-200"
              }`}
            >
              {message}
              {!isError && (
                <span className="block mt-1 text-xs">
                  Redirection vers la page de connexion...
                </span>
              )}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}