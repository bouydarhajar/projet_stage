import { LogOut } from "lucide-react";
import axios from "axios";

export default function LogoutButton() {
  const handleLogout = async () => {
    try {
      await axios.post(
        "http://localhost:8000/api/logout",
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      );
      localStorage.removeItem("token");
      window.location.href = "/";
    } catch (error) {
      console.error("Erreur lors du logout :", error);
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors w-full"
    >
      <LogOut size={20} />
      <span className="font-medium">Logout</span>
    </button>
  );
}
