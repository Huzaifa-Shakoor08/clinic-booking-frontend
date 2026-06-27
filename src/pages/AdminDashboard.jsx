import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import axios from 'axios';
const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [slots, setSlots] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [activeTab, setActiveTab] = useState("slots");
  const [slotForm, setSlotForm] = useState({
    doctorId: "",
    slotDate: "",
    startTime: "",
    endTime: "",
  });
  const [doctorForm, setDoctorForm] = useState({
    fullName: "",
    email: "",
    password: "",
    specialty: "",
    bio: "",
    consultationFee: "",
  });

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    const res = await API.get("/doctors");
    setDoctors(res.data);
  };

  const fetchSlots = async (doctorId) => {
    const res = await API.get(`/timeslots/doctor/${doctorId}`);
    setSlots(res.data);
    setSelectedDoctor(doctorId);
  };

  const createSlot = async () => {
    try {
      await API.post("/timeslots", {
        ...slotForm,
        doctorId: parseInt(slotForm.doctorId),
      });
      setMessage({ text: "Time slot created successfully.", type: "success" });
      fetchSlots(slotForm.doctorId);
    } catch {
      setMessage({ text: "Failed to create slot.", type: "error" });
    }
  };

  const deleteSlot = async (id) => {
    try {
      await API.delete(`/timeslots/${id}`);
      setMessage({ text: "Slot deleted.", type: "success" });
      fetchSlots(selectedDoctor);
    } catch {
      setMessage({ text: "Delete failed.", type: "error" });
    }
  };
