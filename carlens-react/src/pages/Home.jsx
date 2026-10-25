import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="home-page">

      {/* ================================
          NAVBAR
      ================================= */}

      <header className="navbar">

        <Link className="logo" to="/">
          <img
            src="/images/logo.png"
            alt="CarLens Logo"
          />
        </Link>

        <nav className="nav-links">

          <Link
            to="/"
            className="active"
          >
            Home
          </Link>

          <Link to="/predict">
            Predict
          </Link>

          <Link to="/compare">
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


      {/* ================================
          HERO
      ================================= */}

      <section className="hero">

        <div className="hero-content">

          <p className="small-heading">
            AI-POWERED CAR VALUATION
          </p>

          <h1>
            Know Your Car's
            <span> True Value.</span>
          </h1>

          <p className="hero-text">
            CarLens uses machine learning to estimate
            the market value of your car and help you
            make smarter buying and selling decisions.
          </p>

          <div className="hero-buttons">

            <Link
              to="/predict"
              className="primary-btn"
            >
              Predict Car Value →
            </Link>

            <Link
              to="/compare"
              className="secondary-btn"
            >
              Compare Cars
            </Link>

          </div>

          <div className="hero-stats">

            <div>
              <h3>
                AI
              </h3>

              <p>
                ML Powered
              </p>
            </div>

            <div>
              <h3>
                Fast
              </h3>

              <p>
                Instant Results
              </p>
            </div>

            <div>
              <h3>
                Smart
              </h3>

              <p>
                Data Driven
              </p>
            </div>

          </div>

        </div>


        {/* ================================
            HERO CAR
        ================================= */}

        <div className="hero-car">

          <div className="glow"></div>

          <div className="car-placeholder">

            <p>
              🚗
            </p>

            <span>
              AI Car Analysis
            </span>

          </div>

          <div className="price-card">
  <p>
    AI CAR ANALYSIS
  </p>

  <h2>
    ML Powered
  </h2>

  <span>
    Data-Driven Prediction
  </span>
