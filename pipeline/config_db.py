"""
SXMXDX - Configuration PostgreSQL unique du pipeline.

Tous les scripts (import, validation, Spark, budget, prediction) lisent
leurs parametres de connexion ici, a partir des variables d'environnement
DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD (et JDBC_URL pour Spark,
facultatif). Les valeurs par defaut correspondent au conteneur Docker.
"""
import os

DB_CONFIG = {
    "host": os.getenv("DB_HOST", "postgres"),
    "port": int(os.getenv("DB_PORT", "5432")),
    "dbname": os.getenv("DB_NAME", "sxmxdx5"),
    "user": os.getenv("DB_USER", "sxmxdx"),
    "password": os.getenv("DB_PASSWORD", "diary"),
}


def get_connection():
    """Connexion psycopg2 avec la configuration commune."""
    import psycopg2
    return psycopg2.connect(**DB_CONFIG)


def jdbc_url():
    """URL JDBC pour Spark : JDBC_URL si definie, sinon deduite de DB_CONFIG."""
    return os.getenv("JDBC_URL") or (
        f"jdbc:postgresql://{DB_CONFIG['host']}:{DB_CONFIG['port']}/{DB_CONFIG['dbname']}"
    )


def jdbc_properties():
    """Proprietes JDBC (utilisateur, mot de passe, pilote) pour Spark."""
    return {
        "user": DB_CONFIG["user"],
        "password": DB_CONFIG["password"],
        "driver": "org.postgresql.Driver",
    }
