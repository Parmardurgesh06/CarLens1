import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

const API_URL = "http://127.0.0.1:5000";

function Compare() {
  const [options, setOptions] = useState({
    cars: [],
    companies: [],
    years: [],
    fuel_types: [],
    cars_by_company: {},
  });

  const [cars, setCars] = useState([
    {
      name: "",
      company: "",
      year: "",
      kms_driven: "",
      fuel_type: "",
    },
    {
      name: "",
      company: "",
      year: "",
      kms_driven: "",
      fuel_type: "",
    },
  ]);

  const [predictions, setPredictions] = useState([
    null,
    null,
  ]);

  const [loadingOptions, setLoadingOptions] = useState(true);
  const [loadingPrediction, setLoadingPrediction] = useState(false);
  const [error, setError] = useState("");

  // =========================================================
  // LOAD OPTIONS FROM FLASK
  // =========================================================

  useEffect(() => {
    const loadOptions = async () => {
      try {
        setLoadingOptions(true);
        setError("");

        const response = await fetch(
          `${API_URL}/options`
        );

        if (!response.ok) {
          throw new Error(
            "Could not load car options."
          );
        }

        const data = await response.json();

        if (data.error) {
          throw new Error(data.error);
        }

        setOptions({
          cars: data.cars || [],
          companies: data.companies || [],
          years: data.years || [],
          fuel_types: data.fuel_types || [],
          cars_by_company:
            data.cars_by_company || {},
        });
      } catch (err) {
        console.error(
          "Options error:",
          err
        );

        setError(
          "Unable to load car options. Please make sure Flask is running."
        );
      } finally {
        setLoadingOptions(false);
      }
    };

    loadOptions();
  }, []);

  // =========================================================
  // GET MODELS FOR COMPANY
  // =========================================================

  const getFilteredCars = (company) => {
    if (!company) {
      return [];
    }

    return (
      options.cars_by_company[company] || []
    );
  };

  // =========================================================
  // HANDLE INPUT
  // =========================================================

  const handleChange = (index, event) => {
    const { name, value } = event.target;

    setCars((previous) => {
      const updated = [...previous];

      updated[index] = {
        ...updated[index],
        [name]: value,
      };

      return updated;
    });

    setPredictions((previous) => {
      const updated = [...previous];
      updated[index] = null;
      return updated;
    });

    setError("");
  };

  // =========================================================
  // HANDLE COMPANY CHANGE
  // =========================================================

  const handleCompanyChange = (
    index,
    event
  ) => {
    const company = event.target.value;

    setCars((previous) => {
      const updated = [...previous];

      updated[index] = {
        ...updated[index],
        company,
        name: "",
      };

      return updated;
    });

    setPredictions((previous) => {
      const updated = [...previous];
      updated[index] = null;
      return updated;
    });

    setError("");
  };

  // =========================================================
  // PREDICT BOTH CARS
  // =========================================================

  const handleCompare = async (event) => {
    event.preventDefault();

    setError("");
    setLoadingPrediction(true);
    setPredictions([null, null]);

    try {
      const results = await Promise.all(
        cars.map(async (car) => {
          const response = await fetch(
            `${API_URL}/predict`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({
                name: car.name,
                company: car.company,
                year: Number(car.year),
                kms_driven: Number(
                  car.kms_driven
                ),
                fuel_type: car.fuel_type,
              }),
            }
          );

          const data =
            await response.json();

          if (!response.ok) {
            throw new Error(
              data.error ||
                "Prediction failed."
            );
          }

          return data.prediction;
        })
      );

      setPredictions(results);
    } catch (err) {
      console.error(
        "Comparison error:",
        err
      );

      setError(
        err.message ||
          "Unable to calculate comparison."
      );
    } finally {
      setLoadingPrediction(false);
    }
  };

  // =========================================================
  // RESET
  // =========================================================

  const handleReset = () => {
    setCars([
      {
        name: "",
        company: "",
        year: "",
        kms_driven: "",
        fuel_type: "",
      },
      {
        name: "",
        company: "",
        year: "",
        kms_driven: "",
        fuel_type: "",
      },
    ]);

    setPredictions([null, null]);
    setError("");
  };

  // =========================================================
  // FORMAT PRICE
  // =========================================================

  const formatPrice = (price) => {
    return Math.round(price).toLocaleString(
      "en-IN"
    );
  };

  // =========================================================
  // DETERMINE HIGHER VALUE
  // =========================================================

  const winner = useMemo(() => {
    if (
      predictions[0] === null ||
      predictions[1] === null
    ) {
      return null;
    }

    if (
      predictions[0] >
      predictions[1]
    ) {
      return 0;
    }

    if (
      predictions[1] >
      predictions[0]
    ) {
      return 1;
    }

    return "equal";
  }, [predictions]);

  // =========================================================
  // PAGE
  // =========================================================

  return (
    <div className="compare-page">

      {/* =====================================================
          NAVBAR
      ===================================================== */}

      <header className="navbar">

        <Link className="logo" to="/">
          <img
            src="/images/logo.png"
            alt="CarLens Logo"
          />
        </Link>

        <nav className="nav-links">

          <Link to="/">
            Home
          </Link>

          <Link to="/predict">
            Predict
          </Link>

          <Link
            to="/compare"
            className="active"
          >
            Compare
          </Link>

          <Link to="/dashboard">
            Dashboard
          </Link>

          <Link to="/login">
            Login
          </Link>

          <Link to="/register">
            Register
          </Link>

        </nav>

      </header>

      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <section className="compare-header">

        <p className="small-heading">
          SMART CAR COMPARISON
        </p>

        <h1>
          Compare Cars.
          <span> Choose Smarter.</span>
        </h1>

        <p>
          Compare two vehicles using CarLens
          machine learning predictions and
          vehicle details.
        </p>

      </section>

      {/* =====================================================
          COMPARISON FORM
      ===================================================== */}

      <section className="compare-container">

        <form
          className="compare-form"
          onSubmit={handleCompare}
        >

          {/* =================================================
              CAR 1
          ================================================= */}

          <div className="compare-card">

            <div className="compare-card-top">

              <span className="car-number">
                01
              </span>

              <div>

                <p className="small-heading">
                  FIRST VEHICLE
                </p>

                <h2>
                  Car One
                </h2>

              </div>

            </div>

            {/* COMPANY */}

            <div className="form-group">

              <label>
                Company
              </label>

              <select
                value={cars[0].company}
                onChange={(event) =>
                  handleCompanyChange(
                    0,
                    event
                  )
                }
                required
                disabled={
                  loadingOptions
                }
              >

                <option value="">
                  {loadingOptions
                    ? "Loading..."
                    : "Select company"}
                </option>

                {options.companies.map(
                  (company) => (
                    <option
                      key={company}
                      value={company}
                    >
                      {company}
                    </option>
                  )
                )}

              </select>

            </div>

            {/* CAR MODEL */}

            <div className="form-group">

              <label>
                Car Name
              </label>

              <select
                name="name"
                value={cars[0].name}
                onChange={(event) =>
                  handleChange(
                    0,
                    event
                  )
                }
                required
                disabled={
                  loadingOptions ||
                  !cars[0].company
                }
              >

                <option value="">
                  {!cars[0].company
                    ? "Select company first"
                    : getFilteredCars(
                        cars[0].company
                      ).length === 0
                    ? "No car models available"
                    : "Select car"}
                </option>

                {getFilteredCars(
                  cars[0].company
                ).map((car) => (
                  <option
                    key={car}
                    value={car}
                  >
                    {car}
                  </option>
                ))}

              </select>

            </div>

            {/* YEAR + KMS */}

            <div className="form-row">

              <div className="form-group">

                <label>
                  Year
                </label>

                <select
                  name="year"
                  value={cars[0].year}
                  onChange={(event) =>
                    handleChange(
                      0,
                      event
                    )
                  }
                  required
                  disabled={
                    loadingOptions
                  }
                >

                  <option value="">
                    Select year
                  </option>

                  {options.years.map(
                    (year) => (
                      <option
                        key={year}
                        value={year}
                      >
                        {year}
                      </option>
                    )
                  )}

                </select>

              </div>

              <div className="form-group">

                <label>
                  Kilometres
                </label>

                <input
                  type="number"
                  name="kms_driven"
                  placeholder="e.g. 41000"
                  min="0"
                  value={
                    cars[0].kms_driven
                  }
                  onChange={(event) =>
                    handleChange(
                      0,
                      event
                    )
                  }
                  required
                />

              </div>

            </div>

            {/* FUEL */}

            <div className="form-group">

              <label>
                Fuel Type
              </label>

              <select
                name="fuel_type"
                value={
                  cars[0].fuel_type
                }
                onChange={(event) =>
                  handleChange(
                    0,
                    event
                  )
                }
                required
                disabled={
                  loadingOptions
                }
              >

                <option value="">
                  Select fuel type
                </option>

                {options.fuel_types.map(
                  (fuel) => (
                    <option
                      key={fuel}
                      value={fuel}
                    >
                      {fuel}
                    </option>
                  )
                )}

              </select>

            </div>

          </div>

          {/* =================================================
              VS
          ================================================= */}

          <div className="compare-vs">
            VS
          </div>

          {/* =================================================
              CAR 2
          ================================================= */}

          <div className="compare-card">

            <div className="compare-card-top">

              <span className="car-number">
                02
              </span>

              <div>

                <p className="small-heading">
                  SECOND VEHICLE
                </p>

                <h2>
                  Car Two
                </h2>

              </div>

            </div>

            {/* COMPANY */}

            <div className="form-group">

              <label>
                Company
              </label>

              <select
                value={cars[1].company}
                onChange={(event) =>
                  handleCompanyChange(
                    1,
                    event
                  )
                }
                required
                disabled={
                  loadingOptions
                }
              >

                <option value="">
                  {loadingOptions
                    ? "Loading..."
                    : "Select company"}
                </option>

                {options.companies.map(
                  (company) => (
                    <option
                      key={company}
                      value={company}
                    >
                      {company}
                    </option>
                  )
                )}

              </select>

            </div>

            {/* CAR MODEL */}

            <div className="form-group">

              <label>
                Car Name
              </label>

              <select
                name="name"
                value={cars[1].name}
                onChange={(event) =>
                  handleChange(
                    1,
                    event
                  )
                }
                required
                disabled={
                  loadingOptions ||
                  !cars[1].company
                }
              >

                <option value="">
                  {!cars[1].company
                    ? "Select company first"
                    : getFilteredCars(
                        cars[1].company
                      ).length === 0
                    ? "No car models available"
                    : "Select car"}
                </option>

                {getFilteredCars(
                  cars[1].company
                ).map((car) => (
                  <option
                    key={car}
                    value={car}
                  >
                    {car}
                  </option>
                ))}

              </select>

            </div>

            {/* YEAR + KMS */}

            <div className="form-row">

              <div className="form-group">

                <label>
                  Year
                </label>

                <select
                  name="year"
                  value={cars[1].year}
                  onChange={(event) =>
                    handleChange(
                      1,
                      event
                    )
                  }
                  required
                  disabled={
                    loadingOptions
                  }
                >

                  <option value="">
                    Select year
                  </option>

                  {options.years.map(
                    (year) => (
                      <option
                        key={year}
                        value={year}
                      >
                        {year}
                      </option>
                    )
                  )}

                </select>

              </div>

              <div className="form-group">

                <label>
                  Kilometres
                </label>

                <input
                  type="number"
                  name="kms_driven"
                  placeholder="e.g. 41000"
                  min="0"
                  value={
                    cars[1].kms_driven
                  }
                  onChange={(event) =>
                    handleChange(
                      1,
                      event
                    )
                  }
                  required
                />

              </div>

            </div>

            {/* FUEL */}

            <div className="form-group">

              <label>
                Fuel Type
              </label>

              <select
                name="fuel_type"
                value={
                  cars[1].fuel_type
                }
                onChange={(event) =>
                  handleChange(
                    1,
                    event
                  )
                }
                required
                disabled={
                  loadingOptions
                }
              >

                <option value="">
                  Select fuel type
                </option>

                {options.fuel_types.map(
                  (fuel) => (
                    <option
                      key={fuel}
                      value={fuel}
                    >
                      {fuel}
                    </option>
                  )
                )}

              </select>

            </div>

          </div>

          {/* ERROR */}

          {error && (
            <div className="prediction-error">
              ⚠ {error}
            </div>
          )}

          {/* BUTTONS */}

          <div className="compare-buttons">

            <button
              type="submit"
              className="predict-submit-btn"
              disabled={
                loadingOptions ||
                loadingPrediction
              }
            >
              {loadingPrediction
                ? "Comparing Cars..."
                : "Compare Cars →"}
            </button>

            <button
              type="button"
              className="predict-reset-btn"
              onClick={handleReset}
            >
              Reset
            </button>

          </div>

        </form>

      </section>

      {/* =====================================================
          RESULTS
      ===================================================== */}

      {predictions[0] !== null &&
        predictions[1] !== null && (

        <section className="compare-results">

          <div className="section-heading">

            <p>
              CARLENS ANALYSIS
            </p>

            <h2>
              Comparison
              <span> Results.</span>
            </h2>

          </div>

          <div className="comparison-result-grid">

            {/* CAR 1 RESULT */}

            <div
              className={`result-car-card ${
                winner === 0
                  ? "winner"
                  : ""
              }`}
            >

              {winner === 0 && (
                <div className="winner-badge">
                  HIGHER ESTIMATED VALUE
                </div>
              )}

              <p className="small-heading">
                {cars[0].company}
              </p>

              <h3>
                {cars[0].name}
              </h3>

              <div className="comparison-price">
                ₹{" "}
                {formatPrice(
                  predictions[0]
                )}
              </div>

              <div className="comparison-details">

                <div>
                  <span>
                    Year
                  </span>

                  <strong>
                    {cars[0].year}
                  </strong>
                </div>

                <div>
                  <span>
                    Kilometres
                  </span>

                  <strong>
                    {Number(
                      cars[0].kms_driven
                    ).toLocaleString(
                      "en-IN"
                    )}{" "}
                    km
                  </strong>
                </div>

                <div>
                  <span>
                    Fuel
                  </span>

                  <strong>
                    {cars[0].fuel_type}
                  </strong>
                </div>

              </div>

            </div>

            {/* CAR 2 RESULT */}

            <div
              className={`result-car-card ${
                winner === 1
                  ? "winner"
                  : ""
              }`}
            >

              {winner === 1 && (
                <div className="winner-badge">
                  HIGHER ESTIMATED VALUE
                </div>
              )}

              <p className="small-heading">
                {cars[1].company}
              </p>

              <h3>
                {cars[1].name}
              </h3>

              <div className="comparison-price">
                ₹{" "}
                {formatPrice(
                  predictions[1]
                )}
              </div>

              <div className="comparison-details">

                <div>
                  <span>
                    Year
                  </span>

                  <strong>
                    {cars[1].year}
                  </strong>
                </div>

                <div>
                  <span>
                    Kilometres
                  </span>

                  <strong>
                    {Number(
                      cars[1].kms_driven
                    ).toLocaleString(
                      "en-IN"
                    )}{" "}
                    km
                  </strong>
                </div>

                <div>
                  <span>
                    Fuel
                  </span>

                  <strong>
                    {cars[1].fuel_type}
                  </strong>
                </div>

              </div>

            </div>

          </div>

          {/* SUMMARY */}

          <div className="comparison-summary">

            <div className="summary-icon">
              AI
            </div>

            <div>

              <p className="small-heading">
                CARLENS VERDICT
              </p>

              <h3>

                {winner === "equal"
                  ? "Both cars have the same estimated value."
                  : winner === 0
                  ? `${cars[0].name} has the higher estimated market value.`
                  : `${cars[1].name} has the higher estimated market value.`}

              </h3>

              <p>
                The values shown are generated
                by the current CarLens machine
                learning model using the details
                you entered.
              </p>

            </div>

          </div>

        </section>
      )}

      {/* =====================================================
          BOTTOM CTA
      ===================================================== */}

      <section className="compare-cta">

        <p className="small-heading">
          WANT AN ESTIMATE?
        </p>

        <h2>
          Find the value of
          <span> your car.</span>
        </h2>

        <Link
          to="/predict"
          className="primary-btn"
        >
          Predict My Car →
        </Link>

      </section>

    </div>
  );
}

export default Compare;