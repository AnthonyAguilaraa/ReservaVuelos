const API_URL = 'http://localhost:5000/api'; // (Ajusta esta URL)

/**
 * Busca vuelos en la API usando filtros y ordenamiento.
 * @param params Objeto con los filtros (origen, destino, fecha, sortBy, etc.)
 */
export async function buscarVuelos(params: { [key: string]: string }) {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      return { success: false, message: 'No autorizado' };
    }

    // Convertir el objeto de params a query string (ej. ?origen=1&destino=2)
    const queryString = new URLSearchParams(params).toString();

    const response = await fetch(`${API_URL}/vuelos?${queryString}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` // ¡Importante! Enviar el token
      }
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || 'Error al buscar vuelos');
    }

    return { success: true, data: data };

  } catch (error) {
    console.error('Error en vueloService.buscarVuelos:', error);
    return { success: false, message: (error as Error).message };
  }
}

/**
 * Obtiene la información de un solo vuelo por su ID.
 * @param id El ID del vuelo
 */

/*export async function getVueloById(id: string) {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            return { success: false, message: 'No autorizado' };
        }

        const response = await fetch(`${API_URL}/vuelo/${id}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || 'Vuelo no encontrado');
        }
    
        return { success: true, data: data };

    } catch (error) {
        console.error('Error en vueloService.getVueloById:', error);
        return { success: false, message: (error as Error).message };
    }
}*/

/**
 * Obtiene la información de un solo vuelo por su numero_vuelo.
 * @param numero_vuelo El número del vuelo
 */
export async function getVueloById(numero_vuelo: string) {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            return { success: false, message: 'No autorizado' };
        }

        const response = await fetch(`${API_URL}/vuelo/${numero_vuelo}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || 'Vuelo no encontrado');
        }
    
        return { success: true, data: data };

    } catch (error) {
        console.error('Error en vueloService.getVueloById:', error);
        return { success: false, message: (error as Error).message };
    }
}
