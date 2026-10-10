import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"

import pool from "@/lib/db"

export async function POST(request) {
  try {
    // ============================================================
    // 1. Récupérer email + mot de passe
    // ============================================================

    const body = await request.json()

    const email = String(body.email || "")
      .trim()
      .toLowerCase()

    const password = String(body.password || "")

    // ============================================================
    // 2. Vérifier les champs
    // ============================================================

    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "Email et mot de passe obligatoires.",
        },
        {
          status: 400,
        }
      )
    }

    // ============================================================
    // 3. Rechercher l'utilisateur dans PostgreSQL
    // ============================================================

    const result = await pool.query(
      `
      SELECT
          u.id,
          u.nom,
          u.prenom,
          u.email,
          u.mot_de_passe,
          u.actif,
          r.nom AS role
      FROM utilisateur u
      INNER JOIN role r
          ON r.id = u.role_id
      WHERE LOWER(u.email) = $1
      LIMIT 1
      `,
      [email]
    )

    // ============================================================
    // 4. Utilisateur inexistant
    // ============================================================

    if (result.rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Email ou mot de passe incorrect.",
        },
        {
          status: 401,
        }
      )
    }

    const utilisateur = result.rows[0]

    // ============================================================
    // 5. Vérifier si le compte est actif
    // ============================================================

    if (!utilisateur.actif) {
      return NextResponse.json(
        {
          success: false,
          message: "Ce compte utilisateur est désactivé.",
        },
        {
          status: 403,
        }
      )
    }

    // ============================================================
    // 6. Vérification du mot de passe avec bcrypt
    // ============================================================

    const motDePasseValide = await bcrypt.compare(
      password,
      utilisateur.mot_de_passe
    )

    if (!motDePasseValide) {
      // Journaliser l'échec si la table existe
      try {
        await pool.query(
          `
          INSERT INTO journal_connexion (
              utilisateur_id,
              succes
          )
          VALUES ($1, FALSE)
          `,
          [utilisateur.id]
        )
      } catch (journalError) {
        console.error(
          "Impossible de journaliser l'échec :",
          journalError
        )
      }

      return NextResponse.json(
        {
          success: false,
          message: "Email ou mot de passe incorrect.",
        },
        {
          status: 401,
        }
      )
    }

    // ============================================================
    // 7. Connexion réussie
    // ============================================================

    try {
      await pool.query(
        `
        UPDATE utilisateur
        SET derniere_connexion = CURRENT_TIMESTAMP
        WHERE id = $1
        `,
        [utilisateur.id]
      )
    } catch (updateError) {
      console.error(
        "Impossible de mettre à jour derniere_connexion :",
        updateError
      )
    }

    // ============================================================
    // 8. Journaliser la connexion
    // ============================================================

    try {
      await pool.query(
        `
        INSERT INTO journal_connexion (
            utilisateur_id,
            succes
        )
        VALUES ($1, TRUE)
        `,
        [utilisateur.id]
      )
    } catch (journalError) {
      console.error(
        "Impossible de journaliser la connexion :",
        journalError
      )
    }

    // ============================================================
    // 9. Retourner les informations utilisateur
    // ============================================================
    //
    // IMPORTANT :
    // On ne retourne JAMAIS mot_de_passe.
    //

    return NextResponse.json(
      {
        success: true,

        user: {
          id: utilisateur.id,

          name: `${utilisateur.prenom || ""} ${
            utilisateur.nom || ""
          }`.trim(),

          email: utilisateur.email,

          role: utilisateur.role,
        },
      },
      {
        status: 200,
      }
    )
  } catch (error) {
    console.error(
      "Erreur API /api/login :",
      error
    )

    return NextResponse.json(
      {
        success: false,
        message: "Erreur serveur pendant la connexion.",
      },
      {
        status: 500,
      }
    )
  }
}