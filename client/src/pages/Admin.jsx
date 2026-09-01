import { useEffect, useState } from "react";
import {
  getDashboardStats, getUsers, addUser,
  getStoreOwners, addStore, getAdminStores,
  deleteUser, deleteStore,
} from "../api/admin";
import { useAuth } from "../context/AuthContext";

/* ── tiny confirm dialog ─────────────────────────────── */
function ConfirmModal({ message, onConfirm, onCancel, loading }) {
  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onCancel()}>
      <div className="modal-box" style={{ maxWidth: 380, textAlign: "center" }}>
        <div style={{ fontSize: "2.5rem", marginBottom: "12px" }}>⚠️</div>
        <h2 style={{ marginBottom: "8px", fontSize: "1.1rem" }}>Are you sure?</h2>
        <p className="modal-subtitle" style={{ marginBottom: "24px" }}>{message}</p>
        <div className="modal-actions">
          <button id="confirm-delete-btn" className="btn-danger" onClick={onConfirm} disabled={loading}>
            {loading ? "Deleting…" : "Yes, Delete"}
          </button>
          <button id="cancel-delete-btn" className="btn-secondary" onClick={onCancel} disabled={loading}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── user details modal ─────────────────────────────── */
function UserDetailsModal({ user, onClose }) {
  if (!user) return null;
  const renderStars = (rating) => {
    const val = Math.round(Number(rating) || 0);
    return (
      <span>
        {[1,2,3,4,5].map((s) => (
          <span key={s} style={{ color: s <= val ? "#f59e0b" : "var(--surface-2)", fontSize: 16 }}>★</span>
        ))}
      </span>
    );
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{ maxWidth: 440 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h2>👤 User Details</h2>
          <button onClick={onClose} className="btn-secondary btn-sm" style={{ padding: "4px 10px" }}>✕</button>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24, paddingBottom: 16, borderBottom: "1px solid var(--border)" }}>
          <div style={{
            width: 54, height: 54, borderRadius: "50%",
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 22, fontWeight: 800, color: "white", flexShrink: 0,
          }}>
            {user.name ? user.name[0].toUpperCase() : "?"}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: "1.1rem" }}>{user.name}</div>
            <div style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 2 }}>{user.email}</div>
            <span className={`badge badge-${user.role}`} style={{ marginTop: 6 }}>{user.role.replace("_", " ")}</span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <div className="section-label">Address</div>
            <div className="section-value" style={{ color: "var(--text-muted)", fontSize: 14 }}>{user.address || "—"}</div>
          </div>
          <div>
            <div className="section-label">Joined Date</div>
            <div className="section-value" style={{ color: "var(--text-muted)", fontSize: 14 }}>{new Date(user.created_at).toLocaleDateString()}</div>
          </div>

          {user.role === "store_owner" && (
            <div style={{
              background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)",
              borderRadius: 12, padding: 16, marginTop: 4,
            }}>
              <div className="section-label" style={{ color: "#34d399", marginBottom: 6 }}>Store Owner Rating</div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                {renderStars(user.store_rating)}
                <span style={{ fontWeight: 800, color: "#f59e0b", fontSize: 16 }}>
                  {Number(user.store_rating || 0).toFixed(1)} / 5.0
                </span>
              </div>
              {user.store_name && (
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 6 }}>
                  Store: <strong style={{ color: "var(--text)" }}>{user.store_name}</strong>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="modal-actions" style={{ marginTop: 28 }}>
          <button onClick={onClose} className="btn-secondary" style={{ width: "100%" }}>Close</button>
        </div>
      </div>
    </div>
  );
}

