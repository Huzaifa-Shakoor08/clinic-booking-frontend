import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

const DoctorDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const res = await API.get("/appointments/doctor");
      setAppointments(res.data);
    } catch {
      setMessage({ text: "Failed to load appointments.", type: "error" });
    }
  };

  const updateStatus = async (id, status) => {
    setLoading(true);
    try {
      await API.put(`/appointments/${id}/status`, JSON.stringify(status), {
        headers: { "Content-Type": "application/json" },
      });
      setMessage({ text: `Appointment ${status} successfully.`, type: "success" });
      fetchAppointments();
    } catch {
      setMessage({ text: "Update failed.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Confirmed": return "bg-green-100 text-green-700";
      case "Cancelled": return "bg-red-100 text-red-700";
      case "Completed": return "bg-blue-100 text-blue-700";
      default: return "bg-yellow-100 text-yellow-700";
    }
  };

  return (
   <div className="min-h-screen bg-gray-50 overflow-x-hidden">

      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-green-600 rounded-xl flex items-center justify-center">
              <span className="text-lg">🏥</span>
            </div>
            <span className="font-bold text-gray-800 text-lg">ClinicBook</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-sm">👨‍⚕️</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">{user?.fullName}</p>
                <p className="text-xs text-gray-500">Doctor</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-xl text-sm font-medium cursor-pointer"
            >
              <span>🚪</span> Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-8">

        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-2xl p-6 mb-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-1">
               Welcome, {user?.fullName}! 👨‍⚕️
              </h1>
              <p className="text-green-200">
                Manage your patient appointments from here.
              </p>
            </div>
            <div className="hidden sm:block text-6xl opacity-20">⚕️</div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total", value: appointments.length, emoji: "📋", },
            { label: "Pending", value: appointments.filter(a => a.status === "Pending").length, emoji: "⏳", },
            { label: "Confirmed", value: appointments.filter(a => a.status === "Confirmed").length, emoji: "✅", },
            { label: "Completed", value: appointments.filter(a => a.status === "Completed").length, emoji: "🏁", },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">{stat.emoji}</span>
                <span className="text-2xl font-bold text-gray-800">{stat.value}</span>
              </div>
              <p className="text-sm text-gray-500">{stat.label} Appointments</p>
            </div>
          ))}
        </div>

        {/* Message */}
        {message.text && (
          <div className={`flex items-center gap-3 px-4 py-3 rounded-xl mb-6 text-sm font-medium ${
            message.type === "success"
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}>
            <span>{message.type === "success" ? "✅" : "⚠️"}</span>
            <span>{message.text}</span>
          </div>
        )}

        {/* Appointments */}
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Patient Appointments
        </h3>

        {appointments.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
            <div className="text-6xl mb-4">📅</div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No appointments yet</h3>
            <p className="text-gray-400">Your patient appointments will appear here.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {appointments.map((a) => (
              <div key={a.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center text-2xl">
                      🧑‍⚕️
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">{a.patientName}</h3>
                      <p className="text-sm text-gray-500">Patient</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(a.status)}`}>
                    {a.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-100">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Date</p>
                    <p className="text-sm font-medium text-gray-700">📅 {a.slotDate}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Time</p>
                    <p className="text-sm font-medium text-gray-700">🕐 {a.startTime} - {a.endTime}</p>
                  </div>
                  {a.notes && (
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Notes</p>
                      <p className="text-sm font-medium text-gray-700">📝 {a.notes}</p>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 mt-4">
                  {a.status === "Pending" && (
                    <button
                      onClick={() => updateStatus(a.id, "Confirmed")}
                      disabled={loading}
                      className="bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-medium cursor-pointer disabled:opacity-50"
                    >
                      ✅ Confirm
                    </button>
                  )}
                  {status === "Confirmed" && (
                    <button
                      onClick={() => updateStatus(a.id, "Completed")}
                      disabled={loading}
                      className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium cursor-pointer disabled:opacity-50"
                    >
                      🏁 Mark Complete
                    </button>
                  )}
                  {a.status !== "Cancelled" && a.status !== "Completed" && (
                    <button
                      onClick={() => updateStatus(a.id, "Cancelled")}
                      disabled={loading}
                      className="bg-red-50 text-red-600 px-4 py-2 rounded-xl text-sm font-medium cursor-pointer disabled:opacity-50"
                    >
                      ❌ Cancel
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorDashboard;