import { getMiPerfil, updateMiPerfil, changeMyPassword, deactivateMyAccount } from '../services/usuarioService';
import { cerrarSesion } from '../services/authService'; // Para desloguear después de desactivar

// Variable para guardar los datos del usuario
let currentUserData: any | null = null;
let isEditing = false; // Estado para saber si se está editando

/**
 * Punto de entrada para el módulo de Perfil.
 */
export async function renderPerfilUsuario(container: HTMLDivElement) {
    container.innerHTML = `<p class="text-center text-gray-600">Cargando perfil...</p>`;
    isEditing = false; // Resetear estado de edición

    const result = await getMiPerfil();

    if (result.success) {
        currentUserData = result.data;
        renderProfileView(container); // Renderizar la vista principal
    } else {
        container.innerHTML = `<p class="text-red-500 text-center">${result.message || 'Error desconocido al cargar el perfil.'}</p>`;
        // Opcionalmente redirige al login si no está autorizado
        if (result.message && result.message.toLowerCase().includes('autorizado')) {
             setTimeout(() => cerrarSesion(), 2000);
        }
    }
}

/**
 * Renderiza la vista principal del perfil (solo lectura).
 */
function renderProfileView(container: HTMLDivElement) {
    const inputFieldClass = "w-full mt-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500";
    const buttonClass = "py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-offset-2 transition duration-200"; // Estilo base de botón

    container.innerHTML = `
        <div class="w-full max-w-3xl mx-auto"> <h2 class="text-2xl font-bold mb-6 text-gray-800">Mi Perfil</h2>

            <div class="bg-white shadow rounded-lg p-6 mb-6">
                <h3 class="text-xl font-semibold mb-4 border-b pb-2 text-gray-700">Información Personal</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mb-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-500">Nombre:</label>
                        <p id="profile-nombre" class="text-lg mt-1 text-gray-900 break-words">${currentUserData?.nombre || 'N/A'}</p>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-500">Correo Electrónico:</label>
                        <p class="text-lg mt-1 text-gray-600 break-words">${currentUserData?.correo_electronico || 'N/A'}</p>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-500">Teléfono:</label>
                        <p id="profile-telefono" class="text-lg mt-1 text-gray-900 break-words">${currentUserData?.telefono || 'No especificado'}</p>
                    </div>
                     <div>
                        <label class="block text-sm font-medium text-gray-500">Miembro desde:</label>
                        <p class="text-lg mt-1 text-gray-900">${currentUserData?.fecha_registro ? new Date(currentUserData.fecha_registro).toLocaleDateString() : 'N/A'}</p>
                    </div>
                </div>
                <button id="btn-edit-profile" class="${buttonClass} bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500">
                    Editar Información
                </button>
                <div id="edit-form-container" class="mt-4 hidden border-t pt-4">
                    </div>
            </div>

            <div class="bg-white shadow rounded-lg p-6 mb-6">
                <h3 class="text-xl font-semibold mb-4 border-b pb-2 text-gray-700">Cambiar Contraseña</h3>
                <form id="form-change-password" class="space-y-4">
                    <div>
                        <label for="current-password" class="block text-sm font-medium text-gray-700">Contraseña Actual:</label>
                        <input type="password" id="current-password" required class="${inputFieldClass}">
                    </div>
                    <div>
                        <label for="new-password" class="block text-sm font-medium text-gray-700">Nueva Contraseña:</label>
                        <input type="password" id="new-password" required minlength="8" class="${inputFieldClass}"> </div>
                    <div>
                        <label for="confirm-password" class="block text-sm font-medium text-gray-700">Confirmar Nueva Contraseña:</label>
                        <input type="password" id="confirm-password" required minlength="8" class="${inputFieldClass}"> </div>
                    <button type="submit" class="${buttonClass} bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500">
                        Actualizar Contraseña
                    </button>
                    <p id="password-feedback" class="text-sm mt-2 h-5"></p> </form>
            </div>

            <div class="bg-red-50 border border-red-200 rounded-lg p-6">
                <h3 class="text-xl font-semibold mb-4 text-red-800">Zona de Peligro</h3>
                <p class="text-gray-700 mb-4">Desactivar su cuenta cambiará su estado a inactivo y le impedirá iniciar sesión.</p>
                <button id="btn-deactivate-account" class="${buttonClass} bg-red-600 text-white hover:bg-red-700 focus:ring-red-500">
                    Desactivar mi Cuenta
                </button>
            </div>
        </div> `;

    addProfileEventListeners(container);
}

