const API_URL = 'http://localhost:5000/api';

/**
 * Obtiene el token y los headers.
 * Devuelve Record<string,string> para que la indexación headers['Authorization'] sea válida en TypeScript.
 */
function getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
}

/**
 * Obtiene la lista de todas las ciudades activas.
 * Asume un endpoint: GET /api/ciudades
 */
export async function getCiudades() {
    try {
        const headers = getAuthHeaders();
        if (!headers['Authorization']?.includes('Bearer')) {
            throw new Error('No autorizado');
        }

        const response = await fetch(`${API_URL}/ciudades`, {
            headers: headers
        });

        if (!response.ok) {
            throw new Error('Error al cargar ciudades');
        }
        // Asume que la API devuelve un array: [{ id_ciudad: 1, nombre_ciudad: "Quito" }, ...]
        return await response.json();

    } catch (error) {
        console.error(error);
        return []; // Devuelve array vacío en error para no romper la UI
    }
}

/**
 * Obtiene la lista de todas las aerolíneas activas.
 * Asume un endpoint: GET /api/aerolineas
 */
export async function getAerolineas() {
    try {
        const headers = getAuthHeaders();
        if (!headers['Authorization']?.includes('Bearer')) {
            throw new Error('No autorizado');
        }
        
        const response = await fetch(`${API_URL}/aerolineas`, {
             headers: headers
        });
        
        if (!response.ok) {
            throw new Error('Error al cargar aerolíneas');
        }
        
        // Asume que la API devuelve un array: [{ id_aerolinea: 1, nombre_aerolinea: "Avianca" }, ...]
        return await response.json();

    } catch (error) {
        console.error(error);
        return []; // Devuelve array vacío
    }
}