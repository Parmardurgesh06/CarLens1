
from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import joblib
import os
import pymysql
import secrets
import hashlib
import hmac
import re
from dotenv import load_dotenv
from flask_bcrypt import Bcrypt

# =========================================================
# CONFIGURATION — DEFINE BASE_DIR BEFORE USING IT
# =========================================================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(BASE_DIR, ".env"))

app = Flask(__name__)
CORS(app)
bcrypt = Bcrypt(app)

DATA_PATH = os.path.join(BASE_DIR, "Cars24_Used_Cars_Clean_Data.xls")
MODEL_PATH = os.path.join(BASE_DIR, "linear.pkl")

# Set a long, random CARLENS_SECRET_KEY in .env for production.
app.config["SECRET_KEY"] = os.getenv(
    "CARLENS_SECRET_KEY",
    secrets.token_hex(32)
)

# =========================================================
# MYSQL CONNECTION
# =========================================================

def get_db_connection():
    return pymysql.connect(
        host=os.getenv("CARLENS_DB_HOST", "127.0.0.1"),
        port=int(os.getenv("CARLENS_DB_PORT", "3306")),
        user=os.getenv("CARLENS_DB_USER", "root"),
        password=os.getenv("CARLENS_DB_PASSWORD", ""),
        database=os.getenv("CARLENS_DB_NAME", "carlens_db"),
        cursorclass=pymysql.cursors.DictCursor,
        autocommit=False
    )


