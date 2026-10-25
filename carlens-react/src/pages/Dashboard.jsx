
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const API_URL = "http://127.0.0.1:5000";

function Dashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadDashboard = async () => {
      const token = localStorage.getItem("carlensToken");

      if (!token) {
        navigate("/login", { replace: true });
        return;
      }

      try {
        setLoading(true);
        setError("");

        const savedUser = JSON.parse(
          localStorage.getItem("carlensUser") || "null"
        );

        setUser(savedUser);

        const response = await fetch(`${API_URL}/history`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (response.status === 401) {
          localStorage.removeItem("carlensToken");
          localStorage.removeItem("carlensUser");
          localStorage.removeItem("carlensLoggedIn");

          navigate("/login", { replace: true });
          return;
        }

        if (!response.ok) {
          throw new Error(
            data.error || "Unable to load prediction history."
          );
        }

        const history = (data.predictions || []).map((item) => ({
          id: item.id,
          name: item.car_name,
          company: item.company,
          year: item.model_year,
          kms_driven: item.kms_driven,
          fuel_type: item.fuel_type,
          prediction: item.predicted_price,
          date: item.created_at,
        }));

        if (!cancelled) {
          setPredictions(history);
        }
      } catch (err) {
        console.error("Dashboard error:", err);

        if (!cancelled) {
          setError(
            err.message === "Failed to fetch"
              ? "Cannot connect to Flask. Make sure the backend is running."
              : err.message || "Unable to load your dashboard."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadDashboard();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  const handleSignOut = () => {
    localStorage.removeItem("carlensToken");
    localStorage.removeItem("carlensUser");
    localStorage.removeItem("carlensLoggedIn");
    navigate("/login", { replace: true });
  };

  const getDisplayName = () => {
    if (!user) return "CarLens User";

    const savedName = String(user.name || "").trim();
    if (savedName.length > 1) return savedName;

    const emailName = String(user.email || "")
      .split("@")[0]
      .replace(/[._-]+/g, " ")
      .trim();

    if (emailName) {
      return emailName
        .split(" ")
        .map(
          (word) => word.charAt(0).toUpperCase() + word.slice(1)
        )
        .join(" ");
    }

    return "CarLens User";
  };

  const displayName = getDisplayName();
  const totalPredictions = predictions.length;

  const averageValue =
    totalPredictions > 0
      ? predictions.reduce(
          (sum, item) => sum + Number(item.prediction || 0),
          0
        ) / totalPredictions
      : 0;

  const highestValue =
    totalPredictions > 0
      ? Math.max(
          ...predictions.map((item) => Number(item.prediction || 0))
        )
      : 0;

  const recentPredictions = predictions.slice(0, 6);

  const formatPrice = (price) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price || 0);

  return (
    <div className="dashboard-page">
      <header className="navbar">
        <Link className="logo" to="/">
          <img src="/images/logo.png" alt="CarLens Logo" />
        </Link>

        <nav className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/predict">Predict</Link>
          <Link to="/compare">Compare</Link>
          <Link to="/dashboard" className="active">Dashboard</Link>
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
        </nav>
      </header>

      <main className="dashboard">
        <div className="dashboard-container">
          <section className="dashboard-welcome">
            <div>
              <p className="small-heading">CARLENS DASHBOARD</p>
              <h1>Welcome back, {displayName}</h1>
              <p>
                Track your car valuations and manage your CarLens activity.
              </p>
            </div>

            <Link to="/predict" className="dashboard-primary-btn">
              Predict Car Value
            </Link>
          </section>

          {error && (
            <div className="error-message" role="alert">
              {error}
            </div>
          )}

          <section className="dashboard-stats">
            <div className="dashboard-stat-card">
              <div className="dashboard-stat-icon">TOTAL</div>
              <div>
                <span>Total Predictions</span>
                <strong>{loading ? "..." : totalPredictions}</strong>
              </div>
            </div>

            <div className="dashboard-stat-card">
              <div className="dashboard-stat-icon">AVG</div>
              <div>
                <span>Average Value</span>
                <strong>
                  {loading ? "..." : formatPrice(averageValue)}
                </strong>
              </div>
            </div>

            <div className="dashboard-stat-card">
              <div className="dashboard-stat-icon">MAX</div>
              <div>
                <span>Highest Valuation</span>
                <strong>
                  {loading ? "..." : formatPrice(highestValue)}
                </strong>
              </div>
            </div>
          </section>

          <section className="dashboard-grid">
            <div className="dashboard-history">
              <div className="dashboard-section-header">
                <div>
                  <p className="small-heading">ACTIVITY</p>
                  <h2>Recent Predictions</h2>
                </div>
                <Link to="/predict">New Prediction</Link>
              </div>

              {loading ? (
                <div className="empty-result">
                  <h2>Loading predictions...</h2>
                </div>
              ) : recentPredictions.length === 0 ? (
                <div className="empty-result">
                  <div className="result-icon">🚗</div>
                  <h2>No predictions yet</h2>
                  <p>
                    Make your first car valuation to see it here.
                  </p>
                  <Link to="/predict" className="dashboard-primary-btn">
                    Make a Prediction
                  </Link>
                </div>
              ) : (
                recentPredictions.map((item) => (
                  <div className="prediction-history-card" key={item.id}>
                    <div className="history-car">
                      <div className="history-car-icon">🚗</div>

                      <div className="history-car-info">
                        <strong>{item.name}</strong>
                        <span>
                          {item.company} • {item.year} • {item.fuel_type}
                        </span>
                        <span>
                          {Number(item.kms_driven || 0).toLocaleString("en-IN")} km
                        </span>
                        {item.date && (
                          <span>
                            {new Date(item.date).toLocaleString("en-IN")}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="history-price">
                      <span>Estimated Value</span>
                      <strong>
                        {formatPrice(Number(item.prediction || 0))}
                      </strong>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="dashboard-actions">
              <div className="dashboard-section-header">
                <div>
                  <p className="small-heading">QUICK ACTIONS</p>
                  <h2>Get Started</h2>
                </div>
              </div>

              <div className="quick-action-list">
                <Link to="/predict" className="quick-action-card">
                  <div className="quick-action-icon">AI</div>
                  <div className="quick-action-content">
                    <strong>Predict Car Value</strong>
                    <span>Get an ML-powered estimate</span>
                  </div>
                  <b className="quick-action-arrow">→</b>
                </Link>

                <Link to="/compare" className="quick-action-card">
                  <div className="quick-action-icon">⇄</div>
                  <div className="quick-action-content">
                    <strong>Compare Cars</strong>
                    <span>Compare two vehicles</span>
                  </div>
                  <b className="quick-action-arrow">→</b>
                </Link>
              </div>

              <div className="dashboard-account">
                <div className="dashboard-section-header">
                  <div>
                    <p className="small-heading">ACCOUNT</p>
                    <h2>Your Profile</h2>
                  </div>
                </div>

                <div className="account-info" style={{ display: "block", width: "100%" }}>
                  <div
                    className="account-details"
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "6px",
                      width: "100%",
                    }}
                  >
                    <strong
                      style={{
                        display: "block",
                        color: "#f5f7fb",
                        fontSize: "16px",
                        fontWeight: "600",
                        lineHeight: "1.4",
                      }}
                    >
                      {displayName}
                    </strong>
                    <span
                      style={{
                        display: "block",
                        color: "#68758b",
                        fontSize: "12px",
                        lineHeight: "1.4",
                      }}
                    >
                      {user?.email || "No email available"}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  className="dashboard-logout-btn"
                  onClick={handleSignOut}
                >
                  Sign Out
                </button>
              </div>
            </div>
          </section>

          <section className="dashboard-cta">
            <div>
              <h2>
                Ready to value your <span>next car?</span>
              </h2>
              <p>
                Use CarLens machine learning to estimate the market value.
              </p>
            </div>

            <Link to="/predict" className="dashboard-primary-btn">
              Start Prediction
            </Link>
          </section>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
