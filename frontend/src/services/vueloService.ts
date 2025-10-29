const API_URL = 'http://localhost:5000/api';

/**
 * Obtiene el token de autenticación de localStorage.
 */
function getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
}

/**
 * Wrapper genérico para manejar respuestas fetch y errores comunes.
 */
async function handleResponse(response: Response) {
    const data = await response.json();
    if (!response.ok) {
        // Usa el mensaje de error del backend si existe, si no, uno genérico
        throw new Error(data.error || 'Ocurrió un error en la solicitud');
    }
    return data;
}

/**
 * Llama a: GET /api/vuelos
 * Busca vuelos basado en filtros y paginación.
 * Coincide con 'exports.consultarVuelos' en tu backend.
 * @param params Objeto con filtros: { origen, destino, fecha, aerolinea_id, sortBy }
 */
export async function buscarVuelos(params: { [key: string]: string }) {
    try {
        const headers = getAuthHeaders();
        if (!headers['Authorization']?.includes('Bearer')) {
            return { success: false, message: 'No autorizado' };
        }

        const queryString = new URLSearchParams(params).toString();
        
        const response = await fetch(`${API_URL}/vuelos?${queryString}`, {
            method: 'GET',
            headers: headers
        });

        const data = await handleResponse(response);
        return { success: true, data: data };

    } catch (error) {
        console.error('Error en vueloService.buscarVuelos:', error);
        return { success: false, message: (error as Error).message };
    }
}

/**
 * Llama a: GET /api/vuelo/:id
 * Obtiene un vuelo por su NÚMERO DE VUELO (no por su ID numérico).
 * Coincide con 'exports.consultarVueloPorId' en tu backend.
 * @param numero_vuelo El código del vuelo (ej: "AV123")
 */
export async function getVueloByNumeroVuelo(numero_vuelo: string) {
    try {
        const headers = getAuthHeaders();
        if (!headers['Authorization']?.includes('Bearer')) {
            return { success: false, message: 'No autorizado' };
        }

        const response = await fetch(`${API_URL}/vuelo/${numero_vuelo}`, {
            method: 'GET',
            headers: headers
        });

        const data = await handleResponse(response);
        return { success: true, data: data };

    } catch (error) {
        console.error('Error en vueloService.getVueloByNumeroVuelo:', error);
        return { success: false, message: (error as Error).message };
    }
}

/**
 * Llama a: POST /api/vuelo
 * Crea un nuevo vuelo.
 * Coincide con 'exports.insertarVuelo' en tu backend.
 * @param vueloData Objeto con todos los campos del vuelo (numero_vuelo, ciudad_origen, etc.)
 */
export async function createVuelo(vueloData: object) {
    try {
        const headers = getAuthHeaders();
        if (!headers['Authorization']?.includes('Bearer')) {
            return { success: false, message: 'No autorizado' };
        }

        const response = await fetch(`${API_URL}/vuelo`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(vueloData)
        });

        const data = await handleResponse(response);
        return { success: true, data: data };

    } catch (error) {
        console.error('Error en vueloService.createVuelo:', error);
        return { success: false, message: (error as Error).message };
    }
}

/**
 * Llama a: PUT /api/vuelo
 * Modifica un vuelo existente.
 * Coincide con 'exports.modificarVuelo' en tu backend.
 * IMPORTANTE: Tu backend espera 'id_vuelo' (PK numérico) en el body.
 * @param vueloData Objeto que DEBE incluir 'id_vuelo' y los campos a cambiar.
 */
export async function updateVuelo(vueloData: { id_vuelo: number, [key: string]: any }) {
    try {
        const headers = getAuthHeaders();
        if (!headers['Authorization']?.includes('Bearer')) {
            return { success: false, message: 'No autorizado' };
        }

        const response = await fetch(`${API_URL}/vuelo`, {
            method: 'PUT',
            headers: headers,
            body: JSON.stringify(vueloData)
        });

        const data = await handleResponse(response);
        return { success: true, data: data };

    } catch (error) {
        console.error('Error en vueloService.updateVuelo:', error);
        return { success: false, message: (error as Error).message };
    }
}


/**
 * Llama a: DELETE /api/vuelo/:id
 * Realiza un borrado lógico de un vuelo por su NÚMERO DE VUELO.
 * Coincide con 'exports.eliminarVuelo' en tu backend.
 * @param numero_vuelo El código del vuelo (ej: "AV123")
 */
export async function deleteVueloByNumeroVuelo(numero_vuelo: string) {
    try {
        const headers = getAuthHeaders();
        if (!headers['Authorization']?.includes('Bearer')) {
            return { success: false, message: 'No autorizado' };
        }

        const response = await fetch(`${API_URL}/vuelo/${numero_vuelo}`, {
            method: 'DELETE',
            headers: headers
        });

        const data = await handleResponse(response);
        return { success: true, data: data };

    } catch (error) {
        console.error('Error en vueloService.deleteVueloByNumeroVuelo:', error);
        return { success: false, message: (error as Error).message };
    }
}

export async function getAsientosDisponibles(id_vuelo: number) {
    try {
        const headers = getAuthHeaders();
        if (!headers['Authorization']?.includes('Bearer')) {
            return { success: false, message: 'No autorizado' };
        }

        const response = await fetch(`${API_URL}/asientos/${id_vuelo}`, {
            method: 'GET',
            headers: headers
        });

        const data = await handleResponse(response); // Asumiendo que tienes handleResponse
        
        // Si no, usa esto:
        // const data = await response.json();
        // if (!response.ok) {
        //     throw new Error(data.error || 'Error al cargar asientos');
        // }

        return { success: true, data: data }; // data será un array de asientos

    } catch (error) {
        console.error('Error en vueloService.getAsientosDisponibles:', error);
        return { success: false, message: (error as Error).message };
    }
}

/**
 * Llama a: GET /api/asientos/disponibles/count/:id_vuelo
 * Obtiene el número de asientos disponibles para un vuelo.
 * @param id_vuelo El ID numérico del vuelo.
 */
export async function getConteoAsientosDisponibles(id_vuelo: number) {
    try {
        const headers = getAuthHeaders();
        if (!headers['Authorization'] || headers['Authorization'] === 'Bearer null') {
            return { success: false, message: 'No autorizado' };
        }

        const response = await fetch(`${API_URL}/asientos/disponibles/count/${id_vuelo}`, {
            method: 'GET',
            headers: headers
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || 'Error al contar asientos');
        }
        // Devuelve el conteo, ej: { success: true, count: 15 }
        return { success: true, count: data.count };

    } catch (error) {
        console.error('Error en vueloService.getConteoAsientosDisponibles:', error);
        return { success: false, message: (error as Error).message, count: 0 }; // Devuelve 0 en error
    }
}