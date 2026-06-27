import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [slots, setSlots] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [message, setMessage] = useState("");
  const [slotForm, setSlotForm] = useState({
    doctorId: "",
    slotDate: "",
    startTime: "",
    endTime: "",
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
      setMessage("Slot created successfully.");
      fetchSlots(slotForm.doctorId);
    } catch {
      setMessage("Failed to create slot.");
    }
  };

  const deleteSlot = async (id) => {
    try {
      await API.delete(`/timeslots/${id}`);
      setMessage("Slot deleted.");
      fetchSlots(selectedDoctor);
    } catch {
      setMessage("Delete failed.");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.headerTitle}>Admin Dashboard 🛡️</h2>
        <button style={styles.logoutBtn} onClick={handleLogout}>Logout</button>
      </div>

      {message && <p style={styles.message}>{message}</p>}

      <h3 style={styles.sectionTitle}>Create Time Slot</h3>
      <div style={styles.form}>
        <select
          style={styles.input}
          value={slotForm.doctorId}
          onChange={(e) => setSlotForm({ ...slotForm, doctorId: e.target.value })}
        >
          <option value="">Select Doctor</option>
          {doctors.map((d) => (
            <option key={d.id} value={d.id}>{d.fullName} — {d.specialty}</option>
          ))}
        </select>
        <input
          style={styles.input}
          type="date"
          value={slotForm.slotDate}
          onChange={(e) => setSlotForm({ ...slotForm, slotDate: e.target.value })}
        />
        <input
          style={styles.input}
          type="time"
          value={slotForm.startTime}
          onChange={(e) => setSlotForm({ ...slotForm, startTime: e.target.value })}
        />
        <input
          style={styles.input}
          type="time"
          value={slotForm.endTime}
          onChange={(e) => setSlotForm({ ...slotForm, endTime: e.target.value })}
        />
        <button style={styles.createBtn} onClick={createSlot}>Create Slot</button>
      </div>

      <h3 style={styles.sectionTitle}>Doctors</h3>
      <div style={styles.doctorGrid}>
        {doctors.map((d) => (
          <div
            key={d.id}
            style={{
              ...styles.doctorCard,
              border: selectedDoctor == d.id ? "2px solid #7c3aed" : "1px solid #e5e7eb"
            }}
            onClick={() => fetchSlots(d.id)}
          >
            <h4 style={styles.doctorName}>{d.fullName}</h4>
            <p style={styles.specialty}>{d.specialty}</p>
            <p style={styles.fee}>Rs. {d.consultationFee}</p>
          </div>
        ))}
      </div>

      {selectedDoctor && (
        <div>
          <h3 style={styles.sectionTitle}>Available Slots</h3>
          {slots.length === 0 ? (
            <p style={styles.empty}>No slots available.</p>
          ) : (
            slots.map((s) => (
              <div key={s.id} style={styles.slotCard}>
                <p>{s.slotDate} | {s.startTime} - {s.endTime}</p>
                <button style={styles.deleteBtn} onClick={() => deleteSlot(s.id)}>Delete</button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

const styles = {
  container: { maxWidth: "900px", margin: "0 auto", padding: "20px" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", backgroundColor: "#7c3aed", padding: "16px 24px", borderRadius: "12px", color: "white" },
  headerTitle: { margin: 0 },
  logoutBtn: { backgroundColor: "white", color: "#7c3aed", border: "none", padding: "8px 16px", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" },
  sectionTitle: { color: "#1f2937", marginBottom: "16px", marginTop: "24px" },
  form: { backgroundColor: "white", padding: "24px", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)", marginBottom: "24px" },
  input: { width: "100%", padding: "10px", marginBottom: "12px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "14px", boxSizing: "border-box" },
  createBtn: { width: "100%", padding: "12px", backgroundColor: "#7c3aed", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "16px" },
  doctorGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "16px", marginBottom: "24px" },
  doctorCard: { backgroundColor: "white", padding: "20px", borderRadius: "12px", cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" },
  doctorName: { margin: "0 0 8px 0", color: "#1f2937" },
  specialty: { color: "#6b7280", margin: "0 0 8px 0" },
  fee: { color: "#7c3aed", fontWeight: "bold", margin: 0 },
  slotCard: { display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "white", padding: "16px", borderRadius: "8px", marginBottom: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" },
  deleteBtn: { backgroundColor: "#ef4444", color: "white", border: "none", padding: "8px 16px", borderRadius: "8px", cursor: "pointer" },
  message: { backgroundColor: "#ede9fe", color: "#5b21b6", padding: "12px", borderRadius: "8px", marginBottom: "16px" },
  empty: { color: "#6b7280", textAlign: "center", padding: "40px" },
};

export default AdminDashboard;