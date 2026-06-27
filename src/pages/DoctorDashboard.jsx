import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

const DoctorDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const res = await API.get("/appointments/doctor");
      setAppointments(res.data);
    } catch {
      setMessage("Failed to load appointments.");
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await API.put(`/appointments/${id}/status`, JSON.stringify(status), {
        headers: { "Content-Type": "application/json" },
      });
      setMessage(`Appointment ${status}.`);
      fetchAppointments();
    } catch {
      setMessage("Update failed.");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.headerTitle}>Doctor Dashboard — {user?.fullName} 👨‍⚕️</h2>
        <button style={styles.logoutBtn} onClick={handleLogout}>Logout</button>
      </div>

      {message && <p style={styles.message}>{message}</p>}

      <h3 style={styles.sectionTitle}>My Appointments</h3>
      {appointments.length === 0 ? (
        <p style={styles.empty}>No appointments yet.</p>
      ) : (
        appointments.map((a) => (
          <div key={a.id} style={styles.card}>
            <p><strong>Patient:</strong> {a.patientName}</p>
            <p><strong>Date:</strong> {a.slotDate}</p>
            <p><strong>Time:</strong> {a.startTime} - {a.endTime}</p>
            <p><strong>Status:</strong> <span style={{
              color: a.status === "Confirmed" ? "green" :
                a.status === "Cancelled" ? "red" : "orange"
            }}>{a.status}</span></p>
            {a.notes && <p><strong>Notes:</strong> {a.notes}</p>}
            <div style={styles.btnGroup}>
              {a.status === "Pending" && (
                <button style={styles.confirmBtn} onClick={() => updateStatus(a.id, "Confirmed")}>Confirm</button>
              )}
              {a.status === "Confirmed" && (
                <button style={styles.completeBtn} onClick={() => updateStatus(a.id, "Completed")}>Complete</button>
              )}
              {a.status !== "Cancelled" && a.status !== "Completed" && (
                <button style={styles.cancelBtn} onClick={() => updateStatus(a.id, "Cancelled")}>Cancel</button>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

const styles = {
  container: { maxWidth: "900px", margin: "0 auto", padding: "20px" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", backgroundColor: "#059669", padding: "16px 24px", borderRadius: "12px", color: "white" },
  headerTitle: { margin: 0 },
  logoutBtn: { backgroundColor: "white", color: "#059669", border: "none", padding: "8px 16px", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" },
  sectionTitle: { color: "#1f2937", marginBottom: "16px" },
  card: { backgroundColor: "white", padding: "20px", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)", marginBottom: "16px" },
  btnGroup: { display: "flex", gap: "8px", marginTop: "12px" },
  confirmBtn: { backgroundColor: "#2563eb", color: "white", border: "none", padding: "8px 16px", borderRadius: "8px", cursor: "pointer" },
  completeBtn: { backgroundColor: "#059669", color: "white", border: "none", padding: "8px 16px", borderRadius: "8px", cursor: "pointer" },
  cancelBtn: { backgroundColor: "#ef4444", color: "white", border: "none", padding: "8px 16px", borderRadius: "8px", cursor: "pointer" },
  message: { backgroundColor: "#d1fae5", color: "#065f46", padding: "12px", borderRadius: "8px", marginBottom: "16px" },
  empty: { color: "#6b7280", textAlign: "center", padding: "40px" },
};

export default DoctorDashboard;