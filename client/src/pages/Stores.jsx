import { useEffect, useState } from "react";
import { getStores } from "../api/stores";
import { submitRating } from "../api/ratings";
import { changePassword, updateProfile } from "../api/auth";
import { useAuth } from "../context/AuthContext";

/* ── tab IDs ── */
const TAB_STORES  = "stores";
const TAB_PROFILE = "profile";

function Stores() {
  const { user, logoutUser, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState(TAB_STORES);

  /* ── store state ── */
  const [stores, setStores]           = useState([]);
  const [nameSearch, setNameSearch]   = useState("");
  const [addrSearch, setAddrSearch]   = useState("");
  const [loading, setLoading]         = useState(true);
  const [storeError, setStoreError]   = useState("");
  const [storeSuccess, setStoreSuccess] = useState("");
  const [selectedRatings, setSelectedRatings] = useState({});
  const [submitting, setSubmitting]           = useState({});
  const [hovered, setHovered]                 = useState({});

  /* ── profile state ── */
  const [profileForm, setProfileForm] = useState({ name: user?.name || "", address: user?.address || "" });
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileError, setProfileError]   = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");

  /* ── password state ── */
  const [pwdForm, setPwdForm]     = useState({ oldPassword: "", newPassword: "", confirm: "" });
  const [savingPwd, setSavingPwd] = useState(false);
  const [pwdError, setPwdError]   = useState("");
  const [pwdSuccess, setPwdSuccess] = useState("");

  /* ── fetch stores ── */
  const fetchStores = async () => {
    try {
      setLoading(true); setStoreError("");
      const r = await getStores({ name: nameSearch, address: addrSearch });
      setStores(r.data);
    } catch (err) {
      setStoreError(err.response?.data?.message || "Unable to load stores");
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchStores(); }, []);

  const flash = (setter, msg) => { setter(msg); setTimeout(() => setter(""), 3500); };

  /* ── rating ── */
  const handleSubmitRating = async (storeId) => {
    const rating = selectedRatings[storeId];
    if (!rating) { setStoreError("Please select a rating first."); return; }
    try {
      setSubmitting((p) => ({ ...p, [storeId]: true }));
      setStoreError(""); setStoreSuccess("");
      await submitRating({ store_id: storeId, rating });
      flash(setStoreSuccess, "Rating submitted!");
      await fetchStores();
      setSelectedRatings((p) => { const u = { ...p }; delete u[storeId]; return u; });
    } catch (err) {
      setStoreError(err.response?.data?.message || "Failed to submit rating");
    } finally { setSubmitting((p) => ({ ...p, [storeId]: false })); }
  };

  /* ── profile save ── */
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileError(""); setProfileSuccess("");
    setSavingProfile(true);
    try {
      const res = await updateProfile({ name: profileForm.name, address: profileForm.address });
      updateUser(res.data.user); // refresh navbar/avatar
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

  /* ── star selector ── */
  const StarSelector = ({ storeId }) => {
    const active  = selectedRatings[storeId] || 0;
    const hover   = hovered[storeId] || 0;
    const display = hover || active;
    return (
      <div className="star-select">
        {[1,2,3,4,5].map((s) => (
          <button key={s} type="button"
            className={`star-btn ${s <= display ? "active" : ""}`}
            onMouseEnter={() => setHovered((p) => ({ ...p, [storeId]: s }))}
            onMouseLeave={() => setHovered((p) => ({ ...p, [storeId]: 0 }))}
            onClick={() => setSelectedRatings((p) => ({ ...p, [storeId]: s }))}>★</button>
        ))}
      </div>
    );
  };

  const renderStars = (rating) => {
    const val = Number(rating) || 0;
    return (
      <span className="star-display">
        {[1,2,3,4,5].map((s) => (
          <span key={s} className={`star ${s <= Math.round(val) ? "filled" : "empty"}`}>★</span>
        ))}
      </span>
    );
  };

  const avatarChar = (name) => (name ? name[0].toUpperCase() : "U");

  /* ────────────────── render ────────────────── */
  return (
    <div className="page-container">
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-brand">
          <span className="navbar-logo">🏬 Roxiler</span>
          <span className="navbar-subtitle">Store Platform</span>
        </div>
        <div className="navbar-right">
          {/* Tab switcher */}
          <div style={{
            display: "flex", background: "var(--bg)", border: "1px solid var(--border)",
            borderRadius: "8px", overflow: "hidden",
          }}>
            <button
              id="tab-stores-btn"
              onClick={() => setActiveTab(TAB_STORES)}
              style={{
                padding: "7px 16px", fontSize: "13px", fontWeight: 600,
                borderRadius: 0,
                background: activeTab === TAB_STORES ? "var(--gradient)" : "transparent",
                color: activeTab === TAB_STORES ? "white" : "var(--text-muted)",
                boxShadow: "none", transform: "none",
              }}
            >🏪 Stores</button>
            <button
              id="tab-profile-btn"
              onClick={() => setActiveTab(TAB_PROFILE)}
              style={{
                padding: "7px 16px", fontSize: "13px", fontWeight: 600,
                borderRadius: 0,
                background: activeTab === TAB_PROFILE ? "var(--gradient)" : "transparent",
                color: activeTab === TAB_PROFILE ? "white" : "var(--text-muted)",
                boxShadow: "none", transform: "none",
              }}
            >👤 My Profile</button>
          </div>

          <div className="navbar-user">
            <div className="navbar-avatar">{avatarChar(user?.name)}</div>
            <span className="navbar-username">{user?.name || user?.email || "User"}</span>
          </div>
          <button className="btn-danger btn-sm" id="user-logout-btn" onClick={logoutUser}>Sign Out</button>
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

            {/* ── Profile Info Card ── */}
            <div className="card" style={{ marginBottom: 24 }}>
              {/* Avatar + current info */}
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
                  <span className="badge badge-user" style={{ marginTop: 8 }}>Normal User</span>
                </div>
              </div>

              {/* Edit form */}
              <div className="card-title" style={{ marginBottom: 20 }}>Edit Information</div>

              {profileError   && <div className="alert-error"   style={{ marginBottom: 16 }}>⚠️ {profileError}</div>}
              {profileSuccess && <div className="alert-success" style={{ marginBottom: 16 }}>✅ {profileSuccess}</div>}

              <form onSubmit={handleSaveProfile}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>
                      Full Name <span style={{ color: "var(--text-dim)", textTransform: "none", fontWeight: 400 }}>(min 20 chars)</span>
                    </label>
                    <input
                      id="profile-name"
                      value={profileForm.name}
                      onChange={(e) => setProfileForm((p) => ({ ...p, name: e.target.value }))}
                      placeholder="Your full name (min 20 characters)"
                      required
                    />
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
                  <input
                    id="profile-address"
                    value={profileForm.address}
                    onChange={(e) => setProfileForm((p) => ({ ...p, address: e.target.value }))}
                    placeholder="Your address"
                  />
                </div>
                <button id="save-profile-btn" type="submit" disabled={savingProfile} style={{ minWidth: 160 }}>
                  {savingProfile ? "Saving…" : "💾 Save Profile"}
                </button>
              </form>
            </div>

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
                  <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>
                    Current Password
                  </label>
                  <input id="user-old-password" type="password" value={pwdForm.oldPassword}
                    onChange={(e) => setPwdForm((p) => ({ ...p, oldPassword: e.target.value }))}
                    placeholder="Your current password" required style={{ maxWidth: 400 }} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>
                      New Password
                    </label>
                    <input id="user-new-password" type="password" value={pwdForm.newPassword}
                      onChange={(e) => setPwdForm((p) => ({ ...p, newPassword: e.target.value }))}
                      placeholder="8-16 chars, 1 uppercase, 1 special" required />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>
                      Confirm New Password
                    </label>
                    <input id="user-confirm-password" type="password" value={pwdForm.confirm}
                      onChange={(e) => setPwdForm((p) => ({ ...p, confirm: e.target.value }))}
                      placeholder="Re-enter new password" required />
                  </div>
                </div>
                <button id="user-save-password-btn" type="submit" disabled={savingPwd}
                  style={{ minWidth: 180, background: "linear-gradient(135deg, #f43f5e, #e11d48)" }}>
                  {savingPwd ? "Saving…" : "🔑 Update Password"}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ════ STORES TAB ════ */}
        {activeTab === TAB_STORES && (
          <>
            <div className="page-header">
              <div>
                <h1>Browse Stores</h1>
                <p>Discover stores and share your experience by rating them.</p>
              </div>
              <div style={{
                background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)",
                color: "var(--primary-light)", padding: "6px 16px", borderRadius: "20px",
                fontSize: "13px", fontWeight: 700,
              }}>
                {stores.length} Store{stores.length !== 1 ? "s" : ""}
              </div>
            </div>

            {storeError   && <div className="alert-error">⚠️ {storeError}</div>}
            {storeSuccess && <div className="alert-success">✅ {storeSuccess}</div>}

            {/* Search */}
            <form onSubmit={(e) => { e.preventDefault(); fetchStores(); }} className="search-bar">
              <input id="search-store-name" type="text" placeholder="🔍 Search by store name…"
                value={nameSearch} onChange={(e) => setNameSearch(e.target.value)} />
              <input id="search-store-address" type="text" placeholder="📍 Search by address…"
                value={addrSearch} onChange={(e) => setAddrSearch(e.target.value)} />
              <button id="stores-search-btn" type="submit" style={{ flexShrink: 0 }}>Search</button>
            </form>

            {loading && (
              <div style={{ textAlign: "center", padding: "60px" }}>
                <div className="spinner" style={{ margin: "0 auto 16px" }} /><p>Loading stores…</p>
              </div>
            )}

            {!loading && stores.length === 0 && (
              <div style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: "60px", textAlign: "center", borderRadius: 16 }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>🏪</div>
                <h3 style={{ marginBottom: 8 }}>No stores found</h3>
                <p>Try adjusting your search criteria.</p>
              </div>
            )}

            {!loading && stores.length > 0 && (
              <div className="stores-grid">
                {stores.map((store) => (
                  <div key={store.id} className="store-card">
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 12 }}>
                      <div style={{
                        width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                        background: "linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.2))",
                        border: "1px solid rgba(99,102,241,0.25)",
                        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
                      }}>🏪</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="store-card-name">{store.name}</div>
                        <div className="store-card-meta">📍 {store.address}</div>
                        <div className="store-card-meta">✉️ {store.email}</div>
                      </div>
                    </div>

                    <div className="store-card-divider" />

                    <div style={{ marginBottom: 16 }}>
                      <div className="section-label" style={{ marginBottom: 6 }}>Overall Rating</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        {renderStars(store.average_rating)}
                        <span style={{ fontWeight: 700, color: "#f59e0b", fontSize: 15 }}>
                          {Number(store.average_rating).toFixed(1)}
                        </span>
                        <span style={{ fontSize: 12, color: "var(--text-dim)" }}>
                          ({store.total_ratings} review{Number(store.total_ratings) !== 1 ? "s" : ""})
                        </span>
                      </div>
                    </div>

                    <div style={{ marginBottom: 18 }}>
                      <div className="section-label" style={{ marginBottom: 6 }}>Your Rating</div>
                      {store.my_rating ? (
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          {renderStars(store.my_rating)}
                          <span style={{ fontWeight: 600, color: "#f59e0b" }}>{store.my_rating}/5</span>
                        </div>
                      ) : (
                        <p style={{ fontSize: 13, color: "var(--text-dim)", margin: 0 }}>You haven't rated this store yet.</p>
                      )}
                    </div>

                    <div>
                      <div className="section-label" style={{ marginBottom: 8 }}>
                        {store.my_rating ? "Update your rating" : "Give a rating"}
                      </div>
                      <StarSelector storeId={store.id} />
                      {selectedRatings[store.id] && (
                        <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 8 }}>
                          Selected: {selectedRatings[store.id]} / 5
                        </p>
                      )}
                      <button
                        id={`submit-rating-${store.id}`}
                        onClick={() => handleSubmitRating(store.id)}
                        disabled={submitting[store.id] || !selectedRatings[store.id]}
                        style={{ width: "100%" }}
                      >
                        {submitting[store.id] ? "Submitting…" : store.my_rating ? "Update Rating" : "Submit Rating"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default Stores;