import { useEffect, useState } from "react";
import { getDashboardStats, getUsers, addUser, getStoreOwners, addStore } from "../api/admin";
import { useAuth } from "../context/AuthContext";

function Admin() {
  const { user, logoutUser } = useAuth();

  const [stats, setStats] = useState({ totalUsers: 0, totalStores: 0, totalRatings: 0 });
  const [users, setUsers] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [error, setError] = useState("");

  const [filters, setFilters] = useState({
    name: "", email: "", address: "", role: "", sortBy: "name", order: "asc",
  });

  const [showAddUser, setShowAddUser] = useState(false);
  const [newUser, setNewUser] = useState({
    name: "", email: "", password: "", address: "", role: "user",
  });
  const [addingUser, setAddingUser] = useState(false);

  const [showAddStore, setShowAddStore] = useState(false);
  const [storeOwners, setStoreOwners] = useState([]);
  const [newStore, setNewStore] = useState({ name: "", email: "", address: "", owner_id: "" });
  const [addingStore, setAddingStore] = useState(false);

  const fetchStats = async () => {
    try {
      setLoadingStats(true);
      const response = await getDashboardStats();
      setStats(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load dashboard statistics");
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const response = await getUsers(filters);
      setUsers(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load users");
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchUsers();
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleNewUserChange = (e) => {
    const { name, value } = e.target;
    setNewUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      setAddingUser(true);
      setError("");
      await addUser(newUser);
      setNewUser({ name: "", email: "", password: "", address: "", role: "user" });
      setShowAddUser(false);
      await fetchStats();
      await fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create user");
    } finally {
      setAddingUser(false);
    }
  };

  const handleOpenAddStore = async () => {
    try {
      const res = await getStoreOwners();
      setStoreOwners(res.data);
      setShowAddStore(true);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load store owners");
    }
  };

  const handleNewStoreChange = (e) => {
    const { name, value } = e.target;
    setNewStore((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddStore = async (e) => {
    e.preventDefault();
    try {
      setAddingStore(true);
      setError("");
      await addStore(newStore);
      setNewStore({ name: "", email: "", address: "", owner_id: "" });
      setShowAddStore(false);
      await fetchStats();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create store");
    } finally {
      setAddingStore(false);
    }
  };

  return (
    <div className="page-container">
      <nav className="navbar">
        <div>
          <h2>Roxiler Systems</h2>
          <small>Admin Panel</small>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <span>{user?.name || user?.email || "Admin"}</span>
          <button className="btn-danger" onClick={logoutUser}>Logout</button>
        </div>
      </nav>

      <main className="page-content">
        <div className="page-header">
          <div>
            <h1>Admin Dashboard</h1>
            <p>Manage users, stores and ratings.</p>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <button onClick={() => setShowAddUser(true)}>+ Add User</button>
            <button onClick={handleOpenAddStore} style={{ background: "var(--primary, #6366f1)" }}>+ Add Store</button>
          </div>
        </div>

        {error && <div className="alert-error">{error}</div>}

        <div className="stats-grid">
          <div className="stat-card">
            <p>Total Users</p>
            <h2>{loadingStats ? "—" : stats.totalUsers}</h2>
          </div>
          <div className="stat-card">
            <p>Total Stores</p>
            <h2>{loadingStats ? "—" : stats.totalStores}</h2>
          </div>
          <div className="stat-card">
            <p>Total Ratings</p>
            <h2>{loadingStats ? "—" : stats.totalRatings}</h2>
          </div>
        </div>

        <section className="card">
          <h2 style={{ marginBottom: "20px" }}>Users</h2>

          <form onSubmit={handleSearch} className="filter-grid">
            <input name="name" placeholder="Search name" value={filters.name} onChange={handleFilterChange} />
            <input name="email" placeholder="Search email" value={filters.email} onChange={handleFilterChange} />
            <input name="address" placeholder="Search address" value={filters.address} onChange={handleFilterChange} />

            <select name="role" value={filters.role} onChange={handleFilterChange}>
              <option value="">All Roles</option>
              <option value="admin">Admin</option>
              <option value="store_owner">Store Owner</option>
              <option value="user">Normal</option>
            </select>

            <select name="sortBy" value={filters.sortBy} onChange={handleFilterChange}>
              <option value="name">Name</option>
              <option value="email">Email</option>
              <option value="role">Role</option>
              <option value="created_at">Created Date</option>
            </select>

            <select name="order" value={filters.order} onChange={handleFilterChange}>
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>

            <button type="submit">Search</button>
          </form>

          {loadingUsers ? (
            <p style={{ color: "var(--text-muted)" }}>Loading users…</p>
          ) : users.length === 0 ? (
            <p style={{ color: "var(--text-muted)" }}>No users found.</p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Address</th>
                    <th>Role</th>
                    <th>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td>{u.name}</td>
                      <td>{u.email}</td>
                      <td>{u.address}</td>
                      <td><span className={`badge badge-${u.role}`}>{u.role}</span></td>
                      <td>{new Date(u.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      {showAddUser && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h2>Add New User</h2>
            <form onSubmit={handleAddUser}>
              <div className="modal-field">
                <input name="name" placeholder="Full Name" value={newUser.name} onChange={handleNewUserChange} required />
              </div>
              <div className="modal-field">
                <input type="email" name="email" placeholder="Email" value={newUser.email} onChange={handleNewUserChange} required />
              </div>
              <div className="modal-field">
                <input type="password" name="password" placeholder="Password" value={newUser.password} onChange={handleNewUserChange} required />
              </div>
              <div className="modal-field">
                <input name="address" placeholder="Address" value={newUser.address} onChange={handleNewUserChange} required />
              </div>
              <div className="modal-field">
                <select name="role" value={newUser.role} onChange={handleNewUserChange}>
                  <option value="user">User</option>
                  <option value="store_owner">Store Owner</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
                <button type="submit" disabled={addingUser} style={{ flex: 1 }}>
                  {addingUser ? "Creating…" : "Create User"}
                </button>
                <button type="button" className="btn-secondary" style={{ flex: 1 }} onClick={() => setShowAddUser(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAddStore && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h2>Add New Store</h2>
            <form onSubmit={handleAddStore}>
              <div className="modal-field">
                <input name="name" placeholder="Store Name" value={newStore.name} onChange={handleNewStoreChange} required />
              </div>
              <div className="modal-field">
                <input type="email" name="email" placeholder="Store Email" value={newStore.email} onChange={handleNewStoreChange} required />
              </div>
              <div className="modal-field">
                <input name="address" placeholder="Store Address" value={newStore.address} onChange={handleNewStoreChange} required />
              </div>
              <div className="modal-field">
                <select name="owner_id" value={newStore.owner_id} onChange={handleNewStoreChange} required>
                  <option value="">— Select Store Owner —</option>
                  {storeOwners.map((o) => (
                    <option key={o.id} value={o.id}>{o.name} ({o.email})</option>
                  ))}
                </select>
              </div>
              {storeOwners.length === 0 && (
                <p style={{ color: "#ef4444", fontSize: "13px", margin: "4px 0 8px" }}>
                  No store owners found. Create a user with the "Store Owner" role first.
                </p>
              )}
              <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
                <button type="submit" disabled={addingStore || !newStore.owner_id} style={{ flex: 1 }}>
                  {addingStore ? "Creating…" : "Create Store"}
                </button>
                <button type="button" className="btn-secondary" style={{ flex: 1 }} onClick={() => setShowAddStore(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Admin;