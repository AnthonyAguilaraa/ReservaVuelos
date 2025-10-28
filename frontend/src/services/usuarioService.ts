const API_URL = 'http://localhost:5000/api';

/**
 * Gets authentication headers with the stored token.
 */
function getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem('token');
    // Ensure 'Bearer null' isn't sent if token is missing
    const authToken = token ? `Bearer ${token}` : '';
    return {
        'Content-Type': 'application/json',
        'Authorization': authToken
    };
}

/**
 * Calls: GET /api/usuario/me
 * Gets the profile data of the currently logged-in user.
 */
export async function getMiPerfil() {
    try {
        const headers = getAuthHeaders();
        // Check if Authorization header is actually present and valid
        if (!headers['Authorization'] || headers['Authorization'] === 'Bearer null') {
            return { success: false, message: 'No autorizado o token no encontrado' };
        }

        const response = await fetch(`${API_URL}/usuario/me`, {
            method: 'GET',
            headers: headers
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || 'Error al cargar el perfil');
        }
        return { success: true, data: data }; // data will contain { id_usuario, nombre, correo_electronico, telefono, ... }

    } catch (error) {
        console.error('Error en usuarioService.getMiPerfil:', error);
        return { success: false, message: (error as Error).message };
    }
}

/**
 * Calls: PUT /api/usuario/me
 * Updates the basic profile data (name, phone) of the logged-in user.
 * @param userData Object with fields to update. e.g., { nombre: "New Name", telefono: "123456" }
 */
export async function updateMiPerfil(userData: { nombre?: string; telefono?: string }) {
    try {
        const headers = getAuthHeaders();
        if (!headers['Authorization'] || headers['Authorization'] === 'Bearer null') {
            return { success: false, message: 'No autorizado' };
        }

        const response = await fetch(`${API_URL}/usuario/me`, {
            method: 'PUT',
            headers: headers,
            body: JSON.stringify(userData)
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || 'Error al actualizar el perfil');
        }
        return { success: true, data: data }; // data will contain { message: "..." }

    } catch (error) {
        console.error('Error en usuarioService.updateMiPerfil:', error);
        return { success: false, message: (error as Error).message };
    }
}

/**
 * Calls: PUT /api/usuario/cambiar-contrasena
 * Changes the user's password.
 * @param passwordData Object with { contrasenaActual, nuevaContrasena }
 */
export async function changeMyPassword(passwordData: { contrasenaActual: string; nuevaContrasena: string }) {
    try {
        const headers = getAuthHeaders();
        if (!headers['Authorization'] || headers['Authorization'] === 'Bearer null') {
            return { success: false, message: 'No autorizado' };
        }

        const response = await fetch(`${API_URL}/usuario/cambiar-contrasena`, {
            method: 'PUT',
            headers: headers,
            body: JSON.stringify(passwordData)
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || 'Error al cambiar la contraseña');
        }
        return { success: true, data: data }; // data will contain { message: "..." }

    } catch (error) {
        console.error('Error en usuarioService.changeMyPassword:', error);
        return { success: false, message: (error as Error).message };
    }
}

/**
 * Calls: DELETE /api/usuario/me
 * Deactivates (logical delete) the current user's account.
 */
export async function deactivateMyAccount() {
    try {
        const headers = getAuthHeaders();
        if (!headers['Authorization'] || headers['Authorization'] === 'Bearer null') {
            return { success: false, message: 'No autorizado' };
        }

        const response = await fetch(`${API_URL}/usuario/me`, {
            method: 'DELETE',
            headers: headers
        });

        // Check if response is OK before parsing JSON
        if (!response.ok) {
             // Try to parse error message if available
            try {
                 const data = await response.json();
                 throw new Error(data.error || `Error ${response.status}: ${response.statusText}`);
            } catch (parseError){
                // If JSON parsing fails, use status text
                 throw new Error(`Error ${response.status}: ${response.statusText}`);
            }
        }

        // Handle potentially empty successful response body
        const text = await response.text();
        let data = {};
        if (text) {
            try {
                data = JSON.parse(text);
            } catch (e) {
                console.warn("Could not parse JSON response on successful DELETE:", text);
                data = { message: "Cuenta desactivada (respuesta no JSON)" }; // Provide default message
            }
        } else {
             data = { message: "Cuenta desactivada exitosamente." }; // Provide default message for empty body
        }


        return { success: true, data: data }; // data might contain { message: "..." }

    } catch (error) {
        console.error('Error en usuarioService.deactivateMyAccount:', error);
        return { success: false, message: (error as Error).message };
    }
}