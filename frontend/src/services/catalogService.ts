
const API_URL = 'http://localhost:5000/api'; // (Ajusta esta URL)

/**
 * Obtiene la lista de ciudades para los menús desplegables.
 */
export async function getCiudades() {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/ciudades`, { // Asume que este endpoint existe
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Error al cargar ciudades');
    return await response.json();
  } catch (error) {
    console.error(error);
    return [];
  }
}

/**
 * Obtiene la lista de aerolíneas para los menús desplegables.
 */
export async function getAerolineas() {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/aerolineas`, { // Asume que este endpoint existe
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Error al cargar aerolíneas');
    return await response.json();
  } catch (error) {
    console.error(error);
    return [];
  }
}