</div>
        </div>

      </section>


      {/* ================================
          FEATURES
      ================================= */}

      <section
        className="features-section"
        id="features"
      >

        <div className="section-heading">

          <p>
            WHY CARLENS
          </p>

          <h2>
            Smarter insights for
            <span> better decisions.</span>
          </h2>

        </div>


        <div className="features">

          <div className="feature-card">

            <div className="feature-icon">
              AI
            </div>

            <h3>
              AI Prediction
            </h3>

            <p>
              Get an estimated car value using
              machine learning based analysis.
            </p>

          </div>


          <div className="feature-card">

            <div className="feature-icon">
              ⇄
            </div>

            <h3>
              Compare Cars
            </h3>

            <p>
              Compare different vehicles and
              understand their estimated values.
            </p>

          </div>


          <div className="feature-card">

            <div className="feature-icon">
              ◷
            </div>

            <h3>
              Prediction History
            </h3>

            <p>
              Keep track of your previous car
              valuation predictions.
            </p>

          </div>


          <div className="feature-card">

            <div className="feature-icon">
              ★
            </div>

            <h3>
              Smart Decisions
            </h3>

            <p>
              Make more informed decisions when
              buying and selling a used car.
            </p>

          </div>

        </div>

      </section>


      {/* ================================
          HOW IT WORKS
      ================================= */}

      <section className="how-section">

        <div className="section-heading">

          <p>
            HOW IT WORKS
          </p>

          <h2>
            Value your car in
            <span> three steps.</span>
          </h2>

        </div>


        <div className="steps">

          <div className="step">

            <span>
              01
            </span>

            <h3>
              Enter Car Details
            </h3>

            <p>
              Enter information such as car name,
              company, year, kilometres and fuel type.
            </p>

          </div>


          <div className="step">

            <span>
              02
            </span>

            <h3>
              AI Analysis
            </h3>

            <p>
              CarLens processes your information
              using its trained machine learning model.
            </p>

          </div>


          <div className="step">

            <span>
              03
            </span>

            <h3>
              Get Your Value
            </h3>

            <p>
              Receive an estimated market value
              for your vehicle.
            </p>

          </div>

        </div>

      </section>


      {/* ================================
          ABOUT
      ================================= */}

      <section
        className="about-section"
        id="about"
      >

        <div className="about-content">

          <div className="about-text">

            <p className="small-heading">
              ABOUT CARLENS
            </p>

            <h2>
              Turning car data into
              <span> smarter decisions.</span>
            </h2>

            <p className="about-description">
              CarLens is a machine-learning based
              car valuation platform designed to help
              users understand the estimated market
              value of used vehicles.
            </p>

            <p className="about-description">
              Instead of relying only on guesswork,
              CarLens analyses vehicle characteristics
              and provides a data-driven valuation.
            </p>

            <div className="about-points">

              <div className="about-point">

                <div className="about-point-icon">
                  AI
                </div>

                <div>
                  <h3>
                    Machine Learning
                  </h3>

                  <p>
                    Use data-driven predictions to
                    estimate vehicle value.
                  </p>
                </div>

              </div>


              <div className="about-point">

                <div className="about-point-icon">
                  ⇄
                </div>

                <div>
                  <h3>
                    Smart Comparison
                  </h3>

                  <p>
                    Compare vehicles before making
                    your buying decision.
                  </p>
                </div>

              </div>

            </div>

          </div>


          <div className="about-visual">

            <div className="about-glow"></div>

            <div className="about-main-card">

              <div className="about-card-icon">
                🚗
              </div>

              <p>
                CARLENS INTELLIGENCE
              </p>

              <h3>
                Data Meets Decisions
              </h3>

              <span>
                Machine learning powered insights
                for smarter vehicle decisions.
              </span>

            </div>

            <div className="about-floating-card about-card-top">

              <span>
                AI
              </span>

              <div>
                <small>
                  MODEL
                </small>

                <strong>
                  ML Powered
                </strong>
              </div>

            </div>

            <div className="about-floating-card about-card-bottom">

              <span>
                ★
              </span>

              <div>
                <small>
                  INSIGHT
                </small>

                <strong>
                  Data Driven
                </strong>
              </div>

            </div>

          </div>

        </div>

      </section>


      {/* ================================
          CONTACT
      ================================= */}

      <section
        className="contact-section"
        id="contact"
      >

        <div className="contact-heading">

          <p className="small-heading">
            CONTACT
          </p>

          <h2>
            Have questions about
            <span> CarLens?</span>
          </h2>

          <p>
            We'd love to hear from you.
          </p>

        </div>


        <div className="contact-content">

          <div className="contact-info">

            <div className="contact-info-card">

              <div className="contact-icon">
                ✉
              </div>

              <div>

                <p>
                  EMAIL
                </p>

                <h3>
                  support@carlens.com
                </h3>

              </div>

            </div>


            <div className="contact-info-card">

              <div className="contact-icon">
                AI
              </div>

              <div>

                <p>
                  SUPPORT
                </p>

                <h3>
                  CarLens Intelligence
                </h3>

              </div>

            </div>

          </div>


          <div className="contact-form-box">

            <h3>
              Get in touch
            </h3>

            <p>
              Have a question or suggestion?
              Send us a message.
            </p>

            <div className="contact-input-row">

              <div className="contact-input-group">

                <label>
                  Name
                </label>

                <input
                  type="text"
                  placeholder="Your name"
                />

              </div>


              <div className="contact-input-group">

                <label>
                  Email
                </label>

                <input
                  type="email"
                  placeholder="you@example.com"
                />

              </div>

            </div>


            <div className="contact-input-group">

              <label>
                Message
              </label>

              <textarea
                rows="5"
                placeholder="Write your message..."
              ></textarea>

            </div>


            <button
              type="button"
              className="contact-submit-btn"
            >
              Send Message →
            </button>

          </div>

        </div>

      </section>


      {/* ================================
          CTA
      ================================= */}

      <section className="cta-section">

        <p className="small-heading">
          START YOUR ANALYSIS
        </p>

        <h2>
          Find your car's
          <span> true value.</span>
        </h2>

        <p>
          Let CarLens help you make a smarter
          vehicle decision.
        </p>

        <Link
          to="/predict"
          className="primary-btn"
        >
          Predict My Car →
        </Link>

      </section>


      {/* ================================
          FOOTER
      ================================= */}

      <footer>

        <div className="footer-logo">
          CarLens
        </div>

        <p>
          Smarter car valuation with
          machine learning.
        </p>

        <div className="footer-links">

          <Link to="/">
            Home
          </Link>

          <Link to="/predict">
            Predict
          </Link>

          <Link to="/compare">
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

        </div>

        <p className="copyright">
          © 2026 CarLens. All rights reserved.
        </p>

      </footer>

    </div>
  );
}

export default Home;