/* ── main component ──────────────────────────────────── */
function Admin() {
  const { user, logoutUser } = useAuth();

  /* stats */
  const [stats, setStats]           = useState({ totalUsers: 0, totalStores: 0, totalRatings: 0 });
  const [loadingStats, setLoadingStats] = useState(true);

  /* users */
  const [users, setUsers]             = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [userError, setUserError]     = useState("");
  const [userFilters, setUserFilters] = useState({
    name: "", email: "", address: "", role: "", sortBy: "name", order: "asc",
  });

  /* user details modal */
  const [detailsUser, setDetailsUser] = useState(null);

  /* stores */
  const [stores, setStores]               = useState([]);
  const [loadingStores, setLoadingStores] = useState(true);
  const [storeError, setStoreError]       = useState("");
  const [storeSearch, setStoreSearch]     = useState({
    name: "", address: "", sortBy: "name", order: "asc",
  });

  /* modals */
  const [showAddUser, setShowAddUser]   = useState(false);
  const [newUser, setNewUser]           = useState({ name: "", email: "", password: "", address: "", role: "user" });
  const [addingUser, setAddingUser]     = useState(false);
  const [addUserError, setAddUserError] = useState("");

  const [showAddStore, setShowAddStore]   = useState(false);
  const [storeOwners, setStoreOwners]     = useState([]);
  const [newStore, setNewStore]           = useState({ name: "", email: "", address: "", owner_id: "" });
  const [addingStore, setAddingStore]     = useState(false);
  const [addStoreError, setAddStoreError] = useState("");

  /* delete confirm */
  const [confirm, setConfirm]   = useState(null);
  const [deleting, setDeleting] = useState(false);

  /* global success flash */
  const [flash, setFlash] = useState("");
  const showFlash = (msg) => { setFlash(msg); setTimeout(() => setFlash(""), 3000); };

  /* ── fetchers ─────────────────────────────────────── */
  const fetchStats = async () => {
    try {
      setLoadingStats(true);
      const r = await getDashboardStats();
      setStats(r.data);
    } catch { /* silent */ }
    finally { setLoadingStats(false); }
  };

  const fetchUsers = async (f = userFilters) => {
    try {
      setLoadingUsers(true);
      setUserError("");
      const r = await getUsers(f);
      setUsers(r.data);
    } catch (err) {
      setUserError(err.response?.data?.message || "Failed to load users");
    } finally { setLoadingUsers(false); }
  };

  const fetchStores = async (s = storeSearch) => {
    try {
      setLoadingStores(true);
      setStoreError("");
      const r = await getAdminStores(s);
      setStores(r.data);
    } catch (err) {
      setStoreError(err.response?.data?.message || "Failed to load stores");
    } finally { setLoadingStores(false); }
  };

  useEffect(() => {
    fetchStats();
    fetchUsers();
    fetchStores();
  }, []);

  /* ── user filter handlers ─────────────────────────── */
  const handleUserFilterChange = (e) => {
    const { name, value } = e.target;
    setUserFilters((p) => ({ ...p, [name]: value }));
  };
  const handleUserSearch = (e) => { e.preventDefault(); fetchUsers(); };
  const handleUserSort = (col) => {
    const next = {
      ...userFilters,
      sortBy: col,
      order: userFilters.sortBy === col && userFilters.order === "asc" ? "desc" : "asc",
    };
    setUserFilters(next);
    fetchUsers(next);
  };

  /* ── store filter handlers ────────────────────────── */
  const handleStoreSearch = (e) => { e.preventDefault(); fetchStores(); };
  const handleStoreSort = (col) => {
    const next = {
      ...storeSearch,
      sortBy: col,
      order: storeSearch.sortBy === col && storeSearch.order === "asc" ? "desc" : "asc",
    };
    setStoreSearch(next);
    fetchStores(next);
  };

  /* ── add user ─────────────────────────────────────── */
  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      setAddingUser(true);
      setAddUserError("");
      await addUser(newUser);
      setNewUser({ name: "", email: "", password: "", address: "", role: "user" });
      setShowAddUser(false);
      await Promise.all([fetchStats(), fetchUsers()]);
      showFlash("User created successfully!");
    } catch (err) {
      setAddUserError(err.response?.data?.message || "Failed to create user");
    } finally { setAddingUser(false); }
  };

  /* ── add store ────────────────────────────────────── */
  const handleOpenAddStore = async () => {
    try {
      setAddStoreError("");
      const res = await getStoreOwners();
      setStoreOwners(res.data);
      setShowAddStore(true);
    } catch (err) {
      setAddStoreError(err.response?.data?.message || "Failed to load store owners");
      setShowAddStore(true);
    }
  };

  const handleAddStore = async (e) => {
    e.preventDefault();
    try {
      setAddingStore(true);
      setAddStoreError("");
      await addStore(newStore);
      setNewStore({ name: "", email: "", address: "", owner_id: "" });
      setShowAddStore(false);
      await Promise.all([fetchStats(), fetchStores()]);
      showFlash("Store created successfully!");
    } catch (err) {
      setAddStoreError(err.response?.data?.message || "Failed to create store");
    } finally { setAddingStore(false); }
  };

  /* ── delete ───────────────────────────────────────── */
  const handleDeleteConfirm = async () => {
    if (!confirm) return;
    setDeleting(true);
    try {
      if (confirm.type === "user") {
        await deleteUser(confirm.id);
        showFlash(`User "${confirm.name}" deleted.`);
        await Promise.all([fetchStats(), fetchUsers()]);
      } else {
        await deleteStore(confirm.id);
        showFlash(`Store "${confirm.name}" deleted.`);
        await Promise.all([fetchStats(), fetchStores()]);
      }
      setConfirm(null);
    } catch (err) {
      const msg = err.response?.data?.message || "Delete failed";
      if (confirm.type === "user") setUserError(msg);
      else setStoreError(msg);
      setConfirm(null);
    } finally { setDeleting(false); }
  };

  /* ── helpers ──────────────────────────────────────── */
  const sortIcon = (col, filters) => {
    if (filters.sortBy !== col) return " ↕";
    return filters.order === "asc" ? " ↑" : " ↓";
  };

  const avatarChar = (name) => (name ? name[0].toUpperCase() : "?");

  const renderStars = (rating) => {
    const val = Math.round(Number(rating) || 0);
    return (
      <span>
        {[1,2,3,4,5].map((s) => (
          <span key={s} style={{ color: s <= val ? "#f59e0b" : "var(--surface-2)", fontSize: 15 }}>★</span>
        ))}
      </span>
    );
  };

  /* ── render ───────────────────────────────────────── */
  return (
    <div className="page-container">
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-brand">
          <span className="navbar-logo">🏬 Roxiler</span>
          <span className="navbar-subtitle">Admin Panel</span>
        </div>
        <div className="navbar-right">
          <div className="navbar-user">
            <div className="navbar-avatar">{avatarChar(user?.name || user?.email)}</div>
            <span className="navbar-username">{user?.name || user?.email || "Admin"}</span>
          </div>
          <button className="btn-danger btn-sm" id="admin-logout-btn" onClick={logoutUser}>Sign Out</button>
        </div>
      </nav>

      <main className="page-content">
        {/* Header */}
        <div className="page-header">
          <div>
            <h1>Admin Dashboard</h1>
            <p>Manage users, stores, and ratings across the platform.</p>
          </div>
          <div className="page-header-actions">
            <button id="open-add-user-btn" className="btn-outline" onClick={() => { setAddUserError(""); setShowAddUser(true); }}>
              + Add User
            </button>
            <button id="open-add-store-btn" onClick={handleOpenAddStore}>
              + Add Store
            </button>
          </div>
        </div>

        {/* Flash */}
        {flash && <div className="alert-success">✅ {flash}</div>}

        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-card-icon">👥</div>
            <p>Total Users</p>
            <h2>{loadingStats ? "—" : stats.totalUsers}</h2>
          </div>
          <div className="stat-card">
            <div className="stat-card-icon">🏪</div>
            <p>Total Stores</p>
            <h2>{loadingStats ? "—" : stats.totalStores}</h2>
          </div>
          <div className="stat-card">
            <div className="stat-card-icon">⭐</div>
            <p>Total Ratings</p>
            <h2>{loadingStats ? "—" : stats.totalRatings}</h2>
          </div>
        </div>

        {/* ══ USERS TABLE ══ */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Users</div>
              <div className="card-subtitle">All registered users on the platform</div>
            </div>
            <span style={{
              background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)",
              color: "var(--primary-light)", padding: "4px 12px", borderRadius: "20px",
              fontSize: "13px", fontWeight: 700,
            }}>{users.length} Users</span>
          </div>

          {/* User filters */}
          <form onSubmit={handleUserSearch} className="filter-grid">
            <input id="filter-name"    name="name"    placeholder="Search name…"    value={userFilters.name}    onChange={handleUserFilterChange} />
            <input id="filter-email"   name="email"   placeholder="Search email…"   value={userFilters.email}   onChange={handleUserFilterChange} />
            <input id="filter-address" name="address" placeholder="Search address…" value={userFilters.address} onChange={handleUserFilterChange} />
            <select id="filter-role" name="role" value={userFilters.role} onChange={handleUserFilterChange}>
              <option value="">All Roles</option>
              <option value="admin">Admin</option>
              <option value="store_owner">Store Owner</option>
              <option value="user">Normal User</option>
            </select>
            <select id="filter-order" name="order" value={userFilters.order} onChange={handleUserFilterChange}>
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
            <button id="user-search-btn" type="submit">Search</button>
          </form>

          {userError && <div className="alert-error">⚠️ {userError}</div>}

          {loadingUsers ? (
            <div style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
              <div className="spinner" style={{ margin: "0 auto 12px" }} />Loading users…
            </div>
          ) : users.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px", color: "var(--text-dim)" }}>
              <div style={{ fontSize: "28px", marginBottom: "8px" }}>🔍</div>No users found.
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th id="sort-name"    onClick={() => handleUserSort("name")}>Name{sortIcon("name", userFilters)}</th>
                    <th id="sort-email"   onClick={() => handleUserSort("email")}>Email{sortIcon("email", userFilters)}</th>
                    <th id="sort-address" onClick={() => handleUserSort("address")}>Address{sortIcon("address", userFilters)}</th>
                    <th id="sort-role"    onClick={() => handleUserSort("role")}>Role{sortIcon("role", userFilters)}</th>
                    <th id="sort-created" onClick={() => handleUserSort("created_at")}>Joined{sortIcon("created_at", userFilters)}</th>
                    <th style={{ textAlign: "center" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td style={{ fontWeight: 600 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div style={{
                            width: "30px", height: "30px", borderRadius: "50%",
                            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: "12px", fontWeight: 700, color: "white", flexShrink: 0,
                          }}>{avatarChar(u.name)}</div>
                          {u.name}
                        </div>
                      </td>
                      <td style={{ color: "var(--text-muted)" }}>{u.email}</td>
                      <td style={{ color: "var(--text-muted)", maxWidth: "160px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {u.address || "—"}
                      </td>
                      <td><span className={`badge badge-${u.role}`}>{u.role.replace("_", " ")}</span></td>
                      <td style={{ color: "var(--text-dim)", fontSize: "13px" }}>
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <div style={{ display: "inline-flex", gap: 6, alignItems: "center" }}>
                          <button
                            id={`view-user-${u.id}`}
                            className="btn-outline btn-sm"
                            onClick={() => setDetailsUser(u)}
                            style={{ padding: "4px 10px", fontSize: "12px" }}
                          >
                            👁 Details
                          </button>
                          {u.id !== user?.id && (
                            <button
                              id={`delete-user-${u.id}`}
                              className="btn-danger btn-sm"
                              onClick={() => setConfirm({ type: "user", id: u.id, name: u.name })}
                              style={{ padding: "4px 10px", fontSize: "12px" }}
                            >
                              🗑 Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ══ STORES TABLE ══ */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Stores</div>
              <div className="card-subtitle">All registered stores on the platform</div>
            </div>
            <span style={{
              background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)",
              color: "#34d399", padding: "4px 12px", borderRadius: "20px",
              fontSize: "13px", fontWeight: 700,
            }}>{stores.length} Stores</span>
          </div>

          {/* Store search */}
          <form onSubmit={handleStoreSearch} className="filter-grid" style={{ gridTemplateColumns: "1fr 1fr auto" }}>
            <input id="store-search-name"    placeholder="Search store name…"    value={storeSearch.name}
              onChange={(e) => setStoreSearch((p) => ({ ...p, name: e.target.value }))} />
            <input id="store-search-address" placeholder="Search address…" value={storeSearch.address}
              onChange={(e) => setStoreSearch((p) => ({ ...p, address: e.target.value }))} />
            <button id="store-search-btn" type="submit">Search</button>
          </form>

          {storeError && <div className="alert-error">⚠️ {storeError}</div>}

          {loadingStores ? (
            <div style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
              <div className="spinner" style={{ margin: "0 auto 12px" }} />Loading stores…
            </div>
          ) : stores.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px", color: "var(--text-dim)" }}>
              <div style={{ fontSize: "28px", marginBottom: "8px" }}>🏪</div>No stores found.
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th id="sort-store-name"    onClick={() => handleStoreSort("name")}>Store Name{sortIcon("name", storeSearch)}</th>
                    <th id="sort-store-email"   onClick={() => handleStoreSort("email")}>Email{sortIcon("email", storeSearch)}</th>
                    <th id="sort-store-address" onClick={() => handleStoreSort("address")}>Address{sortIcon("address", storeSearch)}</th>
                    <th id="sort-store-rating"  onClick={() => handleStoreSort("rating")}>Rating{sortIcon("rating", storeSearch)}</th>
                    <th>Reviews</th>
                    <th style={{ textAlign: "center" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {stores.map((s) => (
                    <tr key={s.id}>
                      <td style={{ fontWeight: 600 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div style={{
                            width: "30px", height: "30px", borderRadius: "8px",
                            background: "rgba(16,185,129,0.15)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: "14px", flexShrink: 0,
                          }}>🏪</div>
                          {s.name}
                        </div>
                      </td>
                      <td style={{ color: "var(--text-muted)" }}>{s.email || "—"}</td>
                      <td style={{ color: "var(--text-muted)", maxWidth: "180px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {s.address || "—"}
                      </td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          {renderStars(s.average_rating)}
                          <span style={{ fontWeight: 700, color: "#f59e0b", fontSize: "13px" }}>
                            {Number(s.average_rating).toFixed(1)}
                          </span>
                        </div>
                      </td>
                      <td style={{ color: "var(--text-muted)", fontSize: "13px" }}>{s.total_ratings}</td>
                      <td style={{ textAlign: "center" }}>
                        <button
                          id={`delete-store-${s.id}`}
                          className="btn-danger btn-sm"
                          onClick={() => setConfirm({ type: "store", id: s.id, name: s.name })}
                          style={{ padding: "5px 12px", fontSize: "12px" }}
                        >
                          🗑 Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* ── Add User Modal ── */}
      {showAddUser && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowAddUser(false)}>
          <div className="modal-box">
            <h2>➕ Add New User</h2>
            <p className="modal-subtitle">Create a new platform user with any role.</p>
            {addUserError && <div className="alert-error" style={{ marginBottom: 16 }}>⚠️ {addUserError}</div>}
            <form onSubmit={handleAddUser}>
              <div className="modal-field">
                <label>Full Name <span style={{ color: "var(--text-dim)", textTransform: "none" }}>(min 20, max 60 chars)</span></label>
                <input id="new-user-name" name="name" placeholder="Full name (20-60 chars)"
                  value={newUser.name} onChange={(e) => setNewUser((p) => ({ ...p, name: e.target.value }))} required />
              </div>
              <div className="modal-field">
                <label>Email</label>
                <input id="new-user-email" type="email" name="email" placeholder="user@example.com"
                  value={newUser.email} onChange={(e) => setNewUser((p) => ({ ...p, email: e.target.value }))} required />
              </div>
              <div className="modal-field">
                <label>Password <span style={{ color: "var(--text-dim)", textTransform: "none" }}>(8-16 chars, 1 upper, 1 special)</span></label>
                <input id="new-user-password" type="password" name="password" placeholder="Password"
                  value={newUser.password} onChange={(e) => setNewUser((p) => ({ ...p, password: e.target.value }))} required />
              </div>
              <div className="modal-field">
                <label>Address <span style={{ color: "var(--text-dim)", textTransform: "none" }}>(max 400 chars)</span></label>
                <input id="new-user-address" name="address" placeholder="Address"
                  value={newUser.address} onChange={(e) => setNewUser((p) => ({ ...p, address: e.target.value }))} />
              </div>
              <div className="modal-field">
                <label>Role</label>
                <select id="new-user-role" name="role" value={newUser.role}
                  onChange={(e) => setNewUser((p) => ({ ...p, role: e.target.value }))}>
                  <option value="user">Normal User</option>
                  <option value="store_owner">Store Owner</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="modal-actions">
                <button id="create-user-btn" type="submit" disabled={addingUser}>
                  {addingUser ? "Creating…" : "Create User"}
                </button>
                <button id="cancel-add-user-btn" type="button" className="btn-secondary" onClick={() => setShowAddUser(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Add Store Modal ── */}
      {showAddStore && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowAddStore(false)}>
          <div className="modal-box">
            <h2>🏪 Add New Store</h2>
            <p className="modal-subtitle">Register a store and assign it to an owner.</p>
            {addStoreError && <div className="alert-error" style={{ marginBottom: 16 }}>⚠️ {addStoreError}</div>}
            <form onSubmit={handleAddStore}>
              <div className="modal-field">
                <label>Store Name <span style={{ color: "var(--text-dim)", textTransform: "none" }}>(min 20, max 60 chars)</span></label>
                <input id="new-store-name" name="name" placeholder="Store name (20-60 chars)"
                  value={newStore.name} onChange={(e) => setNewStore((p) => ({ ...p, name: e.target.value }))} required />
              </div>
              <div className="modal-field">
                <label>Store Email</label>
                <input id="new-store-email" type="email" name="email" placeholder="store@example.com"
                  value={newStore.email} onChange={(e) => setNewStore((p) => ({ ...p, email: e.target.value }))} required />
              </div>
              <div className="modal-field">
                <label>Address <span style={{ color: "var(--text-dim)", textTransform: "none" }}>(max 400 chars)</span></label>
                <input id="new-store-address" name="address" placeholder="Store address"
                  value={newStore.address} onChange={(e) => setNewStore((p) => ({ ...p, address: e.target.value }))} required />
              </div>
              <div className="modal-field">
                <label>Assign to Store Owner</label>
                <select id="new-store-owner" name="owner_id" value={newStore.owner_id}
                  onChange={(e) => setNewStore((p) => ({ ...p, owner_id: e.target.value }))} required>
                  <option value="">— Select Store Owner —</option>
                  {storeOwners.map((o) => (
                    <option key={o.id} value={o.id}>{o.name} ({o.email})</option>
                  ))}
                </select>
                {storeOwners.length === 0 && !addStoreError && (
                  <p style={{ color: "var(--warning)", fontSize: "12px", marginTop: 6 }}>
                    ⚠️ No store owners found. Create a user with the "Store Owner" role first.
                  </p>
                )}
              </div>
              <div className="modal-actions">
                <button id="create-store-btn" type="submit" disabled={addingStore || !newStore.owner_id}>
                  {addingStore ? "Creating…" : "Create Store"}
                </button>
                <button id="cancel-add-store-btn" type="button" className="btn-secondary" onClick={() => setShowAddStore(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── User Details Modal ── */}
      {detailsUser && (
        <UserDetailsModal
          user={detailsUser}
          onClose={() => setDetailsUser(null)}
        />
      )}

      {/* ── Delete Confirm Modal ── */}
      {confirm && (
        <ConfirmModal
          message={`This will permanently delete "${confirm.name}" and all associated data. This cannot be undone.`}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setConfirm(null)}
          loading={deleting}
        />
      )}
    </div>
  );
}

export default Admin;