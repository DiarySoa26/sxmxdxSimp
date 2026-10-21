import { API_URL } from "@/config/api-config";

function getAuteurId() {
  if (typeof window === "undefined") {
    throw new Error("Session utilisateur indisponible");
  }

  let utilisateur;

  try {
    utilisateur = JSON.parse(
      sessionStorage.getItem("sxmxdx_user") || "null"
    );
  } catch {
    throw new Error("Session utilisateur invalide");
  }

  if (!utilisateur?.id) {
    throw new Error("Utilisateur non connecté");
  }

  return utilisateur.id;
}

function avecAuteurId(path) {
  const separateur = path.includes("?") ? "&" : "?";
  return `${path}${separateur}auteurId=${encodeURIComponent(getAuteurId())}`;
}

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    cache: "no-store",
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers
    }
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Erreur HTTP ${response.status}`);
  }

  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

export const listerCampagnes = () =>
  request("/api/campagnes");

export const detailsCampagne = id =>
  request(`/api/campagnes/${id}`);

export const creerCampagne = data =>
  request(avecAuteurId("/api/campagnes"), {
    method: "POST",
    body: JSON.stringify(data)
  });

export const creerCampagneApresBudget = data =>
  request(avecAuteurId("/api/campagnes/apres-generation"), {
    method: "POST",
    body: JSON.stringify(data)
  });

export const modifierCampagne = (id, data) =>
  request(avecAuteurId(`/api/campagnes/${id}`), {
    method: "PUT",
    body: JSON.stringify(data)
  });

export const modifierJalon = (campagneId, jalonId, dateLimite) =>
  request(
    avecAuteurId(`/api/campagnes/${campagneId}/jalons/${jalonId}`),
    {
      method: "PATCH",
      body: JSON.stringify({ dateLimite })
    }
  );

export const terminerJalon = (campagneId, jalonId) =>
  request(
    avecAuteurId(
      `/api/campagnes/${campagneId}/jalons/${jalonId}/terminer`
    ),
    { method: "PATCH" }
  );

export const validerCampagne = id =>
  request(
    avecAuteurId(`/api/campagnes/${id}/valider`),
    { method: "PATCH" }
  );
