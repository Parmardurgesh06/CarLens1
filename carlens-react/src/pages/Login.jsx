
import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

const API_URL = "http://127.0.0.1:5000";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    email: location.state?.registeredEmail || "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const email = formData.email.trim().toLowerCase();
    const password = formData.password;

    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }

    if (password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login failed.");
      }

      if (!data.token || !data.user) {
        throw new Error("Invalid response from the server.");
      }

      // Store the authentication token and basic user profile.
      // Never store the password.
      localStorage.setItem("carlensToken", data.token);
      localStorage.setItem(
        "carlensUser",
        JSON.stringify(data.user)
      );
      localStorage.setItem("carlensLoggedIn", "true");

      navigate("/dashboard");
    } catch (err) {
      setError(
        err.message === "Failed to fetch"
          ? "Cannot connect to Flask. Make sure the backend is running."
          : err.message
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <header className="navbar">
        <Link className="logo" to="/">
          <img src="/images/logo.png" alt="CarLens Logo" />
        </Link>

        <nav className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/predict">Predict</Link>
          <Link to="/compare">Compare</Link>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/login" className="active">Login</Link>
          <Link to="/register">Register</Link>
        </nav>
      </header>

      <main className="auth-page">
        <div className="auth-container">
          <div className="auth-card">
            <div className="auth-icon">WELCOME BACK</div>

            <p className="small-heading">Let's check your Credentials</p>

            <h1>
              Welcome back to<span> CarLens.</span>
            </h1>

            <p className="auth-description">
              Sign in to continue making smarter decisions
              when buying or selling a car.
            </p>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={handleChange}
                  minLength={8}
                  required
                />
              </div>

              {error && (
                <div className="auth-error" role="alert">
                  ⚠ {error}
                </div>
              )}

              <button
                type="submit"
                className="auth-submit-btn"
                disabled={loading}
              >
                {loading ? "Signing in..." : "Sign In →"}
              </button>
            </form>

            <div className="auth-switch">
              <span>Don't have an account?</span>
              <Link to="/register">Create account</Link>
            </div>
          </div>
        </div>

        <div className="auth-side">
          <p className="small-heading">WHY USE CARLENS?</p>

          <h2>
            Smarter decisions.<span> Better cars.</span>
          </h2>

          <p>
            Use CarLens to estimate used-car values, compare
            vehicles, and make more informed buying and selling
            decisions.
          </p>

          <div className="auth-features">
            <div>
              <strong>AI</strong>
              <span>Machine-learning valuation</span>
            </div>
            <div>
              <strong>⇄</strong>
              <span>Compare cars side by side</span>
            </div>
            <div>
              <strong>◷</strong>
              <span>Keep track of your valuations</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Login;
