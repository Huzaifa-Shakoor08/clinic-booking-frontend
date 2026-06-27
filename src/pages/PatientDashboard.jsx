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
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState("appointments");

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
    try {
      await API.post("/appointments", {
        doctorId: selectedDoctor,
        slotId,
        notes,
      });
      setMessage("Appointment booked successfully!");
      fetchAppointments();
      fetchSlots(selectedDoctor);
    } catch {
      setMessage("Booking failed. Try again.");
    }
  };

  const cancelAppointment = async (id) => {
    try {
      await API.delete(`/appointments/${id}`);
      setMessage("Appointment cancelled.");
      fetchAppointments();
    } catch {
      setMessage("Cancel failed.");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.headerTitle}>Welcome, {user?.fullName} 👋</h2>
        <button style={styles.logoutBtn} onClick={handleLogout}>Logout</button>
      </div>

      <div style={styles.tabs}>
        <button
          style={activeTab === "appointments" ? styles.activeTab : styles.tab}
          onClick={() => setActiveTab("appointments")}
        >My Appointments</button>
        <button
          style={activeTab === "book" ? styles.activeTab : styles.tab}
          onClick={() => setActiveTab("book")}
        >Book Appointment</button>
      </div>

      {message && <p style={styles.message}>{message}</p>}

      {activeTab === "appointments" && (
        <div>
          <h3 style={styles.sectionTitle}>My Appointments</h3>
          {appointments.length === 0 ? (
            <p style={styles.empty}>No appointments yet.</p>
          ) : (
            appointments.map((a) => (
              <div key={a.id} style={styles.card}>
                <p><strong>Doctor:</strong> {a.doctorName}</p>
                <p><strong>Specialty:</strong> {a.specialty}</p>
                <p><strong>Date:</strong> {a.slotDate}</p>
                <p><strong>Time:</strong> {a.startTime} - {a.endTime}</p>
                <p><strong>Status:</strong> <span style={{
                  color: a.status === "Confirmed" ? "green" :
                    a.status === "Cancelled" ? "red" : "orange"
                }}>{a.status}</span></p>
                {a.notes && <p><strong>Notes:</strong> {a.notes}</p>}
                {a.status === "Pending" && (
                  <button
                    style={styles.cancelBtn}
                    onClick={() => cancelAppointment(a.id)}
                  >Cancel</button>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === "book" && (
        <div>
          <h3 style={styles.sectionTitle}>Available Doctors</h3>
          <div style={styles.doctorGrid}>
            {doctors.map((d) => (
              <div
                key={d.id}
                style={{
                  ...styles.doctorCard,
                  border: selectedDoctor === d.id ? "2px solid #2563eb" : "1px solid #e5e7eb"
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
              <textarea
                style={styles.textarea}
                placeholder="Notes (optional)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
              {slots.length === 0 ? (
                <p style={styles.empty}>No slots available.</p>
              ) : (
                slots.map((s) => (
                  <div key={s.id} style={styles.slotCard}>
                    <p>{s.slotDate} | {s.startTime} - {s.endTime}</p>
                    <button
                      style={styles.bookBtn}
                      onClick={() => bookAppointment(s.id)}
                    >Book</button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const styles = {
  container: { maxWidth: "900px", margin: "0 auto", padding: "20px" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", backgroundColor: "#2563eb", padding: "16px 24px", borderRadius: "12px", color: "white" },
  headerTitle: { margin: 0 },
  logoutBtn: { backgroundColor: "white", color: "#2563eb", border: "none", padding: "8px 16px", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" },
  tabs: { display: "flex", gap: "12px", marginBottom: "24px" },
  tab: { padding: "10px 20px", border: "1px solid #d1d5db", borderRadius: "8px", cursor: "pointer", backgroundColor: "white" },
  activeTab: { padding: "10px 20px", border: "none", borderRadius: "8px", cursor: "pointer", backgroundColor: "#2563eb", color: "white" },
  sectionTitle: { color: "#1f2937", marginBottom: "16px" },
  card: { backgroundColor: "white", padding: "20px", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)", marginBottom: "16px" },
  cancelBtn: { marginTop: "12px", backgroundColor: "#ef4444", color: "white", border: "none", padding: "8px 16px", borderRadius: "8px", cursor: "pointer" },
  doctorGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "16px", marginBottom: "24px" },
  doctorCard: { backgroundColor: "white", padding: "20px", borderRadius: "12px", cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" },
  doctorName: { margin: "0 0 8px 0", color: "#1f2937" },
  specialty: { color: "#6b7280", margin: "0 0 8px 0" },
  fee: { color: "#2563eb", fontWeight: "bold", margin: 0 },
  slotCard: { display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "white", padding: "16px", borderRadius: "8px", marginBottom: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" },
  bookBtn: { backgroundColor: "#2563eb", color: "white", border: "none", padding: "8px 16px", borderRadius: "8px", cursor: "pointer" },
  textarea: { width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #d1d5db", marginBottom: "16px", fontSize: "14px", boxSizing: "border-box" },
  message: { backgroundColor: "#d1fae5", color: "#065f46", padding: "12px", borderRadius: "8px", marginBottom: "16px" },
  empty: { color: "#6b7280", textAlign: "center", padding: "40px" },
};

export default PatientDashboard;