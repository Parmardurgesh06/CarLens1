
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const API_URL = "http://127.0.0.1:5000";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    const name = formData.name.trim();
    const email = formData.email.trim().toLowerCase();
    const password = formData.password;
    const confirmPassword = formData.confirmPassword;

    if (!name || !email || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Registration failed.");
      }

      setSuccess("Account created successfully! Redirecting to login...");

      // Do not store passwords or pretend the user is logged in.
      setFormData({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
      });

      setTimeout(() => {
        navigate("/login", {
          state: { registeredEmail: email },
        });
      }, 1000);
    } catch (err) {
      setError(
        err.message === "Failed to fetch"
          ? "Cannot connect to the server. Make sure Flask is running."
          : err.message
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <header className="navbar">
        <Link className="logo" to="/">
          <img src="/images/logo.png" alt="CarLens Logo" />
        </Link>

        <nav className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/predict">Predict</Link>
          <Link to="/compare">Compare</Link>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/login">Login</Link>
          <Link to="/register" className="active">
            Register
          </Link>
        </nav>
      </header>

      <main className="auth-page">
        <div className="auth-container">
          <div className="auth-card">
            <div className="auth-icon">✦ CarLens</div>

            <p className="small-heading">CREATE ACCOUNT</p>

            <h1>Create your account</h1>

            <p className="auth-description">
              Join CarLens and start estimating
              your car's market value.
            </p>

            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="register-name">Full Name</label>
                <input
                  id="register-name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your name"
                  autoComplete="name"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="register-email">Email</label>
                <input
                  id="register-email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  autoComplete="email"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="register-password">Password</label>
                <input
                  id="register-password"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Minimum 8 characters"
                  autoComplete="new-password"
                  minLength={8}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="register-confirm-password">
                  Confirm Password
                </label>
                <input
                  id="register-confirm-password"
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  autoComplete="new-password"
                  required
                />
              </div>

              {error && (
                <div className="auth-error" role="alert">
                  {error}
                </div>
              )}

              {success && (
                <div className="auth-success" role="status">
                  {success}
                </div>
              )}

              <button
                type="submit"
                className="auth-submit-btn"
                disabled={loading}
              >
                {loading ? "Creating Account..." : "Create Account"}
              </button>
            </form>

            <div className="auth-switch">
              <span>Already have an account?</span>
              <Link to="/login">Login</Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Register;
