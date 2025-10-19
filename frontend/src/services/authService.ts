// Define la URL base de tu API de backend
// ¡¡Asegúrate de que coincida con el puerto donde corre tu backend!!
const API_URL = 'http://localhost:5000/api'; // (¡Ajusta esta URL si es necesario!)

/**
 * Inicia sesión llamando al endpoint /login del backend.
 * @param correo - El correo electrónico del usuario.
 * @param clave - La contraseña del usuario.
 * @returns Un objeto con el resultado del inicio de sesión.
 */
export async function iniciarSesion(correo: string, clave: string) {
  try {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ correo, clave }),
    });

    const data = await response.json();

    if (!response.ok) {
      // Si el backend devuelve un error (ej. 401 Credenciales inválidas)
      throw new Error(data.error || 'Error al iniciar sesión');
    }

    // Si el login es exitoso y tenemos un token
    if (data.token) {
      localStorage.setItem('token', data.token); // Guardamos el token
      return { success: true, message: data.message };
    } else {
      throw new Error('No se recibió un token del servidor');
    }
  } catch (error) {
    console.error('Error en authService.iniciarSesion:', error);
    // Devolvemos el mensaje de error para mostrarlo en la UI
    return { success: false, message: (error as Error).message };
  }
}

/**
 * Registra un nuevo usuario llamando al endpoint /usuario.
 * @param datos - Objeto con nombre, correo, clave, telefono.
 * @returns Un objeto con el resultado del registro.
 */
export async function registrarUsuario(datos: any) {
    try {
        const response = await fetch(`${API_URL}/usuario`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(datos),
        });
    
        const data = await response.json();
    
        if (!response.ok) {
          throw new Error(data.error || 'Error al registrar el usuario');
        }
    
        return { success: true, message: data.message };

      } catch (error) {
        console.error('Error en authService.registrarUsuario:', error);
        return { success: false, message: (error as Error).message };
      }
}

/**
 * Cierra la sesión eliminando el token.
 */
export function cerrarSesion() {
    localStorage.removeItem('token');
    location.reload(); // Recarga la página para que main.ts nos lleve al login
}