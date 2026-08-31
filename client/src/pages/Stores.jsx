import { useEffect, useState } from "react";
import { getStores } from "../api/stores";
import { submitRating } from "../api/ratings";
import { useAuth } from "../context/AuthContext";

function Stores() {
  const { user, logoutUser } = useAuth();

  const [stores, setStores] = useState([]);
  const [nameSearch, setNameSearch] = useState("");
  const [addressSearch, setAddressSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedRatings, setSelectedRatings] = useState({});
  const [submitting, setSubmitting] = useState({});
  const [success, setSuccess] = useState("");

  const fetchStores = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getStores({
        name: nameSearch,
        address: addressSearch,
      });

      setStores(response.data);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message || "Unable to load stores"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchStores();
  };

  const handleRatingChange = (storeId, rating) => {
    setSelectedRatings((prev) => ({
      ...prev,
      [storeId]: Number(rating),
    }));
  };

  const handleSubmitRating = async (storeId) => {
    const rating = selectedRatings[storeId];

    if (!rating) {
      setError("Please select a rating first.");
      return;
    }

    try {
      setSubmitting((prev) => ({
        ...prev,
        [storeId]: true,
      }));

      setError("");
      setSuccess("");

      await submitRating({
        store_id: storeId,
        rating,
      });

      setSuccess("Rating submitted successfully!");

      // Refresh stores so average_rating and my_rating update
      await fetchStores();

      // Clear selected rating
      setSelectedRatings((prev) => {
        const updated = { ...prev };
        delete updated[storeId];
        return updated;
      });

      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message || "Failed to submit rating"
      );
    } finally {
      setSubmitting((prev) => ({
        ...prev,
        [storeId]: false,
      }));
    }
  };

  const renderStars = (rating) => {
    const value = Number(rating) || 0;

    return (
      <span>
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            style={{
              color: star <= Math.round(value) ? "#f59e0b" : "#d1d5db",
              fontSize: "20px",
            }}
          >
            ★
          </span>
        ))}
      </span>
    );
  };

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
          <h2 style={{ margin: 0 }}>Roxiler Systems</h2>
          <small style={{ color: "#9ca3af" }}>
            Store Rating Platform
          </small>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <span>
            {user?.name || user?.email || "User"}
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

      {/* Main content */}
      <main
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          padding: "40px 20px",
        }}
      >
        <div style={{ marginBottom: "30px" }}>
          <h1 style={{ marginBottom: "8px" }}>Stores</h1>
          <p style={{ color: "#6b7280" }}>
            Discover stores and share your experience by rating them.
          </p>
        </div>

        {/* Search */}
        <form
          onSubmit={handleSearch}
          style={{
            background: "white",
            padding: "20px",
            borderRadius: "12px",
            marginBottom: "25px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
            display: "flex",
            gap: "12px",
            flexWrap: "wrap",
          }}
        >
          <input
            type="text"
            placeholder="Search by store name..."
            value={nameSearch}
            onChange={(e) => setNameSearch(e.target.value)}
            style={{
              flex: 1,
              minWidth: "220px",
              padding: "12px",
              border: "1px solid #d1d5db",
              borderRadius: "8px",
              fontSize: "14px",
            }}
          />

          <input
            type="text"
            placeholder="Search by address..."
            value={addressSearch}
            onChange={(e) => setAddressSearch(e.target.value)}
            style={{
              flex: 1,
              minWidth: "220px",
              padding: "12px",
              border: "1px solid #d1d5db",
              borderRadius: "8px",
              fontSize: "14px",
            }}
          />

          <button
            type="submit"
            style={{
              padding: "12px 24px",
              background: "#2563eb",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "600",
            }}
          >
            Search
          </button>
        </form>

        {/* Messages */}
        {error && (
          <div
            style={{
              background: "#fee2e2",
              color: "#b91c1c",
              padding: "12px 16px",
              borderRadius: "8px",
              marginBottom: "20px",
            }}
          >
            {error}
          </div>
        )}

        {success && (
          <div
            style={{
              background: "#dcfce7",
              color: "#166534",
              padding: "12px 16px",
              borderRadius: "8px",
              marginBottom: "20px",
            }}
          >
            {success}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: "center", padding: "50px" }}>
            <h3>Loading stores...</h3>
          </div>
        )}

        {/* No stores */}
        {!loading && stores.length === 0 && (
          <div
            style={{
              background: "white",
              padding: "50px",
              textAlign: "center",
              borderRadius: "12px",
            }}
          >
            <h3>No stores found</h3>
            <p style={{ color: "#6b7280" }}>
              Try changing your search criteria.
            </p>
          </div>
        )}

        {/* Store cards */}
        {!loading && stores.length > 0 && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "20px",
            }}
          >
            {stores.map((store) => {
              const selectedRating =
                selectedRatings[store.id] || "";

              return (
                <div
                  key={store.id}
                  style={{
                    background: "white",
                    borderRadius: "14px",
                    padding: "24px",
                    boxShadow: "0 3px 12px rgba(0,0,0,0.07)",
                  }}
                >
                  <h2 style={{ marginTop: 0 }}>
                    {store.name}
                  </h2>

                  <p
                    style={{
                      color: "#6b7280",
                      marginBottom: "5px",
                    }}
                  >
                    📍 {store.address}
                  </p>

                  <p
                    style={{
                      color: "#6b7280",
                      marginTop: "5px",
                    }}
                  >
                    ✉️ {store.email}
                  </p>

                  <hr
                    style={{
                      border: "none",
                      borderTop: "1px solid #e5e7eb",
                      margin: "20px 0",
                    }}
                  />

                  {/* Average rating */}
                  <div>
                    <strong>Overall Rating</strong>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        marginTop: "5px",
                      }}
                    >
                      {renderStars(store.average_rating)}

                      <span>
                        {Number(store.average_rating).toFixed(1)}
                      </span>
                    </div>

                    <small style={{ color: "#6b7280" }}>
                      {store.total_ratings} rating
                      {Number(store.total_ratings) !== 1
                        ? "s"
                        : ""}
                    </small>
                  </div>

                  {/* User's existing rating */}
                  <div style={{ marginTop: "20px" }}>
                    <strong>Your Rating</strong>

                    {store.my_rating ? (
                      <div style={{ marginTop: "5px" }}>
                        {renderStars(store.my_rating)}
                        <span
                          style={{
                            marginLeft: "8px",
                            color: "#6b7280",
                          }}
                        >
                          {store.my_rating}/5
                        </span>
                      </div>
                    ) : (
                      <p
                        style={{
                          color: "#9ca3af",
                          margin: "5px 0",
                        }}
                      >
                        You haven't rated this store yet.
                      </p>
                    )}
                  </div>

                  {/* Rating selector */}
                  <div style={{ marginTop: "20px" }}>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "8px",
                        fontWeight: "600",
                      }}
                    >
                      Give your rating
                    </label>

                    <select
                      value={selectedRating}
                      onChange={(e) =>
                        handleRatingChange(
                          store.id,
                          e.target.value
                        )
                      }
                      style={{
                        width: "100%",
                        padding: "10px",
                        border: "1px solid #d1d5db",
                        borderRadius: "8px",
                        background: "white",
                      }}
                    >
                      <option value="">
                        Select rating
                      </option>
                      <option value="1">⭐ 1 - Poor</option>
                      <option value="2">⭐⭐ 2 - Fair</option>
                      <option value="3">⭐⭐⭐ 3 - Good</option>
                      <option value="4">⭐⭐⭐⭐ 4 - Very Good</option>
                      <option value="5">⭐⭐⭐⭐⭐ 5 - Excellent</option>
                    </select>

                    <button
                      onClick={() =>
                        handleSubmitRating(store.id)
                      }
                      disabled={submitting[store.id]}
                      style={{
                        width: "100%",
                        marginTop: "10px",
                        padding: "11px",
                        background: submitting[store.id]
                          ? "#9ca3af"
                          : "#2563eb",
                        color: "white",
                        border: "none",
                        borderRadius: "8px",
                        cursor: submitting[store.id]
                          ? "not-allowed"
                          : "pointer",
                        fontWeight: "600",
                      }}
                    >
                      {submitting[store.id]
                        ? "Submitting..."
                        : store.my_rating
                        ? "Update Rating"
                        : "Submit Rating"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

export default Stores;