const addDoctor = async () => {
    try {
      // Use plain axios to avoid sending token on register
      const registerRes = await axios.post(
        "https://clinicbookingsystem-production.up.railway.app/api/auth/register",
        {
          fullName: doctorForm.fullName,
          email: doctorForm.email,
          password: doctorForm.password,
          role: "Doctor",
        }
      );

      // Decode JWT to get userId
      const token = registerRes.data.token;
      const payload = JSON.parse(atob(token.split('.')[1]));
      const userId = parseInt(payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"]);

      await API.post("/doctors", {
        userId: userId,
        specialty: doctorForm.specialty,
        bio: doctorForm.bio,
        consultationFee: parseFloat(doctorForm.consultationFee),
      });

      setMessage({ text: "Doctor added successfully.", type: "success" });
      fetchDoctors();
      setDoctorForm({
        fullName: "",
        email: "",
        password: "",
        specialty: "",
        bio: "",
        consultationFee: "",
      });
    } catch (err) {
      console.error(err);
      setMessage({ text: "Failed to add doctor.", type: "error" });
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-purple-600 rounded-xl flex items-center justify-center">
              <span className="text-lg">🏥</span>
            </div>
            <span className="font-bold text-gray-800 text-lg">ClinicBook</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-sm">🛡️</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">{user?.fullName}</p>
                <p className="text-xs text-gray-500">Admin</p>
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
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-2xl p-6 mb-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-1">
                Admin Panel 🛡️
              </h1>
              <p className="text-purple-200">
                Manage doctors, time slots and the entire clinic system.
              </p>
            </div>
            <div className="hidden sm:block text-6xl opacity-20">⚙️</div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
          {[
            { label: "Total Doctors", value: doctors.length, emoji: "👨‍⚕️" },
            { label: "Available Slots", value: slots.length, emoji: "📅" },
            { label: "Specialties", value: [...new Set(doctors.map(d => d.specialty))].length, emoji: "🏥" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">{stat.emoji}</span>
                <span className="text-2xl font-bold text-gray-800">{stat.value}</span>
              </div>
              <p className="text-sm text-gray-500">{stat.label}</p>
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
            { key: "slots", label: "Manage Slots", emoji: "📅" },
            { key: "doctors", label: "Add Doctor", emoji: "➕" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
                activeTab === tab.key
                  ? "bg-purple-600 text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <span>{tab.emoji}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Manage Slots Tab */}
        {activeTab === "slots" && (
          <div>
            {/* Create Slot Form */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Create Time Slot</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Doctor</label>
                  <select
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white text-gray-700"
                    value={slotForm.doctorId}
                    onChange={(e) => {
                      setSlotForm({ ...slotForm, doctorId: e.target.value });
                      fetchSlots(e.target.value);
                    }}
                  >
                    <option value="">Choose a doctor...</option>
                    {doctors.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.fullName} — {d.specialty}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                  <input
                    type="date"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white text-gray-700"
                    value={slotForm.slotDate}
                    onChange={(e) => setSlotForm({ ...slotForm, slotDate: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
                  <input
                    type="time"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white text-gray-700"
                    value={slotForm.startTime}
                    onChange={(e) => setSlotForm({ ...slotForm, startTime: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
                  <input
                    type="time"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white text-gray-700"
                    value={slotForm.endTime}
                    onChange={(e) => setSlotForm({ ...slotForm, endTime: e.target.value })}
                  />
                </div>
                <div className="sm:col-span-2">
                  <button
                    onClick={createSlot}
                    className="w-full bg-purple-600 text-white py-3 rounded-xl font-semibold cursor-pointer"
                  >
                    ➕ Create Time Slot
                  </button>
                </div>
              </div>
            </div>

            {/* Doctors List */}
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Doctors</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {doctors.map((d) => (
                <div
                  key={d.id}
                  onClick={() => fetchSlots(d.id)}
                  className={`bg-white rounded-2xl p-5 cursor-pointer border-2 transition-all shadow-sm hover:shadow-md ${
                    selectedDoctor == d.id
                      ? "border-purple-600 bg-purple-50"
                      : "border-gray-100"
                  }`}
                >
                  <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center text-2xl mb-3">
                    👨‍⚕️
                  </div>
                  <h4 className="font-semibold text-gray-800 mb-1">{d.fullName}</h4>
                  <p className="text-sm text-gray-500 mb-2">{d.specialty}</p>
                  <p className="text-purple-600 font-bold text-sm">Rs. {d.consultationFee}</p>
                </div>
              ))}
            </div>

            {/* Slots List */}
            {selectedDoctor && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Available Slots
                </h3>
                {slots.length === 0 ? (
                  <div className="bg-white rounded-2xl p-8 text-center border border-gray-100">
                    <div className="text-4xl mb-3">📅</div>
                    <p className="text-gray-500">No slots available for this doctor.</p>
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
                          onClick={() => deleteSlot(s.id)}
                          className="bg-red-50 text-red-600 px-3 py-2 rounded-xl text-sm font-medium cursor-pointer"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Add Doctor Tab */}
        {activeTab === "doctors" && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Add New Doctor</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  placeholder="Dr. Ahmed Khan"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white text-gray-700"
                  value={doctorForm.fullName}
                  onChange={(e) => setDoctorForm({ ...doctorForm, fullName: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  placeholder="doctor@clinic.com"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white text-gray-700"
                  value={doctorForm.email}
                  onChange={(e) => setDoctorForm({ ...doctorForm, email: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white text-gray-700"
                  value={doctorForm.password}
                  onChange={(e) => setDoctorForm({ ...doctorForm, password: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Specialty</label>
                <input
                  type="text"
                  placeholder="Cardiologist"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white text-gray-700"
                  value={doctorForm.specialty}
                  onChange={(e) => setDoctorForm({ ...doctorForm, specialty: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Consultation Fee (Rs.)</label>
                <input
                  type="number"
                  placeholder="2000"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white text-gray-700"
                  value={doctorForm.consultationFee}
                  onChange={(e) => setDoctorForm({ ...doctorForm, consultationFee: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                <input
                  type="text"
                  placeholder="Experienced doctor with 10 years..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white text-gray-700"
                  value={doctorForm.bio}
                  onChange={(e) => setDoctorForm({ ...doctorForm, bio: e.target.value })}
                />
              </div>
              <div className="sm:col-span-2">
                <button
                  onClick={addDoctor}
                  className="w-full bg-purple-600 text-white py-3 rounded-xl font-semibold cursor-pointer"
                >
                  ➕ Add Doctor
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;