/**
 * Renderiza el formulario para editar la información básica.
 */
function renderEditForm(formContainer: HTMLDivElement) {
    const inputFieldClass = "w-full mt-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500";
    const buttonClass = "w-full sm:w-auto py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-offset-2 transition duration-200"; // Estilo base de botón

    formContainer.innerHTML = `
        <form id="form-edit-profile" class="space-y-4">
             <div>
                <label for="edit-nombre" class="block text-sm font-medium text-gray-700">Nombre:</label>
                <input type="text" id="edit-nombre" value="${currentUserData?.nombre || ''}" required class="${inputFieldClass}">
            </div>
             <div>
                <label class="block text-sm font-medium text-gray-500">Correo Electrónico (no editable):</label>
                <input type="email" value="${currentUserData?.correo_electronico || ''}" disabled class="${inputFieldClass} bg-gray-100 cursor-not-allowed">
            </div>
             <div>
                <label for="edit-telefono" class="block text-sm font-medium text-gray-700">Teléfono:</label>
                <input type="tel" id="edit-telefono" value="${currentUserData?.telefono || ''}" class="${inputFieldClass}">
            </div>
            <div class="flex flex-col sm:flex-row gap-4 pt-2">
                 <button type="submit" class="${buttonClass} bg-green-600 text-white hover:bg-green-700 focus:ring-green-500">
                    Guardar Cambios
                </button>
                 <button type="button" id="btn-cancel-edit" class="${buttonClass} bg-gray-500 text-white hover:bg-gray-600 focus:ring-gray-500">
                    Cancelar
                </button>
            </div>
             <p id="edit-feedback" class="text-sm mt-2 h-5"></p> </form>
    `;
    formContainer.classList.remove('hidden');

    const editForm = formContainer.querySelector<HTMLFormElement>('#form-edit-profile')!;
    const feedbackEl = formContainer.querySelector<HTMLParagraphElement>('#edit-feedback')!;
    const saveButton = editForm.querySelector<HTMLButtonElement>('button[type="submit"]')!;

    editForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        saveButton.disabled = true;
        saveButton.textContent = 'Guardando...';
        feedbackEl.textContent = ''; 
        feedbackEl.className = 'text-sm mt-2 h-5';

        const nombre = editForm.querySelector<HTMLInputElement>('#edit-nombre')!.value.trim(); // Quitar espacios
        const telefono = editForm.querySelector<HTMLInputElement>('#edit-telefono')!.value.trim(); // Quitar espacios

        // Validación básica
        if (!nombre) {
             feedbackEl.textContent = 'El nombre no puede estar vacío.';
             feedbackEl.className = 'text-sm mt-2 h-5 text-red-600';
             saveButton.disabled = false;
             saveButton.textContent = 'Guardar Cambios';
             return;
        }

        const result = await updateMiPerfil({ nombre, telefono });

        if (result.success) {
            feedbackEl.textContent = 'Perfil actualizado con éxito.';
            feedbackEl.className = 'text-sm mt-2 h-5 text-green-600';
            // Actualizar datos locales y UI
            currentUserData.nombre = nombre;
            currentUserData.telefono = telefono;
            document.getElementById('profile-nombre')!.textContent = nombre || 'N/A';
            document.getElementById('profile-telefono')!.textContent = telefono || 'No especificado';
            // Ocultar formulario después de un tiempo
            setTimeout(() => {
                formContainer.classList.add('hidden');
                document.getElementById('btn-edit-profile')!.style.display = 'inline-block'; // Mostrar botón editar de nuevo
                isEditing = false;
                 feedbackEl.textContent = ''; // Limpiar mensaje de éxito
            }, 1500);
        } else {
            feedbackEl.textContent = `Error: ${result.message}`;
            feedbackEl.className = 'text-sm mt-2 h-5 text-red-600';
            saveButton.disabled = false;
            saveButton.textContent = 'Guardar Cambios';
        }
    });

    formContainer.querySelector('#btn-cancel-edit')!.addEventListener('click', () => {
        formContainer.classList.add('hidden');
        document.getElementById('btn-edit-profile')!.style.display = 'inline-block';
        isEditing = false;
    });
}

