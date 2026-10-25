
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const API_URL = "http://127.0.0.1:5000";

function Predict() {
  const navigate = useNavigate();

  const [options, setOptions] = useState({
    cars: [],
    companies: [],
    years: [],
    fuel_types: [],
    cars_by_company: {},
  });

  const [formData, setFormData] = useState({
    company: "",
    name: "",
    year: "",
    kms_driven: "",
    fuel_type: "",
  });

  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [predicting, setPredicting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // LOAD OPTIONS FROM FLASK
  useEffect(() => {
    const loadOptions = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`${API_URL}/options`);
        const data = await response.json();

        if (!response.ok || data.error) {
          throw new Error(data.error || "Could not load car options.");
        }

        setOptions({
          cars: data.cars || [],
          companies: data.companies || [],
          years: data.years || [],
          fuel_types: data.fuel_types || [],
          cars_by_company: data.cars_by_company || {},
        });
      } catch (err) {
        console.error("Options error:", err);
        setError(
          "Unable to connect to CarLens. Make sure Flask is running."
        );
      } finally {
        setLoading(false);
      }
    };

    loadOptions();
  }, []);

  // FILTER MODELS BY COMPANY
  const filteredCars = useMemo(() => {
    if (!formData.company) return [];
    return options.cars_by_company[formData.company] || [];
  }, [formData.company, options.cars_by_company]);

  // HANDLE COMPANY CHANGE
  const handleCompanyChange = (event) => {
    setFormData((previous) => ({
      ...previous,
      company: event.target.value,
      name: "",
    }));

    setPrediction(null);
    setError("");
    setSuccess("");
  };

  // HANDLE INPUT CHANGE
  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setPrediction(null);
    setError("");
    setSuccess("");
  };

  // PREDICT AND SAVE TO MYSQL THROUGH FLASK
  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");
    setPrediction(null);

    const token = localStorage.getItem("carlensToken");

    if (!token) {
      setError("Please log in before making a saved prediction.");
      return;
    }

    if (
      !formData.company ||
      !formData.name ||
      !formData.year ||
      formData.kms_driven === "" ||
      !formData.fuel_type
    ) {
      setError("Please fill in all car details.");
      return;
    }

    if (
      !Number.isFinite(Number(formData.kms_driven)) ||
      Number(formData.kms_driven) < 0
    ) {
      setError("Please enter valid kilometres driven.");
      return;
    }

    setPredicting(true);

    try {
      const response = await fetch(`${API_URL}/predict`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name,
          company: formData.company,
          year: Number(formData.year),
          kms_driven: Number(formData.kms_driven),
          fuel_type: formData.fuel_type,
        }),
      });

      const data = await response.json();

      if (response.status === 401) {
        localStorage.removeItem("carlensToken");
        localStorage.removeItem("carlensUser");
        localStorage.removeItem("carlensLoggedIn");

        navigate("/login");
        return;
      }

      if (!response.ok) {
        throw new Error(data.error || "Prediction failed.");
      }

      setPrediction(data);

      if (data.saved_to_database) {
        setSuccess("Prediction calculated and saved to your account.");
      } else {
        setError(
          "The prediction was returned, but database storage was not confirmed."
        );
      }
    } catch (err) {
      console.error("Prediction error:", err);
      setError(
        err.message === "Failed to fetch"
          ? "Cannot connect to Flask. Check that the backend is running."
          : err.message || "Unable to calculate the estimated price."
      );
    } finally {
      setPredicting(false);
    }
  };

  // RESET
  const handleReset = () => {
    setFormData({
      company: "",
      name: "",
      year: "",
      kms_driven: "",
      fuel_type: "",
    });

    setPrediction(null);
    setError("");
    setSuccess("");
  };

  // FORMAT PRICE
  const formatPrice = (price) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);

  return (
    <div className="predict-page">
      <header className="navbar">
        <Link className="logo" to="/">
          <img src="/images/logo.png" alt="CarLens Logo" />
        </Link>

        <nav className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/predict" className="active">Predict</Link>
          <Link to="/compare">Compare</Link>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
        </nav>
      </header>

      <section className="predict-section">
        <div className="predict-header">
          <p className="small-heading">AI-POWERED CAR VALUATION</p>
          <h1>
            Predict Your Car's <span>True Value</span>
          </h1>
          <p>
            Enter your car details and let CarLens estimate its
            market value using machine learning.
          </p>
        </div>

        <div className="predict-container">
          <div className="predict-form-card">
            <div className="form-card-header">
              <h2>Car Details</h2>
              <p>Enter the details of the car you want to evaluate.</p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="company">Company</label>
                <select
                  id="company"
                  value={formData.company}
                  onChange={handleCompanyChange}
                  disabled={loading}
                  required
                >
                  <option value="">
                    {loading ? "Loading..." : "Select company"}
                  </option>
                  {options.companies.map((company) => (
                    <option key={company} value={company}>
                      {company}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="name">Car Model</label>
                <select
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={loading || !formData.company}
                  required
                >
                  <option value="">
                    {!formData.company
                      ? "Select company first"
                      : filteredCars.length === 0
                      ? "No car models available"
                      : "Select car model"}
                  </option>
                  {filteredCars.map((car) => (
                    <option key={car} value={car}>
                      {car}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="year">Manufacturing Year</label>
                <select
                  id="year"
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  disabled={loading}
                  required
                >
                  <option value="">Select manufacturing year</option>
                  {options.years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="kms_driven">Kilometres Driven</label>
                <input
                  id="kms_driven"
                  type="number"
                  name="kms_driven"
                  value={formData.kms_driven}
                  onChange={handleChange}
                  placeholder="e.g. 41000"
                  min="0"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="fuel_type">Fuel Type</label>
                <select
                  id="fuel_type"
                  name="fuel_type"
                  value={formData.fuel_type}
                  onChange={handleChange}
                  disabled={loading}
                  required
                >
                  <option value="">Select fuel type</option>
                  {options.fuel_types.map((fuel) => (
                    <option key={fuel} value={fuel}>
                      {fuel}
                    </option>
                  ))}
                </select>
              </div>

              {error && (
                <div className="error-message" role="alert">
                  {error}
                </div>
              )}

              {success && (
                <div className="auth-success" role="status">
                  {success}
                </div>
              )}

              <div className="predict-buttons">
                <button
                  type="submit"
                  className="predict-btn"
                  disabled={predicting || loading}
                >
                  {predicting ? "Calculating..." : "Predict Price"}
                </button>

                <button
                  type="button"
                  className="reset-btn"
                  onClick={handleReset}
                >
                  Reset
                </button>
              </div>
            </form>
          </div>

          <div className="prediction-result-card">
            {!prediction ? (
              <div className="empty-result">
                <div className="result-icon">🚗</div>
                <h2>
                  {formData.name
                    ? "Ready to Predict"
                    : "Your Car Valuation"}
                </h2>
                <p>
                  {formData.name
                    ? "Complete the details and click "
                    : "Select a car and enter its details to "}
                  <strong>Predict Price</strong>{" "}
                  to see the estimated value.
                </p>
              </div>
            ) : (
              <div className="result-content">
                <p className="result-label">ESTIMATED MARKET VALUE</p>
                <h2 className="result-price">
                  {formatPrice(prediction.prediction)}
                </h2>
                <p className="result-car">
                  {prediction.car.company} {prediction.car.name}
                </p>

                <div className="result-details">
                  <div>
                    <span>Year</span>
                    <strong>{prediction.car.year}</strong>
                  </div>
                  <div>
                    <span>Kilometres</span>
                    <strong>
                      {Number(prediction.car.kms_driven).toLocaleString("en-IN")}
                    </strong>
                  </div>
                  <div>
                    <span>Fuel</span>
                    <strong>{prediction.car.fuel_type}</strong>
                  </div>
                </div>

                <div className="result-note">
                  This estimate is generated using the CarLens machine
                  learning model. Actual market prices may vary.
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="predict-cta">
          <div>
            <h2>Want to compare two cars?</h2>
            <p>Compare their estimated market values side by side.</p>
          </div>
          <Link to="/compare" className="cta-button">
            Compare Cars
          </Link>
        </div>
      </section>
    </div>
  );
}

export default Predict;
