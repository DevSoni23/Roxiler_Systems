import { useEffect, useState } from "react";
import { getOwnerDashboard, updateOwnerStore } from "../api/stores";
import { changePassword, updateProfile } from "../api/auth";
import { useAuth } from "../context/AuthContext";

const TAB_DASHBOARD = "dashboard";
const TAB_PROFILE   = "profile";

function Owner() {
  const { user, logoutUser, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState(TAB_DASHBOARD);

  /* ── dashboard state ── */
  const [dashboard, setDashboard]     = useState(null);
  const [loading, setLoading]         = useState(true);
  const [dashError, setDashError]     = useState("");
  const [dashSuccess, setDashSuccess] = useState("");

  /* ── sorting for ratings table ── */
  const [ratingSort, setRatingSort] = useState({ sortBy: "updated_at", order: "desc" });

  /* ── edit store modal ── */
  const [showEditStore, setShowEditStore] = useState(false);
  const [storeForm, setStoreForm]         = useState({ name: "", email: "", address: "" });
  const [savingStore, setSavingStore]     = useState(false);
  const [storeError, setStoreError]       = useState("");

  /* ── profile state ── */
  const [profileForm, setProfileForm]     = useState({ name: user?.name || "", address: user?.address || "" });
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileError, setProfileError]   = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");

  /* ── password state ── */
  const [pwdForm, setPwdForm]     = useState({ oldPassword: "", newPassword: "", confirm: "" });
  const [savingPwd, setSavingPwd] = useState(false);
  const [pwdError, setPwdError]   = useState("");
  const [pwdSuccess, setPwdSuccess] = useState("");

  /* ── fetch ── */
  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const r = await getOwnerDashboard();
      setDashboard(r.data);
      setStoreForm({
        name:    r.data.store.name    || "",
        email:   r.data.store.email   || "",
        address: r.data.store.address || "",
      });
    } catch (err) {
      const status  = err.response?.status;
      const message = err.response?.data?.message;
      setDashError(status === 403 ? "SESSION_EXPIRED" : message || "Failed to load dashboard");
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchDashboard(); }, []);

  const flash = (setter, msg) => { setter(msg); setTimeout(() => setter(""), 3500); };

  /* ── store edit ── */
  const handleSaveStore = async (e) => {
    e.preventDefault();
    setStoreError(""); setSavingStore(true);
    try {
      await updateOwnerStore(storeForm);
      await fetchDashboard();
      setShowEditStore(false);
      flash(setDashSuccess, "Store updated successfully!");
    } catch (err) {
      setStoreError(err.response?.data?.message || "Failed to update store");
    } finally { setSavingStore(false); }
  };

  /* ── profile save ── */
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileError(""); setProfileSuccess("");
    setSavingProfile(true);
    try {
      const res = await updateProfile({ name: profileForm.name, address: profileForm.address });
      updateUser(res.data.user);
      flash(setProfileSuccess, "Profile updated successfully!");
    } catch (err) {
      setProfileError(err.response?.data?.message || "Failed to update profile");
    } finally { setSavingProfile(false); }
  };

  /* ── password change ── */
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwdError(""); setPwdSuccess("");
    if (pwdForm.newPassword !== pwdForm.confirm) { setPwdError("New passwords do not match."); return; }
    setSavingPwd(true);
    try {
      await changePassword({ oldPassword: pwdForm.oldPassword, newPassword: pwdForm.newPassword });
      setPwdForm({ oldPassword: "", newPassword: "", confirm: "" });
      flash(setPwdSuccess, "Password changed successfully!");
    } catch (err) {
      setPwdError(err.response?.data?.message || "Failed to change password");
    } finally { setSavingPwd(false); }
  };

  /* ── sort ratings ── */
  const handleRatingSort = (col) => {
    setRatingSort((prev) => ({
      sortBy: col,
      order: prev.sortBy === col && prev.order === "asc" ? "desc" : "asc",
    }));
  };

  const getSortedRatings = () => {
    if (!dashboard?.ratings) return [];
    return [...dashboard.ratings].sort((a, b) => {
      let valA = a[ratingSort.sortBy];
      let valB = b[ratingSort.sortBy];
      if (typeof valA === "string") valA = valA.toLowerCase();
      if (typeof valB === "string") valB = valB.toLowerCase();
      if (valA < valB) return ratingSort.order === "asc" ? -1 : 1;
      if (valA > valB) return ratingSort.order === "asc" ? 1 : -1;
      return 0;
    });
  };

  const sortIcon = (col) => {
    if (ratingSort.sortBy !== col) return " ↕";
    return ratingSort.order === "asc" ? " ↑" : " ↓";
  };

  /* ── stars ── */
  const renderStars = (rating, size = 18) => {
    const val = Number(rating) || 0;
    return (
      <span className="star-display">
        {[1,2,3,4,5].map((s) => (
          <span key={s} className={`star ${s <= Math.round(val) ? "filled" : "empty"}`} style={{ fontSize: size }}>★</span>
        ))}
      </span>
    );
  };

  const avatarChar = (name) => (name ? name[0].toUpperCase() : "O");

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner" /><p>Loading dashboard…</p>
      </div>
    );
  }

  const sortedRatings = getSortedRatings();

  return (
    <div className="page-container">
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-brand">
          <span className="navbar-logo">🏬 Roxiler</span>
          <span className="navbar-subtitle">Owner Panel</span>
        </div>
        <div className="navbar-right">
          {/* Tab switcher */}
          <div style={{
            display: "flex", background: "var(--bg)", border: "1px solid var(--border)",
            borderRadius: 8, overflow: "hidden",
          }}>
            <button id="tab-dashboard-btn" onClick={() => setActiveTab(TAB_DASHBOARD)} style={{
              padding: "7px 16px", fontSize: "13px", fontWeight: 600, borderRadius: 0,
              background: activeTab === TAB_DASHBOARD ? "var(--gradient)" : "transparent",
              color: activeTab === TAB_DASHBOARD ? "white" : "var(--text-muted)",
              boxShadow: "none", transform: "none",
            }}>📊 Dashboard</button>
            <button id="tab-profile-btn" onClick={() => setActiveTab(TAB_PROFILE)} style={{
              padding: "7px 16px", fontSize: "13px", fontWeight: 600, borderRadius: 0,
              background: activeTab === TAB_PROFILE ? "var(--gradient)" : "transparent",
              color: activeTab === TAB_PROFILE ? "white" : "var(--text-muted)",
              boxShadow: "none", transform: "none",
            }}>👤 My Profile</button>
          </div>

          <div className="navbar-user">
            <div className="navbar-avatar">{avatarChar(user?.name)}</div>
            <span className="navbar-username">{user?.name || user?.email || "Store Owner"}</span>
          </div>
          <button className="btn-danger btn-sm" id="owner-logout-btn" onClick={logoutUser}>Sign Out</button>
        </div>
      </nav>

      <main className="page-content">

        {/* ════ PROFILE TAB ════ */}
        {activeTab === TAB_PROFILE && (
          <div style={{ maxWidth: 720, margin: "0 auto" }}>
            <div className="page-header" style={{ marginBottom: 28 }}>
              <div>
                <h1>My Profile</h1>
                <p>Manage your personal information and account security.</p>
              </div>
            </div>

            {/* ── Personal Info Card ── */}
            <div className="card" style={{ marginBottom: 24 }}>
              {/* Avatar */}
              <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 28, paddingBottom: 24, borderBottom: "1px solid var(--border)" }}>
                <div style={{
                  width: 72, height: 72, borderRadius: "50%", flexShrink: 0,
                  background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 28, fontWeight: 800, color: "white",
                  boxShadow: "0 0 24px rgba(99,102,241,0.4)",
                }}>
                  {avatarChar(user?.name)}
                </div>
                <div>
                  <div style={{ fontSize: "1.2rem", fontWeight: 700 }}>{user?.name || "—"}</div>
                  <div style={{ color: "var(--text-muted)", fontSize: 14, marginTop: 2 }}>{user?.email}</div>
                  <span className="badge badge-store_owner" style={{ marginTop: 8 }}>Store Owner</span>
                </div>
              </div>

              <div className="card-title" style={{ marginBottom: 20 }}>Edit Personal Information</div>

              {profileError   && <div className="alert-error"   style={{ marginBottom: 16 }}>⚠️ {profileError}</div>}
              {profileSuccess && <div className="alert-success" style={{ marginBottom: 16 }}>✅ {profileSuccess}</div>}

              <form onSubmit={handleSaveProfile}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>
                      Full Name <span style={{ color: "var(--text-dim)", textTransform: "none", fontWeight: 400 }}>(min 20, max 60 chars)</span>
                    </label>
                    <input id="owner-profile-name" value={profileForm.name}
                      onChange={(e) => setProfileForm((p) => ({ ...p, name: e.target.value }))}
                      placeholder="Your full name (20-60 chars)" required />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>
                      Email <span style={{ color: "var(--text-dim)", textTransform: "none", fontWeight: 400 }}>(cannot change)</span>
                    </label>
                    <input value={user?.email || ""} disabled style={{ opacity: 0.5, cursor: "not-allowed" }} />
                  </div>
                </div>
                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>
                    Address <span style={{ color: "var(--text-dim)", textTransform: "none", fontWeight: 400 }}>(max 400 chars)</span>
                  </label>
                  <input id="owner-profile-address" value={profileForm.address}
                    onChange={(e) => setProfileForm((p) => ({ ...p, address: e.target.value }))}
                    placeholder="Your address" />
                </div>
                <button id="save-profile-btn" type="submit" disabled={savingProfile} style={{ minWidth: 160 }}>
                  {savingProfile ? "Saving…" : "💾 Save Profile"}
                </button>
              </form>
            </div>

            {/* ── Store Info Card ── */}
            {dashboard && (
              <div className="card" style={{ marginBottom: 24 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, paddingBottom: 20, borderBottom: "1px solid var(--border)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{
                      width: 52, height: 52, borderRadius: 14, flexShrink: 0,
                      background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.2)",
                      display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24,
                    }}>🏪</div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: "1.05rem" }}>{dashboard.store.name}</div>
                      <div style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 2 }}>{dashboard.store.email}</div>
                    </div>
                  </div>
                  <button id="edit-store-btn" className="btn-outline btn-sm" onClick={() => { setStoreError(""); setShowEditStore(true); }}>
                    ✏️ Edit Store
                  </button>
                </div>
                <div className="card-title" style={{ marginBottom: 16 }}>Store Details</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20 }}>
                  <div>
                    <div className="section-label">Address</div>
                    <div className="section-value" style={{ fontSize: 14, color: "var(--text-muted)" }}>{dashboard.store.address || "—"}</div>
                  </div>
                  <div>
                    <div className="section-label">Avg Rating</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
                      {renderStars(dashboard.average_rating, 16)}
                      <span style={{ fontWeight: 700, color: "#f59e0b" }}>{Number(dashboard.average_rating).toFixed(1)}</span>
                    </div>
                  </div>
                  <div>
                    <div className="section-label">Total Reviews</div>
                    <div className="section-value">{dashboard.ratings.length}</div>
                  </div>
                </div>
              </div>
            )}

            {/* ── Change Password Card ── */}
            <div className="card">
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                  background: "rgba(244,63,94,0.1)", border: "1px solid rgba(244,63,94,0.2)",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
                }}>🔑</div>
                <div>
                  <div className="card-title">Change Password</div>
                  <div className="card-subtitle">Set a new password for your account</div>
                </div>
              </div>

              {pwdError   && <div className="alert-error"   style={{ marginBottom: 16 }}>⚠️ {pwdError}</div>}
              {pwdSuccess && <div className="alert-success" style={{ marginBottom: 16 }}>✅ {pwdSuccess}</div>}

              <form onSubmit={handleChangePassword}>
                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Current Password</label>
                  <input id="owner-old-password" type="password" value={pwdForm.oldPassword}
                    onChange={(e) => setPwdForm((p) => ({ ...p, oldPassword: e.target.value }))}
                    placeholder="Your current password" required style={{ maxWidth: 400 }} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>New Password</label>
                    <input id="owner-new-password" type="password" value={pwdForm.newPassword}
                      onChange={(e) => setPwdForm((p) => ({ ...p, newPassword: e.target.value }))}
                      placeholder="8-16 chars, 1 uppercase, 1 special" required />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Confirm New Password</label>
                    <input id="owner-confirm-password" type="password" value={pwdForm.confirm}
                      onChange={(e) => setPwdForm((p) => ({ ...p, confirm: e.target.value }))}
                      placeholder="Re-enter new password" required />
                  </div>
                </div>
                <button id="owner-save-password-btn" type="submit" disabled={savingPwd}
                  style={{ minWidth: 180, background: "linear-gradient(135deg, #f43f5e, #e11d48)" }}>
                  {savingPwd ? "Saving…" : "🔑 Update Password"}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ════ DASHBOARD TAB ════ */}
        {activeTab === TAB_DASHBOARD && (
          <>
            <div className="page-header">
              <div>
                <h1>Store Owner Dashboard</h1>
                <p>Monitor your store performance and customer ratings.</p>
              </div>
            </div>

            {dashSuccess && <div className="alert-success">✅ {dashSuccess}</div>}

            {dashError === "SESSION_EXPIRED" ? (
              <div style={{
                background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.25)",
                color: "#fbbf24", padding: 28, borderRadius: 16, textAlign: "center", marginBottom: 24,
              }}>
                <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>⚠️</div>
                <h3 style={{ marginBottom: 8, color: "#fbbf24" }}>Session Expired</h3>
                <p style={{ color: "#f59e0b", marginBottom: 20 }}>Your role was recently updated. Please log out and log back in.</p>
                <button onClick={logoutUser} style={{ background: "rgba(251,191,36,0.2)", border: "1px solid #fbbf24", color: "#fbbf24" }}>
                  Logout & Re-login
                </button>
              </div>
            ) : dashError ? (
              <div className="alert-error">⚠️ {dashError}</div>
            ) : null}

            {dashboard && (
              <>
                {/* Top row */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20, marginBottom: 28 }}>
                  {/* Store info */}
                  <div className="card" style={{ marginBottom: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
                      <div style={{
                        width: 48, height: 48, borderRadius: 12, background: "rgba(99,102,241,0.12)",
                        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0,
                      }}>🏪</div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: "1rem" }}>My Store</div>
                        <div style={{ fontSize: 12, color: "var(--text-dim)" }}>Store Information</div>
                      </div>
                      <button id="edit-store-quick-btn" className="btn-outline btn-sm" style={{ marginLeft: "auto" }}
                        onClick={() => { setStoreError(""); setShowEditStore(true); }}>✏️ Edit</button>
                    </div>
                    <div style={{ marginBottom: 14 }}>
                      <div className="section-label">Store Name</div>
                      <div className="section-value">{dashboard.store.name}</div>
                    </div>
                    <div style={{ marginBottom: 14 }}>
                      <div className="section-label">Email</div>
                      <div className="section-value" style={{ color: "var(--text-muted)" }}>{dashboard.store.email || "—"}</div>
                    </div>
                    <div>
                      <div className="section-label">Address</div>
                      <div className="section-value" style={{ color: "var(--text-muted)", fontSize: 14 }}>{dashboard.store.address || "—"}</div>
                    </div>
                  </div>

                  {/* Rating */}
                  <div className="card" style={{ marginBottom: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
                    <div style={{ fontSize: "3rem", marginBottom: 8 }}>⭐</div>
                    <div style={{
                      fontSize: 54, fontWeight: 800, lineHeight: 1,
                      background: "linear-gradient(135deg, #f59e0b, #fbbf24)",
                      WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                      backgroundClip: "text", marginBottom: 8,
                    }}>
                      {Number(dashboard.average_rating).toFixed(1)}
                    </div>
                    <div style={{ marginBottom: 6 }}>{renderStars(dashboard.average_rating, 22)}</div>
                    <div style={{ color: "var(--text-muted)", fontSize: 14 }}>
                      Average Rating · {dashboard.ratings.length} review{dashboard.ratings.length !== 1 ? "s" : ""}
                    </div>
                  </div>
                </div>

                {/* Ratings table */}
                <div className="card">
                  <div className="card-header">
                    <div>
                      <div className="card-title">Customer Ratings</div>
                      <div className="card-subtitle">Users who have rated your store</div>
                    </div>
                    <div style={{
                      background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)",
                      color: "var(--primary-light)", padding: "5px 14px", borderRadius: 20,
                      fontSize: 13, fontWeight: 700,
                    }}>
                      {dashboard.ratings.length} Ratings
                    </div>
                  </div>
                  {sortedRatings.length === 0 ? (
                    <div style={{ textAlign: "center", padding: 48, color: "var(--text-dim)" }}>
                      <div style={{ fontSize: 40, marginBottom: 12 }}>⭐</div>
                      <p>No ratings yet. Share your store to get your first review!</p>
                    </div>
                  ) : (
                    <div className="table-wrap">
                      <table>
                        <thead>
                          <tr>
                            <th id="sort-customer-name" onClick={() => handleRatingSort("name")}>Customer{sortIcon("name")}</th>
                            <th id="sort-customer-email" onClick={() => handleRatingSort("email")}>Email{sortIcon("email")}</th>
                            <th id="sort-customer-rating" onClick={() => handleRatingSort("rating")}>Rating{sortIcon("rating")}</th>
                            <th id="sort-customer-date" onClick={() => handleRatingSort("updated_at")}>Date{sortIcon("updated_at")}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sortedRatings.map((r) => (
                            <tr key={r.id}>
                              <td style={{ fontWeight: 600 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                  <div style={{
                                    width: 30, height: 30, borderRadius: "50%",
                                    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    fontSize: 12, fontWeight: 700, color: "white", flexShrink: 0,
                                  }}>{r.name ? r.name[0].toUpperCase() : "?"}</div>
                                  {r.name}
                                </div>
                              </td>
                              <td style={{ color: "var(--text-muted)" }}>{r.email}</td>
                              <td>
                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                  {renderStars(r.rating, 16)}
                                  <span style={{ fontWeight: 600, color: "#f59e0b" }}>{r.rating}/5</span>
                                </div>
                              </td>
                              <td style={{ color: "var(--text-dim)", fontSize: 13 }}>
                                {new Date(r.updated_at).toLocaleDateString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </>
            )}
          </>
        )}
      </main>

      {/* ── Edit Store Modal ── */}
      {showEditStore && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowEditStore(false)}>
          <div className="modal-box">
            <h2>🏪 Edit Store Info</h2>
            <p className="modal-subtitle">Update your store's public information.</p>
            {storeError && <div className="alert-error" style={{ marginBottom: 16 }}>⚠️ {storeError}</div>}
            <form onSubmit={handleSaveStore}>
              <div className="modal-field">
                <label>Store Name <span style={{ color: "var(--text-dim)", textTransform: "none" }}>(min 20, max 60 chars)</span></label>
                <input id="edit-store-name" value={storeForm.name}
                  onChange={(e) => setStoreForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="Store name (20-60 chars)" required />
              </div>
              <div className="modal-field">
                <label>Store Email</label>
                <input id="edit-store-email" type="email" value={storeForm.email}
                  onChange={(e) => setStoreForm((p) => ({ ...p, email: e.target.value }))}
                  placeholder="store@example.com" required />
              </div>
              <div className="modal-field">
                <label>Address <span style={{ color: "var(--text-dim)", textTransform: "none" }}>(max 400 chars)</span></label>
                <input id="edit-store-address" value={storeForm.address}
                  onChange={(e) => setStoreForm((p) => ({ ...p, address: e.target.value }))}
                  placeholder="Store address" />
              </div>
              <div className="modal-actions">
                <button id="save-store-btn" type="submit" disabled={savingStore}>
                  {savingStore ? "Saving…" : "Save Changes"}
                </button>
                <button id="cancel-edit-store-btn" type="button" className="btn-secondary" onClick={() => setShowEditStore(false)}>
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

export default Owner;