/**
 * Añade los listeners a los botones y formularios del perfil.
 */
function addProfileEventListeners(container: HTMLDivElement) {
    const editButton = container.querySelector<HTMLButtonElement>('#btn-edit-profile')!;
    const editFormContainer = container.querySelector<HTMLDivElement>('#edit-form-container')!;
    const passwordForm = container.querySelector<HTMLFormElement>('#form-change-password')!;
    const deactivateButton = container.querySelector<HTMLButtonElement>('#btn-deactivate-account')!;

    // --- Listener Botón Editar Perfil ---
    editButton.addEventListener('click', () => {
        if (!isEditing) {
            renderEditForm(editFormContainer);
            editButton.style.display = 'none'; // Ocultar botón editar mientras el formulario está visible
            isEditing = true;
        }
    });

    // --- Listeners Formulario Cambiar Contraseña (CON VALIDACIÓN EN TIEMPO REAL) ---
    const currentPasswordInput = passwordForm.querySelector<HTMLInputElement>('#current-password')!;
    const newPasswordInput = passwordForm.querySelector<HTMLInputElement>('#new-password')!;
    const confirmPasswordInput = passwordForm.querySelector<HTMLInputElement>('#confirm-password')!;
    const feedbackEl = passwordForm.querySelector<HTMLParagraphElement>('#password-feedback')!;
    const submitButton = passwordForm.querySelector<HTMLButtonElement>('button[type="submit"]')!;

    // Función helper para validar la nueva contraseña y actualizar estilos
    const validateNewPasswordInput = () => {
        const password = newPasswordInput.value;
        const isValidLength = password.length >= 8;
        // Regex: al menos 1 minúscula, 1 mayúscula, 1 número, 1 símbolo
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/;
        const hasComplexity = passwordRegex.test(password);

        // Clases para los bordes
        const grayBorder = ['border-gray-300', 'focus:border-blue-500'];
        const redBorder = ['border-red-500', 'focus:border-red-500'];
        const greenBorder = ['border-green-500', 'focus:border-green-500'];

        // Quitar todos los bordes de validación primero
        newPasswordInput.classList.remove(...redBorder, ...greenBorder);
        // Añadir el borde gris por defecto
        newPasswordInput.classList.add(...grayBorder);

        if (password.length === 0) {
            // Sin color de borde si está vacío
            feedbackEl.textContent = ''; // Limpiar feedback
        } else if (isValidLength && hasComplexity) {
            // Válido: Borde Verde
            newPasswordInput.classList.remove(...grayBorder);
            newPasswordInput.classList.add(...greenBorder);
            feedbackEl.textContent = 'Contraseña segura.'; // Feedback opcional
            feedbackEl.className = 'text-sm mt-2 h-5 text-green-600';
        } else {
            // Inválido: Borde Rojo
            newPasswordInput.classList.remove(...grayBorder);
            newPasswordInput.classList.add(...redBorder);
            if (!isValidLength) {
                 feedbackEl.textContent = 'Mínimo 8 caracteres.';
                 feedbackEl.className = 'text-sm mt-2 h-5 text-red-600';
            } else {
                 feedbackEl.textContent = 'Incluir Mayús, minús, núm, símbolo.';
                 feedbackEl.className = 'text-sm mt-2 h-5 text-red-600';
            }
        }
        return isValidLength && hasComplexity;
    };

    // Añadir validación en tiempo real al escribir en "Nueva Contraseña"
    newPasswordInput.addEventListener('input', validateNewPasswordInput);

    // Listener para el envío del formulario de contraseña
    passwordForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const currentPassword = currentPasswordInput.value;
        const newPassword = newPasswordInput.value;
        const confirmPassword = confirmPasswordInput.value;

        feedbackEl.textContent = ''; // Limpiar feedback previo del submit
        feedbackEl.className = 'text-sm mt-2 h-5';

        const isPasswordComplex = validateNewPasswordInput(); // Re-validar y aplicar estilo por si acaso
        if (!currentPassword || !newPassword || !confirmPassword) {
             feedbackEl.textContent = 'Todos los campos son obligatorios.';
             feedbackEl.className = 'text-sm mt-2 h-5 text-red-600';
             return;
        }
        if (newPassword !== confirmPassword) {
            feedbackEl.textContent = 'Las nuevas contraseñas no coinciden.';
            feedbackEl.className = 'text-sm mt-2 h-5 text-red-600';
            confirmPasswordInput.focus();
            // Añadir borde rojo al campo de confirmación si no coincide
            confirmPasswordInput.classList.add('border-red-500', 'focus:border-red-500');
            confirmPasswordInput.classList.remove('border-gray-300', 'focus:border-blue-500');
            return;
        } else {
             // Quitar borde rojo si ahora sí coinciden
             confirmPasswordInput.classList.remove('border-red-500', 'focus:border-red-500');
             confirmPasswordInput.classList.add('border-gray-300', 'focus:border-blue-500');
        }
         // Comprobar complejidad de nuevo al enviar
        if (!isPasswordComplex) {
            feedbackEl.textContent = 'La nueva contraseña no cumple los requisitos.';
            feedbackEl.className = 'text-sm mt-2 h-5 text-red-600';
            newPasswordInput.focus();
            return;
        }

        submitButton.disabled = true;
        submitButton.textContent = 'Actualizando...';
        feedbackEl.textContent = 'Actualizando contraseña...';
        feedbackEl.className = 'text-sm mt-2 h-5 text-blue-600';

        const result = await changeMyPassword({ contrasenaActual: currentPassword, nuevaContrasena: newPassword });

        if (result.success) {
            feedbackEl.textContent = 'Contraseña actualizada con éxito.';
            feedbackEl.className = 'text-sm mt-2 h-5 text-green-600';
            passwordForm.reset();
            // Resetear colores de borde en éxito
            newPasswordInput.classList.remove('border-red-500', 'border-green-500', 'focus:border-red-500', 'focus:border-green-500');
            newPasswordInput.classList.add('border-gray-300', 'focus:border-blue-500');
            confirmPasswordInput.classList.remove('border-red-500', 'focus:border-red-500');
            confirmPasswordInput.classList.add('border-gray-300', 'focus:border-blue-500');

            setTimeout(() => { feedbackEl.textContent = ''; }, 3000); // Limpiar mensaje de éxito
        } else {
            feedbackEl.textContent = `Error: ${result.message}`;
            feedbackEl.className = 'text-sm mt-2 h-5 text-red-600';
        }
        submitButton.disabled = false;
        submitButton.textContent = 'Actualizar Contraseña';
    });

    // --- Listener Botón Desactivar Cuenta ---
    deactivateButton.addEventListener('click', async () => {
        if (confirm('¿Está seguro de que desea desactivar su cuenta? Esta acción cambiará su estado a inactivo y le impedirá iniciar sesión.')) {
            deactivateButton.disabled = true;
            deactivateButton.textContent = 'Desactivando...';
            const result = await deactivateMyAccount();
            if (result.success) {
                alert('Su cuenta ha sido desactivada. Será redirigido a la página de inicio.');
                cerrarSesion(); // Desloguear al usuario
            } else {
                alert(`Error al desactivar la cuenta: ${result.message}`);
                deactivateButton.disabled = false;
                deactivateButton.textContent = 'Desactivar mi Cuenta';
            }
        }
    });
}