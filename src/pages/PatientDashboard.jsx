import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

const PatientDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [slots, setSlots] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState({ text: "", type: "" });
  const [activeTab, setActiveTab] = useState("appointments");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAppointments();
    fetchDoctors();
  }, []);

  const fetchAppointments = async () => {
    const res = await API.get("/appointments/my");
    setAppointments(res.data);
  };

  const fetchDoctors = async () => {
    const res = await API.get("/doctors");
    setDoctors(res.data);
  };

  const fetchSlots = async (doctorId) => {
    const res = await API.get(`/timeslots/doctor/${doctorId}`);
    setSlots(res.data);
    setSelectedDoctor(doctorId);
  };

  const bookAppointment = async (slotId) => {
    setLoading(true);
    try {
      await API.post("/appointments", {
        doctorId: selectedDoctor,
        slotId,
        notes,
      });
      setMessage({ text: "Appointment booked successfully!", type: "success" });
      fetchAppointments();
      fetchSlots(selectedDoctor);
    } catch {
      setMessage({ text: "Booking failed. Try again.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const cancelAppointment = async (id) => {
    try {
      await API.delete(`/appointments/${id}`);
      setMessage({ text: "Appointment cancelled.", type: "success" });
      fetchAppointments();
    } catch {
      setMessage({ text: "Cancel failed.", type: "error" });
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
    <div className="min-h-screen bg-gray-50">

      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
              <span className="text-lg">🏥</span>
            </div>
            <span className="font-bold text-gray-800 text-lg">ClinicBook</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-sm">👤</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">{user?.fullName}</p>
                <p className="text-xs text-gray-500">Patient</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-xl text-sm font-medium cursor-pointer transition-all duration-200"
            >
              <span>🚪</span> Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-8">

        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 mb-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-1">
                Welcome back, {user?.fullName?.split(" ")[0]}! 👋
              </h1>
              <p className="text-blue-200">
                Manage your appointments and book new ones easily.
              </p>
            </div>
            <div className="hidden sm:block text-6xl opacity-20">🏥</div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total", value: appointments.length, emoji: "📋", color: "blue" },
            { label: "Pending", value: appointments.filter(a => a.status === "Pending").length, emoji: "⏳", color: "yellow" },
            { label: "Confirmed", value: appointments.filter(a => a.status === "Confirmed").length, emoji: "✅", color: "green" },
            { label: "Completed", value: appointments.filter(a => a.status === "Completed").length, emoji: "🏁", color: "purple" },
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

        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-white p-1 rounded-xl border border-gray-200 w-fit">
          {[
            { key: "appointments", label: "My Appointments", emoji: "📋" },
            { key: "book", label: "Book Appointment", emoji: "➕" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
                activeTab === tab.key
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <span>{tab.emoji}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* My Appointments Tab */}
        {activeTab === "appointments" && (
          <div>
            {appointments.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
                <div className="text-6xl mb-4">📅</div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">No appointments yet</h3>
                <p className="text-gray-400 mb-6">Book your first appointment with a doctor</p>
                <button
                  onClick={() => setActiveTab("book")}
                  className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium cursor-pointer"
                >
                  Book Now →
                </button>
              </div>
            ) : (
              <div className="grid gap-4">
                {appointments.map((a) => (
                  <div key={a.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between flex-wrap gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-2xl">
                          👨‍⚕️
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-800">{a.doctorName}</h3>
                          <p className="text-sm text-gray-500">{a.specialty}</p>
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

                    {a.status === "Pending" && (
                      <button
                        onClick={() => cancelAppointment(a.id)}
                        className="mt-4 text-sm text-red-600 bg-red-50 px-4 py-2 rounded-lg font-medium cursor-pointer"
                      >
                        Cancel Appointment
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Book Appointment Tab */}
        {activeTab === "book" && (
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Choose a Doctor</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {doctors.map((d) => (
                <div
                  key={d.id}
                  onClick={() => fetchSlots(d.id)}
                  className={`bg-white rounded-2xl p-5 cursor-pointer border-2 transition-all duration-200 shadow-sm hover:shadow-md ${
                    selectedDoctor === d.id
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-100"
                  }`}
                >
                  <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-2xl mb-3">
                    👨‍⚕️
                  </div>
                  <h4 className="font-semibold text-gray-800 mb-1">{d.fullName}</h4>
                  <p className="text-sm text-gray-500 mb-3">{d.specialty}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-blue-600 font-bold text-sm">Rs. {d.consultationFee}</span>
                    {selectedDoctor === d.id && (
                      <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded-full">Selected ✓</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {selectedDoctor && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Available Slots</h3>
                <textarea
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 bg-white"
                  placeholder="Add notes for the doctor (optional)"
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
                {slots.length === 0 ? (
                  <div className="bg-white rounded-2xl p-8 text-center border border-gray-100">
                    <div className="text-4xl mb-3">😔</div>
                    <p className="text-gray-500">No available slots for this doctor.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {slots.map((s) => (
                      <div key={s.id} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-800">📅 {s.slotDate}</p>
                          <p className="text-sm text-gray-500">🕐 {s.startTime} - {s.endTime}</p>
                        </div>
                        <button
                          onClick={() => bookAppointment(s.id)}
                          disabled={loading}
                          className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium cursor-pointer disabled:opacity-50"
                        >
                          {loading ? "..." : "Book"}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientDashboard;