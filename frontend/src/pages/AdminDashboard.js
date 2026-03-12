import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAdminStats,
  getAdminComplaints,
  updateComplaintStatus,
  deleteComplaint,
} from "../api";
import { useAuth } from "../context/AuthContext";

const STATUS_OPTIONS = ["Pending", "In Progress", "Resolved", "Rejected"];
const STATUS_COLORS = {
  Pending: { bg: "#fef3c7", text: "#92400e" },
  "In Progress": { bg: "#dbeafe", text: "#1e40af" },
  Resolved: { bg: "#dcfce7", text: "#166534" },
  Rejected: { bg: "#fee2e2", text: "#991b1b" },
};

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: "All", search: "" });
  const [updating, setUpdating] = useState(null);
  const [statusSelections, setStatusSelections] = useState({});
  const [noteInputs, setNoteInputs] = useState({});

  useEffect(() => {
    loadData();
  }, [filters]); // eslint-disable-line

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsRes, complaintsRes] = await Promise.all([
        getAdminStats(),
        getAdminComplaints({
          status: filters.status,
          search: filters.search,
          limit: 50,
        }),
      ]);
      setStats(statsRes.data.stats);
      setComplaints(complaintsRes.data.complaints);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id) => {
    const newStatus = statusSelections[id];
    const adminNote = noteInputs[id] || "";
    if (!newStatus) return alert("Please select a status.");
    setUpdating(id);
    try {
      const { data } = await updateComplaintStatus(id, {
        status: newStatus,
        adminNote,
      });
      setComplaints((prev) =>
        prev.map((c) => (c._id === id ? data.complaint : c)),
      );
      alert(`Status updated to "${newStatus}"`);
    } catch (err) {
      alert(err.response?.data?.message || "Update failed.");
    } finally {
      setUpdating(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this complaint? This cannot be undone."))
      return;
    try {
      await deleteComplaint(id);
      setComplaints((prev) => prev.filter((c) => c._id !== id));
    } catch (err) {
      alert("Failed to delete.");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div style={styles.page}>
      {/* Sidebar */}
      <aside style={styles.sidebar}>
        <div style={styles.sidebarBrand}>
          <span style={{ fontSize: "1.5rem" }}>🏛️</span>
          <div>
            <div style={styles.sidebarTitle}>Admin Panel</div>
            <div style={styles.sidebarSub}>MCC Dashboard</div>
          </div>
        </div>
        <div style={styles.sidebarUser}>
          <div style={styles.avatar}>{user?.name?.[0]?.toUpperCase()}</div>
          <div>
            <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>
              {user?.name}
            </div>
            <div style={{ fontSize: "0.75rem", color: "#93c5fd" }}>
              {user?.email}
            </div>
          </div>
        </div>
        <button onClick={handleLogout} style={styles.logoutBtn}>
          ⬅ Logout
        </button>
      </aside>

      {/* Main */}
      <main style={styles.main}>
        <h1 style={styles.pageTitle}>Dashboard Overview</h1>

        {/* Stats */}
        {stats && (
          <div style={styles.statsGrid}>
            {[
              {
                label: "Total Complaints",
                value: stats.total,
                color: "#3b82f6",
              },
              { label: "Pending", value: stats.pending, color: "#f59e0b" },
              {
                label: "In Progress",
                value: stats.inProgress,
                color: "#6366f1",
              },
              { label: "Resolved", value: stats.resolved, color: "#10b981" },
              {
                label: "Registered Users",
                value: stats.totalUsers,
                color: "#8b5cf6",
              },
              {
                label: "New (7 days)",
                value: stats.recentComplaints,
                color: "#ec4899",
              },
            ].map((s) => (
              <div
                key={s.label}
                style={{
                  ...styles.statCard,
                  borderTop: `4px solid ${s.color}`,
                }}
              >
                <div style={{ ...styles.statValue, color: s.color }}>
                  {s.value}
                </div>
                <div style={styles.statLabel}>{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Complaints Management */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>Manage Complaints</h2>
            <div style={styles.filterRow}>
              <input
                placeholder="Search..."
                value={filters.search}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, search: e.target.value }))
                }
                style={styles.searchInput}
              />
              <select
                value={filters.status}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, status: e.target.value }))
                }
                style={styles.select}
              >
                <option value="All">All Statuses</option>
                {STATUS_OPTIONS.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <p style={{ color: "#6b7280", padding: "2rem" }}>Loading...</p>
          ) : complaints.length === 0 ? (
            <p style={{ color: "#6b7280", padding: "2rem" }}>
              No complaints found.
            </p>
          ) : (
            <div style={styles.tableWrap}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.tableHead}>
                    <th style={styles.th}>Title</th>
                    <th style={styles.th}>Category</th>
                    <th style={styles.th}>Location</th>
                    <th style={styles.th}>Filed By</th>
                    <th style={styles.th}>Priority</th>
                    <th style={styles.th}>Votes</th>
                    <th style={styles.th}>Status</th>
                    <th style={styles.th}>Date</th>
                    <th style={styles.th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {complaints.map((c) => {
                    const sc =
                      STATUS_COLORS[c.status] || STATUS_COLORS["Pending"];
                    return (
                      <tr key={c._id} style={styles.tableRow}>
                        <td
                          style={{
                            ...styles.td,
                            fontWeight: 600,
                            color: "#1e3a8a",
                            maxWidth: "180px",
                          }}
                        >
                          {c.title}
                        </td>
                        <td style={styles.td}>
                          <span style={styles.catBadge}>{c.category}</span>
                        </td>
                        <td style={styles.td}>{c.location}</td>
                        <td style={styles.td}>{c.userName}</td>
                        <td style={styles.td}>
                          <span
                            style={{
                              background:
                                c.priority_label === "Critical"
                                  ? "#fee2e2"
                                  : c.priority_label === "High"
                                    ? "#fef3c7"
                                    : c.priority_label === "Medium"
                                      ? "#dbeafe"
                                      : "#dcfce7",
                              color:
                                c.priority_label === "Critical"
                                  ? "#991b1b"
                                  : c.priority_label === "High"
                                    ? "#92400e"
                                    : c.priority_label === "Medium"
                                      ? "#1e40af"
                                      : "#166534",
                              fontSize: "0.75rem",
                              padding: "2px 8px",
                              borderRadius: "20px",
                              fontWeight: 600,
                              whiteSpace: "nowrap",
                            }}
                          >
                            {c.priority_label || "Medium"} (
                            {c.priority_score || 5.0})
                          </span>
                        </td>
                        <td style={{ ...styles.td, textAlign: "center" }}>
                          👍 {c.supportCount}
                        </td>
                        <td style={styles.td}>
                          <span
                            style={{
                              ...styles.statusBadge,
                              background: sc.bg,
                              color: sc.text,
                            }}
                          >
                            {c.status}
                          </span>
                        </td>
                        <td style={styles.td}>
                          {new Date(c.createdAt).toLocaleDateString()}
                        </td>
                        <td style={styles.td}>
                          <div style={styles.actionGroup}>
                            <select
                              defaultValue={c.status}
                              onChange={(e) =>
                                setStatusSelections((prev) => ({
                                  ...prev,
                                  [c._id]: e.target.value,
                                }))
                              }
                              style={styles.actionSelect}
                            >
                              {STATUS_OPTIONS.map((s) => (
                                <option key={s}>{s}</option>
                              ))}
                            </select>
                            <input
                              placeholder="Note (optional)"
                              value={noteInputs[c._id] || ""}
                              onChange={(e) =>
                                setNoteInputs((prev) => ({
                                  ...prev,
                                  [c._id]: e.target.value,
                                }))
                              }
                              style={styles.noteInput}
                            />
                            <button
                              onClick={() => handleStatusUpdate(c._id)}
                              disabled={updating === c._id}
                              style={styles.updateBtn}
                            >
                              {updating === c._id ? "..." : "Update"}
                            </button>
                            <button
                              onClick={() => handleDelete(c._id)}
                              style={styles.deleteBtn}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

const styles = {
  page: { display: "flex", minHeight: "100vh", background: "#f1f5f9" },
  sidebar: {
    width: "240px",
    background: "#1e3a8a",
    color: "#fff",
    padding: "1.5rem",
    display: "flex",
    flexDirection: "column",
    gap: "1.5rem",
    position: "sticky",
    top: 0,
    height: "100vh",
  },
  sidebarBrand: { display: "flex", alignItems: "center", gap: "0.75rem" },
  sidebarTitle: { fontWeight: 700, fontSize: "1rem" },
  sidebarSub: { fontSize: "0.75rem", color: "#93c5fd" },
  sidebarUser: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    padding: "0.75rem",
    background: "rgba(255,255,255,0.1)",
    borderRadius: "10px",
  },
  avatar: {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    background: "#3b82f6",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    fontSize: "1rem",
  },
  logoutBtn: {
    background: "rgba(255,255,255,0.1)",
    border: "none",
    color: "#fff",
    padding: "0.6rem 1rem",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: 600,
    marginTop: "auto",
  },
  main: { flex: 1, padding: "2rem", overflow: "auto" },
  pageTitle: {
    fontFamily: "'Playfair Display', serif",
    fontSize: "1.8rem",
    fontWeight: 800,
    color: "#0f172a",
    marginBottom: "1.5rem",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
    gap: "1rem",
    marginBottom: "2rem",
  },
  statCard: {
    background: "#fff",
    borderRadius: "12px",
    padding: "1.25rem",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
  },
  statValue: { fontSize: "2rem", fontWeight: 800 },
  statLabel: { color: "#6b7280", fontSize: "0.85rem", marginTop: "4px" },
  section: {
    background: "#fff",
    borderRadius: "12px",
    padding: "1.5rem",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
  },
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "1rem",
    marginBottom: "1.5rem",
  },
  sectionTitle: { fontSize: "1.2rem", fontWeight: 700, color: "#0f172a" },
  filterRow: { display: "flex", gap: "0.75rem", flexWrap: "wrap" },
  searchInput: {
    padding: "0.5rem 0.8rem",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    fontSize: "0.9rem",
    outline: "none",
    fontFamily: "inherit",
  },
  select: {
    padding: "0.5rem 0.8rem",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    fontSize: "0.9rem",
    background: "#fff",
    fontFamily: "inherit",
  },
  tableWrap: { overflowX: "auto" },
  table: { width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" },
  tableHead: { background: "#f8fafc" },
  th: {
    padding: "0.75rem 1rem",
    textAlign: "left",
    fontWeight: 600,
    color: "#374151",
    borderBottom: "1px solid #e5e7eb",
    whiteSpace: "nowrap",
  },
  tableRow: {
    borderBottom: "1px solid #f1f5f9",
    transition: "background 0.15s",
  },
  td: { padding: "0.75rem 1rem", color: "#374151", verticalAlign: "middle" },
  catBadge: {
    background: "#dbeafe",
    color: "#1d4ed8",
    fontSize: "0.75rem",
    padding: "2px 8px",
    borderRadius: "20px",
    whiteSpace: "nowrap",
  },
  statusBadge: {
    fontSize: "0.75rem",
    padding: "2px 8px",
    borderRadius: "20px",
    fontWeight: 600,
    whiteSpace: "nowrap",
  },
  actionGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "0.4rem",
    minWidth: "180px",
  },
  actionSelect: {
    padding: "0.35rem 0.5rem",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    fontSize: "0.85rem",
    background: "#fff",
  },
  noteInput: {
    padding: "0.35rem 0.5rem",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    fontSize: "0.8rem",
    fontFamily: "inherit",
  },
  updateBtn: {
    background: "#2563eb",
    color: "#fff",
    border: "none",
    padding: "0.35rem 0.75rem",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: "0.8rem",
  },
  deleteBtn: {
    background: "#fee2e2",
    color: "#dc2626",
    border: "none",
    padding: "0.35rem 0.75rem",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: "0.8rem",
  },
};
