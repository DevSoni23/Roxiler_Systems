import { useEffect, useState } from "react";
import { getOwnerDashboard } from "../api/stores";
import { useAuth } from "../context/AuthContext";

function Owner() {
  const { user, logoutUser } = useAuth();

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);

        const response = await getOwnerDashboard();

        setDashboard(response.data);
      } catch (err) {
        console.error(err);

        const status = err.response?.status;
        const message = err.response?.data?.message;

        if (status === 403) {
          // Stale JWT — role was updated after login, needs re-auth
          setError(
            "SESSION_EXPIRED"
          );
        } else {
          setError(message || "Failed to load owner dashboard");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const getRatingStars = (rating) => {
    const value = Number(rating);

    return "★".repeat(Math.round(value)) +
      "☆".repeat(5 - Math.round(value));
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: "#f5f7fb",
        }}
      >
        <h2>Loading dashboard...</h2>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f5f7fb",
        color: "#1f2937",
      }}
    >
      {/* Navbar */}
      <nav
        style={{
          background: "#111827",
          color: "white",
          padding: "16px 32px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <h2 style={{ margin: 0 }}>
            Roxiler Systems
          </h2>

          <small style={{ color: "#9ca3af" }}>
            Store Owner Panel
          </small>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "20px",
          }}
        >
          <span>
            {user?.name || user?.email || "Store Owner"}
          </span>

          <button
            onClick={logoutUser}
            style={{
              background: "#ef4444",
              color: "white",
              border: "none",
              padding: "9px 16px",
              borderRadius: "7px",
              cursor: "pointer",
              fontWeight: "600",
            }}
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Main */}
      <main
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "40px 20px",
        }}
      >
        <div style={{ marginBottom: "30px" }}>
          <h1 style={{ marginBottom: "5px" }}>
            Store Owner Dashboard
          </h1>

          <p style={{ color: "#6b7280" }}>
            Monitor your store and customer ratings.
          </p>
        </div>

        {/* Error */}
        {error === "SESSION_EXPIRED" ? (
          <div
            style={{
              background: "#fff7ed",
              border: "1px solid #fed7aa",
              color: "#9a3412",
              padding: "24px",
              borderRadius: "10px",
              marginBottom: "20px",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "2rem", marginBottom: "8px" }}>⚠️</div>
            <h3 style={{ margin: "0 0 8px" }}>Session Expired</h3>
            <p style={{ margin: "0 0 16px", color: "#c2410c" }}>
              Your account role was recently updated. Please log out and log
              back in to access your dashboard.
            </p>
            <button
              onClick={logoutUser}
              style={{
                background: "#ea580c",
                color: "white",
                border: "none",
                padding: "10px 24px",
                borderRadius: "7px",
                cursor: "pointer",
                fontWeight: "600",
                fontSize: "14px",
              }}
            >
              Logout &amp; Re-login
            </button>
          </div>
        ) : error ? (
          <div
            style={{
              background: "#fee2e2",
              color: "#b91c1c",
              padding: "14px 18px",
              borderRadius: "8px",
              marginBottom: "20px",
            }}
          >
            {error}
          </div>
        ) : null}

        {dashboard && (
          <>
            {/* Store + Rating */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(300px, 1fr))",
                gap: "20px",
                marginBottom: "30px",
              }}
            >
              {/* Store Information */}
              <div
                style={{
                  background: "white",
                  padding: "28px",
                  borderRadius: "14px",
                  boxShadow:
                    "0 3px 12px rgba(0,0,0,0.06)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    marginBottom: "20px",
                  }}
                >
                  <div
                    style={{
                      width: "45px",
                      height: "45px",
                      borderRadius: "10px",
                      background: "#eff6ff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "22px",
                    }}
                  >
                    🏪
                  </div>

                  <div>
                    <h2 style={{ margin: 0 }}>
                      My Store
                    </h2>

                    <small style={{ color: "#6b7280" }}>
                      Store Information
                    </small>
                  </div>
                </div>

                <div style={{ marginBottom: "15px" }}>
                  <small style={{ color: "#6b7280" }}>
                    Store Name
                  </small>

                  <p
                    style={{
                      fontSize: "18px",
                      fontWeight: "600",
                      margin: "4px 0",
                    }}
                  >
                    {dashboard.store.name}
                  </p>
                </div>

                <div style={{ marginBottom: "15px" }}>
                  <small style={{ color: "#6b7280" }}>
                    Email
                  </small>

                  <p style={{ margin: "4px 0" }}>
                    {dashboard.store.email || "N/A"}
                  </p>
                </div>

                <div>
                  <small style={{ color: "#6b7280" }}>
                    Address
                  </small>

                  <p style={{ margin: "4px 0" }}>
                    {dashboard.store.address || "N/A"}
                  </p>
                </div>
              </div>

              {/* Average Rating */}
              <div
                style={{
                  background: "white",
                  padding: "28px",
                  borderRadius: "14px",
                  boxShadow:
                    "0 3px 12px rgba(0,0,0,0.06)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    fontSize: "42px",
                    marginBottom: "8px",
                  }}
                >
                  ⭐
                </div>

                <h2
                  style={{
                    fontSize: "42px",
                    margin: "0",
                  }}
                >
                  {Number(
                    dashboard.average_rating
                  ).toFixed(1)}
                </h2>

                <div
                  style={{
                    fontSize: "25px",
                    letterSpacing: "3px",
                    margin: "8px 0",
                  }}
                >
                  {getRatingStars(
                    dashboard.average_rating
                  )}
                </div>

                <p
                  style={{
                    color: "#6b7280",
                    margin: 0,
                  }}
                >
                  Average Rating
                </p>
              </div>
            </div>

            {/* Ratings */}
            <section
              style={{
                background: "white",
                padding: "28px",
                borderRadius: "14px",
                boxShadow:
                  "0 3px 12px rgba(0,0,0,0.06)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "20px",
                }}
              >
                <div>
                  <h2 style={{ margin: 0 }}>
                    Customer Ratings
                  </h2>

                  <p
                    style={{
                      color: "#6b7280",
                      margin: "5px 0 0",
                    }}
                  >
                    Users who have rated your store
                  </p>
                </div>

                <div
                  style={{
                    background: "#f3f4f6",
                    padding: "8px 14px",
                    borderRadius: "20px",
                    fontWeight: "600",
                  }}
                >
                  {dashboard.ratings.length} Ratings
                </div>
              </div>

              {dashboard.ratings.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "40px",
                    color: "#6b7280",
                  }}
                >
                  <div
                    style={{
                      fontSize: "40px",
                      marginBottom: "10px",
                    }}
                  >
                    ⭐
                  </div>

                  <p>
                    No ratings yet.
                  </p>
                </div>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                    }}
                  >
                    <thead>
                      <tr
                        style={{
                          borderBottom:
                            "2px solid #f3f4f6",
                        }}
                      >
                        <th
                          style={{
                            textAlign: "left",
                            padding: "14px",
                          }}
                        >
                          User
                        </th>

                        <th
                          style={{
                            textAlign: "left",
                            padding: "14px",
                          }}
                        >
                          Email
                        </th>

                        <th
                          style={{
                            textAlign: "left",
                            padding: "14px",
                          }}
                        >
                          Rating
                        </th>

                        <th
                          style={{
                            textAlign: "left",
                            padding: "14px",
                          }}
                        >
                          Date
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {dashboard.ratings.map(
                        (rating) => (
                          <tr
                            key={rating.id}
                            style={{
                              borderBottom:
                                "1px solid #f3f4f6",
                            }}
                          >
                            <td
                              style={{
                                padding: "14px",
                                fontWeight: "600",
                              }}
                            >
                              {rating.name}
                            </td>

                            <td
                              style={{
                                padding: "14px",
                                color: "#6b7280",
                              }}
                            >
                              {rating.email}
                            </td>

                            <td
                              style={{
                                padding: "14px",
                              }}
                            >
                              <span
                                style={{
                                  fontWeight: "600",
                                }}
                              >
                                {getRatingStars(
                                  rating.rating
                                )}
                              </span>

                              <span
                                style={{
                                  marginLeft: "8px",
                                }}
                              >
                                {rating.rating}/5
                              </span>
                            </td>

                            <td
                              style={{
                                padding: "14px",
                                color: "#6b7280",
                              }}
                            >
                              {new Date(
                                rating.updated_at
                              ).toLocaleDateString()}
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}

export default Owner;