def initialize_database():
    connection = get_db_connection()
    try:
        with connection.cursor() as cursor:
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS users (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    name VARCHAR(100) NOT NULL,
                    email VARCHAR(255) NOT NULL UNIQUE,
                    password_hash VARCHAR(255) NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS prediction_history (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    user_id INT NULL,
                    car_name VARCHAR(150) NOT NULL,
                    company VARCHAR(100) NOT NULL,
                    model_year INT NOT NULL,
                    kms_driven DECIMAL(12, 2) NOT NULL,
                    fuel_type VARCHAR(50) NOT NULL,
                    predicted_price DECIMAL(15, 2) NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    INDEX idx_prediction_user (user_id),
                    CONSTRAINT fk_prediction_user
                        FOREIGN KEY (user_id) REFERENCES users(id)
                        ON DELETE SET NULL
                )
            """)
        connection.commit()
    except Exception:
        connection.rollback()
        raise
    finally:
        connection.close()


# =========================================================
# SIMPLE SIGNED LOGIN TOKENS
# =========================================================

def make_token(user_id):
    secret = app.config["SECRET_KEY"].encode()
    payload = str(user_id)
    signature = hmac.new(
        secret, payload.encode(), hashlib.sha256
    ).hexdigest()
    return f"{payload}.{signature}"


def get_token_user_id():
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        return None

    token = auth_header[7:].strip()
    try:
        user_id_text, signature = token.split(".", 1)
        expected = hmac.new(
            app.config["SECRET_KEY"].encode(),
            user_id_text.encode(),
            hashlib.sha256
        ).hexdigest()

        if not hmac.compare_digest(signature, expected):
            return None

        user_id = int(user_id_text)
        connection = get_db_connection()
        try:
            with connection.cursor() as cursor:
                cursor.execute(
                    "SELECT id FROM users WHERE id = %s",
                    (user_id,)
                )
                return user_id if cursor.fetchone() else None
        finally:
            connection.close()
    except (ValueError, TypeError):
        return None


# =========================================================
# LOAD DATASET
# =========================================================

try:
    df = pd.read_csv(DATA_PATH)
    df.columns = df.columns.str.strip()

    for column in ["Brand", "Variant", "Fuel_Type"]:
        if column in df.columns:
            df[column] = df[column].astype(str).str.strip()

    df["Model Year"] = pd.to_numeric(
        df["Model Year"], errors="coerce"
    )
    df["Kilometer"] = pd.to_numeric(
        df["Kilometer"], errors="coerce"
    )
    df["Final_Price"] = pd.to_numeric(
        df["Final_Price"], errors="coerce"
    )

    df = df.dropna(subset=[
        "Brand", "Variant", "Model Year",
        "Kilometer", "Fuel_Type", "Final_Price"
    ])

    print("Dataset loaded successfully. Rows:", len(df))
except Exception as e:
    print("ERROR loading dataset:", e)
    df = pd.DataFrame()


# =========================================================
# LOAD MODEL
# =========================================================

try:
    model = joblib.load(MODEL_PATH)
    print("Model loaded successfully.")
except Exception as e:
    print("ERROR loading model:", e)
    model = None


# =========================================================
# HOME AND DATABASE TEST
# =========================================================

@app.route("/")
def home():
    return jsonify({"message": "CarLens API is running"})


@app.route("/db-test", methods=["GET"])
def db_test():
    try:
        connection = get_db_connection()
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT DATABASE() AS db_name")
                result = cursor.fetchone()
            return jsonify({
                "message": "Database connected successfully",
                "database": result["db_name"]
            })
        finally:
            connection.close()
    except Exception:
        app.logger.exception("Database connection failed")
        return jsonify({
            "error": "Database connection failed. Check local configuration."
        }), 500


# =========================================================
# REGISTER
# =========================================================

@app.route("/register", methods=["POST"])
def register():
    data = request.get_json(silent=True) or {}
    name = str(data.get("name", "")).strip()
    email = str(data.get("email", "")).strip().lower()
    password = data.get("password", "")

    if not name or len(name) > 100:
        return jsonify({"error": "Enter a valid name."}), 400
    if not re.fullmatch(r"[^@\s]+@[^@\s]+\.[^@\s]+", email) or len(email) > 255:
        return jsonify({"error": "Enter a valid email address."}), 400
    if not isinstance(password, str) or len(password) < 8:
        return jsonify({"error": "Password must contain at least 8 characters."}), 400

    password_hash = bcrypt.generate_password_hash(password).decode("utf-8")
    connection = get_db_connection()
    try:
        with connection.cursor() as cursor:
            cursor.execute(
                "INSERT INTO users (name, email, password_hash) VALUES (%s, %s, %s)",
                (name, email, password_hash)
            )
            user_id = cursor.lastrowid
        connection.commit()
        return jsonify({
            "message": "Registration successful",
            "user": {"id": user_id, "name": name, "email": email}
        }), 201
    except pymysql.err.IntegrityError:
        connection.rollback()
        return jsonify({"error": "An account with this email already exists."}), 409
    except Exception:
        connection.rollback()
        app.logger.exception("Registration failed")
        return jsonify({"error": "Registration failed."}), 500
    finally:
        connection.close()


# =========================================================
# LOGIN
# =========================================================

@app.route("/login", methods=["POST"])
def login():
    data = request.get_json(silent=True) or {}
    email = str(data.get("email", "")).strip().lower()
    password = data.get("password", "")

    if not email or not isinstance(password, str):
        return jsonify({"error": "Email and password are required."}), 400

    connection = get_db_connection()
    try:
        with connection.cursor() as cursor:
            cursor.execute(
                "SELECT id, name, email, password_hash FROM users WHERE email = %s",
                (email,)
            )
            user = cursor.fetchone()
    finally:
        connection.close()

    if not user or not bcrypt.check_password_hash(
        user["password_hash"], password
    ):
        return jsonify({"error": "Invalid email or password."}), 401

    return jsonify({
        "message": "Login successful",
        "token": make_token(user["id"]),
        "user": {
            "id": user["id"],
            "name": user["name"],
            "email": user["email"]
        }
    })


# =========================================================
# OPTIONS
# =========================================================

@app.route("/options", methods=["GET"])
def options():
    if df.empty:
        return jsonify({"error": "Dataset could not be loaded."}), 500

    companies = sorted(df["Brand"].dropna().astype(str).str.strip().unique().tolist())
    cars = sorted(df["Variant"].dropna().astype(str).str.strip().unique().tolist())
    years = sorted(df["Model Year"].dropna().astype(int).unique().tolist())
    fuel_types = sorted(df["Fuel_Type"].dropna().astype(str).str.strip().unique().tolist())

    cars_by_company = {}
    for company in companies:
        company_cars = df.loc[
            df["Brand"] == company, "Variant"
        ].dropna().astype(str).str.strip().unique().tolist()
        cars_by_company[company] = sorted(company_cars)

    return jsonify({
        "companies": companies,
        "cars": cars,
        "years": years,
        "fuel_types": fuel_types,
        "cars_by_company": cars_by_company
    })


# =========================================================
# PREDICT AND SAVE HISTORY
# =========================================================

@app.route("/predict", methods=["POST"])
def predict():
    if model is None:
        return jsonify({"error": "ML model could not be loaded."}), 500
    if df.empty:
        return jsonify({"error": "Dataset could not be loaded."}), 500

    try:
        data = request.get_json(silent=True) or {}

        name = str(data.get("name", "")).strip()
        company = str(data.get("company", "")).strip()
        fuel_type = str(data.get("fuel_type", "")).strip()
        year = int(data.get("year"))
        kms_driven = float(data.get("kms_driven"))

        if not name or not company or not fuel_type:
            return jsonify({"error": "Car model, company and fuel type are required."}), 400
        if kms_driven < 0:
            return jsonify({"error": "Kilometres driven cannot be negative."}), 400

        min_year = int(df["Model Year"].min())
        max_year = int(df["Model Year"].max())
        if year < min_year or year > max_year:
            return jsonify({
                "error": f"Manufacturing year must be between {min_year} and {max_year}."
            }), 400

        valid_companies = df["Brand"].astype(str).str.strip().unique().tolist()
        valid_models = df["Variant"].astype(str).str.strip().unique().tolist()
        valid_fuel_types = df["Fuel_Type"].astype(str).str.strip().unique().tolist()

        if company not in valid_companies:
            return jsonify({"error": f"{company} is not available in the dataset."}), 400
        if name not in valid_models:
            return jsonify({"error": f"{name} is not available in the dataset."}), 400
        if fuel_type not in valid_fuel_types:
            return jsonify({"error": f"{fuel_type} is not available in the dataset."}), 400

        company_model_exists = (
            (df["Brand"].astype(str).str.strip() == company) &
            (df["Variant"].astype(str).str.strip() == name)
        ).any()

        if not company_model_exists:
            return jsonify({
                "error": f"{name} does not belong to {company} in the dataset."
            }), 400

        input_data = pd.DataFrame([{
            "name": name,
            "company": company,
            "year": year,
            "kms_driven": kms_driven,
            "fuel_type": fuel_type
        }])

        prediction = max(0, float(model.predict(input_data)[0]))

        # Save prediction; user_id is NULL for unauthenticated requests.
        user_id = get_token_user_id()
        connection = get_db_connection()
        try:
            with connection.cursor() as cursor:
                cursor.execute("""
                    INSERT INTO prediction_history
                    (user_id, car_name, company, model_year,
                     kms_driven, fuel_type, predicted_price)
                    VALUES (%s, %s, %s, %s, %s, %s, %s)
                """, (
                    user_id, name, company, year,
                    kms_driven, fuel_type, prediction
                ))
            connection.commit()
        except Exception:
            connection.rollback()
            app.logger.exception("Could not save prediction history")
            return jsonify({
                "error": "Prediction calculated but history could not be saved."
            }), 500
        finally:
            connection.close()

        return jsonify({
            "prediction": prediction,
            "car": {
                "name": name,
                "company": company,
                "year": year,
                "kms_driven": kms_driven,
                "fuel_type": fuel_type
            },
            "saved_to_database": True
        })

    except (ValueError, TypeError):
        return jsonify({"error": "Please provide valid year and kilometre values."}), 400
    except Exception:
        app.logger.exception("Prediction error")
        return jsonify({"error": "Prediction failed. Check the server logs."}), 500


# =========================================================
# RUN SERVER
# =========================================================


@app.route("/history", methods=["GET"])
def get_prediction_history():
    user_id = get_token_user_id()

    if user_id is None:
        return jsonify({"error": "Please log in again."}), 401

    connection = get_db_connection()

    try:
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT
                    id,
                    car_name,
                    company,
                    model_year,
                    kms_driven,
                    fuel_type,
                    predicted_price,
                    created_at
                FROM prediction_history
                WHERE user_id = %s
                ORDER BY id DESC
            """, (user_id,))

            rows = cursor.fetchall()

        for row in rows:
            if row.get("created_at"):
                row["created_at"] = row["created_at"].isoformat(
                    sep=" ", timespec="seconds"
                )
            # Convert Decimal values into JSON-compatible numbers.
            row["kms_driven"] = float(row["kms_driven"])
            row["predicted_price"] = float(row["predicted_price"])

        return jsonify({"predictions": rows})

    except Exception:
        app.logger.exception("Could not load prediction history")
        return jsonify({"error": "Could not load prediction history."}), 500

    finally:
        connection.close()


if __name__ == "__main__":
    print("\n----------------------------------------")
    print("        CARLENS FLASK SERVER")
    print("----------------------------------------")
    print("Dataset:", DATA_PATH)
    print("Model:", MODEL_PATH)

    if not df.empty:
        print("Rows:", len(df))
        print("Year range:", int(df["Model Year"].min()), "-", int(df["Model Year"].max()))
        print("Companies:", df["Brand"].nunique())

    try:
        initialize_database()
        print("MySQL tables initialized successfully.")
    except Exception:
        app.logger.exception("Could not initialize MySQL tables")
        raise

    print("----------------------------------------")
    app.run(host="127.0.0.1", port=5000, debug=True)
