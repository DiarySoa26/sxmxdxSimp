import { API_URL } from "@/config/api-config";

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

export const creerCampagneApresBudget = data =>
  request("/api/campagnes/apres-generation", {
    method: "POST",
    body: JSON.stringify(data)
  });

export const modifierJalon = (campagneId, jalonId, dateLimite) =>
  request(`/api/campagnes/${campagneId}/jalons/${jalonId}`, {
    method: "PATCH",
    body: JSON.stringify({ dateLimite })
  });

export const terminerJalon = (campagneId, jalonId) =>
  request(`/api/campagnes/${campagneId}/jalons/${jalonId}/terminer`, {
    method: "PATCH"
  });

export const validerCampagne = id =>
  request(`/api/campagnes/${id}/valider`, {
    method: "PATCH"
  });