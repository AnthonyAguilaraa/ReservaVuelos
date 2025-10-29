// src/pages/perfilUsuario.ts
import { getMiPerfil, updateMiPerfil, changeMyPassword, deactivateMyAccount } from '../services/usuarioService';
import { cerrarSesion } from '../services/authService'; // Para desloguear después de desactivar

// Variable para guardar los datos del usuario
let currentUserData: any | null = null;
let isEditing = false; // Estado para saber si se está editando

// --- Estilos de UI (Botones, Inputs) ---
const btnBase = [
    "w-full sm:w-auto inline-flex items-center justify-center gap-2",
    "px-4 py-2.5 rounded-xl text-sm font-semibold",
    "transition-all duration-200 ring-1 ring-inset",
    "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
].join(" ");

const btnPrimary = [ // Azul
    "text-white bg-gradient-to-r from-sky-600 to-indigo-700",
    "ring-sky-700/30 shadow-md shadow-sky-900/20",
    "hover:from-sky-700 hover:to-indigo-800",
    "focus-visible:ring-sky-500",
].join(" ");

const btnSuccess = [ // Verde
    "text-white bg-gradient-to-r from-emerald-600 to-green-700",
    "ring-emerald-700/30 shadow-md shadow-emerald-900/20",
    "hover:from-emerald-700 hover:to-green-800",
    "focus-visible:ring-emerald-500",
].join(" ");

const btnSecondary = [ // Blanco/Slate
    "text-slate-700 dark:text-slate-200",
    "bg-white/70 dark:bg-slate-900/40 backdrop-blur",
    "hover:bg-white dark:hover:bg-slate-900",
    "ring-slate-200/70 dark:ring-slate-800",
    "focus-visible:ring-sky-500",
].join(" ");

const btnDanger = [ // Rojo
    "text-white bg-gradient-to-r from-rose-600 to-red-700",
    "ring-rose-700/30 shadow-md shadow-rose-900/20",
    "hover:from-rose-700 hover:to-red-800",
    "focus-visible:ring-rose-500",
].join(" ");

const inputBase = [ // Con padding para icono
    "w-full rounded-xl border border-slate-200/70 dark:border-slate-700",
    "bg-white/70 dark:bg-slate-900/40",
    "pl-10 pr-3 py-2 text-sm text-slate-700 dark:text-slate-200",
    "placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500",
    "disabled:opacity-60 disabled:cursor-not-allowed",
].join(" ");

const inputBaseNoIcon = inputBase.replace("pl-10", "px-3");

// Clases de borde para validación
const defaultBorder = ['border-slate-200/70', 'dark:border-slate-700', 'focus:ring-sky-500'];
const redBorder = ['border-rose-500', 'dark:border-rose-600', 'focus:ring-rose-500'];
const greenBorder = ['border-emerald-500', 'dark:border-emerald-600', 'focus:ring-emerald-500'];

/**
 * Punto de entrada para el módulo de Perfil.
 */
export async function renderPerfilUsuario(container: HTMLDivElement) {
    container.innerHTML = `<p class="text-center text-slate-600 dark:text-slate-400">Cargando perfil...</p>`;
    isEditing = false; // Resetear estado de edición

    const result = await getMiPerfil();

    if (result.success) {
        currentUserData = result.data;
        renderProfileView(container); // Renderizar la vista principal
    } else {
        container.innerHTML = `<p class="text-rose-500 text-center">${result.message || 'Error desconocido al cargar el perfil.'}</p>`;
        if (result.message && result.message.toLowerCase().includes('autorizado')) {
             setTimeout(() => cerrarSesion(), 2000);
        }
    }
}

/**
 * Renderiza la vista principal del perfil (solo lectura).
 */
function renderProfileView(container: HTMLDivElement) {
    container.innerHTML = `
        <div class="w-full max-w-4xl mx-auto space-y-6">
            <h2 class="text-3xl font-extrabold text-slate-900 dark:text-white">
                Mi Perfil
            </h2>

            <div class="rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-white/70 dark:bg-slate-900/50 backdrop-blur-xl shadow-lg p-6 md:p-8">
                <h3 class="text-lg font-semibold text-slate-900 dark:text-white border-b border-slate-200/70 dark:border-slate-800 pb-3 mb-5 flex items-center gap-2">
                    ${ico('user')}
                    <span>Información Personal</span>
                </h3>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5 mb-6">
                    <div>
                        <label class="block text-sm font-medium text-slate-500 dark:text-slate-400">Nombre:</label>
                        <p id="profile-nombre" class="text-base mt-1 text-slate-800 dark:text-slate-100 break-words">${currentUserData?.nombre || 'N/A'}</p>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-slate-500 dark:text-slate-400">Correo Electrónico:</label>
                        <p class="text-base mt-1 text-slate-600 dark:text-slate-300 break-words">${currentUserData?.correo_electronico || 'N/A'}</p>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-slate-500 dark:text-slate-400">Teléfono:</label>
                        <p id="profile-telefono" class="text-base mt-1 text-slate-800 dark:text-slate-100 break-words">${currentUserData?.telefono || 'No especificado'}</p>
                    </div>
                     <div>
                        <label class="block text-sm font-medium text-slate-500 dark:text-slate-400">Miembro desde:</label>
                        <p class="text-base mt-1 text-slate-800 dark:text-slate-100">${currentUserData?.fecha_registro ? new Date(currentUserData.fecha_registro).toLocaleDateString() : 'N/A'}</p>
                    </div>
                </div>
                
                <button id="btn-edit-profile" class="${btnBase} ${btnPrimary}">
                    ${ico('edit')} <span>Editar Información</span>
                </button>
                
                <div id="edit-form-container" class="mt-6 hidden border-t border-slate-200/70 dark:border-slate-800 pt-6">
                    </div>
            </div>

            <div class="rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-white/70 dark:bg-slate-900/50 backdrop-blur-xl shadow-lg p-6 md:p-8">
                <h3 class="text-lg font-semibold text-slate-900 dark:text-white border-b border-slate-200/70 dark:border-slate-800 pb-3 mb-5 flex items-center gap-2">
                    ${ico('lock')}
                    <span>Cambiar Contraseña</span>
                </h3>
                
                <form id="form-change-password" class="space-y-4 max-w-md">
                    <div>
                        <label for="current-password" class="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Contraseña Actual:</label>
                        <div class="relative">
                            <span class="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">${ico('lock')}</span>
                            <input type="password" id="current-password" required class="${inputBase}">
                        </div>
                    </div>
                    <div>
                        <label for="new-password" class="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Nueva Contraseña:</label>
                        <div class="relative">
                            <span class="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">${ico('lock')}</span>
                            <input type="password" id="new-password" required minlength="8" class="${inputBase}">
                        </div>
                    </div>
                    <div>
                        <label for="confirm-password" class="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Confirmar Nueva Contraseña:</label>
                         <div class="relative">
                            <span class="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">${ico('lock')}</span>
                            <input type="password" id="confirm-password" required minlength="8" class="${inputBase}">
                         </div>
                    </div>
                    <button type="submit" class="${btnBase} ${btnPrimary}">
                        ${ico('save')} <span>Actualizar Contraseña</span>
                    </button>
                    <p id="password-feedback" class="text-sm mt-2 h-5"></p>
                </form>
            </div>

            <div class="rounded-2xl border border-rose-400/50 dark:border-rose-700/50 bg-rose-50/70 dark:bg-rose-900/30 backdrop-blur-xl p-6 md:p-8">
                <h3 class="text-lg font-semibold text-rose-700 dark:text-rose-300 flex items-center gap-2 mb-3">
                    ${ico('alert')}
                    <span>Zona de Peligro</span>
                </h3>
                <p class="text-slate-600 dark:text-slate-400 mb-4 max-w-xl">
                    Desactivar su cuenta cambiará su estado a inactivo y le impedirá iniciar sesión. Esta acción es reversible por un administrador.
                </p>
                <button id="btn-deactivate-account" class="${btnBase} ${btnDanger}">
                    ${ico('trash')} <span>Desactivar mi Cuenta</span>
                </button>
            </div>
        </div>
    `;

    addProfileEventListeners(container);
}

/**
 * Renderiza el formulario para editar la información básica.
 */
function renderEditForm(formContainer: HTMLDivElement) {
    formContainer.innerHTML = `
        <form id="form-edit-profile" class="space-y-4">
            <div>
                <label for="edit-nombre" class="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Nombre:</label>
                <input type="text" id="edit-nombre" value="${currentUserData?.nombre || ''}" required class="${inputBaseNoIcon}">
            </div>
            <div>
                <label class="block text-sm font-semibold text-slate-500 dark:text-slate-400 mb-2">Correo Electrónico (no editable):</label>
                <div class="relative">
                    <span class="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">${ico('mail')}</span>
                    <input type="email" value="${currentUserData?.correo_electronico || ''}" disabled class="${inputBase}">
                </div>
            </div>
            <div>
                <label for="edit-telefono" class="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Teléfono:</label>
                <div class="relative">
                    <span class="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">${ico('phone')}</span>
                    <input type="tel" id="edit-telefono" value="${currentUserData?.telefono || ''}" class="${inputBase}">
                </div>
            </div>
            <div class="flex flex-col sm:flex-row gap-4 pt-2">
                 <button type="submit" class="${btnBase} ${btnSuccess}">
                    ${ico('save')} <span>Guardar Cambios</span>
                 </button>
                 <button type="button" id="btn-cancel-edit" class="${btnBase} ${btnSecondary}">
                    ${ico('cancel')} <span>Cancelar</span>
                 </button>
            </div>
            <p id="edit-feedback" class="text-sm mt-2 h-5"></p>
        </form>
    `;
    formContainer.classList.remove('hidden');

    const editForm = formContainer.querySelector<HTMLFormElement>('#form-edit-profile')!;
    const feedbackEl = formContainer.querySelector<HTMLParagraphElement>('#edit-feedback')!;
    const saveButton = editForm.querySelector<HTMLButtonElement>('button[type="submit"]')!;

    editForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        saveButton.disabled = true;
        saveButton.innerHTML = `${ico('loader')} <span>Guardando...</span>`; // Icono de carga
        feedbackEl.textContent = ''; 
        feedbackEl.className = 'text-sm mt-2 h-5';

        const nombre = editForm.querySelector<HTMLInputElement>('#edit-nombre')!.value.trim();
        const telefono = editForm.querySelector<HTMLInputElement>('#edit-telefono')!.value.trim();

        if (!nombre) {
            feedbackEl.textContent = 'El nombre no puede estar vacío.';
            feedbackEl.className = 'text-sm mt-2 h-5 text-rose-600';
            saveButton.disabled = false;
            saveButton.innerHTML = `${ico('save')} <span>Guardar Cambios</span>`;
            return;
        }

        const result = await updateMiPerfil({ nombre, telefono });

        if (result.success) {
            feedbackEl.textContent = 'Perfil actualizado con éxito.';
            feedbackEl.className = 'text-sm mt-2 h-5 text-emerald-600';
            currentUserData.nombre = nombre;
            currentUserData.telefono = telefono;
            document.getElementById('profile-nombre')!.textContent = nombre || 'N/A';
            document.getElementById('profile-telefono')!.textContent = telefono || 'No especificado';
            
            setTimeout(() => {
                formContainer.classList.add('hidden');
                document.getElementById('btn-edit-profile')!.style.display = 'inline-flex';
                isEditing = false;
                 feedbackEl.textContent = '';
            }, 1500);
        } else {
            feedbackEl.textContent = `Error: ${result.message}`;
            feedbackEl.className = 'text-sm mt-2 h-5 text-rose-600';
            saveButton.disabled = false;
            saveButton.innerHTML = `${ico('save')} <span>Guardar Cambios</span>`;
        }
    });

    formContainer.querySelector('#btn-cancel-edit')!.addEventListener('click', () => {
        formContainer.classList.add('hidden');
        document.getElementById('btn-edit-profile')!.style.display = 'inline-flex';
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
            editButton.style.display = 'none';
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
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/;
        const hasComplexity = passwordRegex.test(password);

        // Quitar todos los bordes de validación primero
        newPasswordInput.classList.remove(...defaultBorder, ...redBorder, ...greenBorder);

        if (password.length === 0) {
            newPasswordInput.classList.add(...defaultBorder); // Reset a default
            feedbackEl.textContent = ''; 
        } else if (isValidLength && hasComplexity) {
            newPasswordInput.classList.add(...greenBorder); // Borde Verde
            feedbackEl.textContent = 'Contraseña segura.'; 
            feedbackEl.className = 'text-sm mt-2 h-5 text-emerald-600';
        } else {
            newPasswordInput.classList.add(...redBorder); // Borde Rojo
            if (!isValidLength) {
                feedbackEl.textContent = 'Mínimo 8 caracteres.';
            } else {
                feedbackEl.textContent = 'Incluir Mayús, minús, núm, símbolo.';
            }
            feedbackEl.className = 'text-sm mt-2 h-5 text-rose-600';
        }
        return isValidLength && hasComplexity;
    };

    newPasswordInput.addEventListener('input', validateNewPasswordInput);

    // Listener para el envío del formulario de contraseña
    passwordForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const currentPassword = currentPasswordInput.value;
        const newPassword = newPasswordInput.value;
        const confirmPassword = confirmPasswordInput.value;

        feedbackEl.textContent = ''; 
        feedbackEl.className = 'text-sm mt-2 h-5';

        // Resetear borde de confirmación
        confirmPasswordInput.classList.remove(...redBorder);
        confirmPasswordInput.classList.add(...defaultBorder);

        const isPasswordComplex = validateNewPasswordInput(); // Re-validar
        
        if (!currentPassword || !newPassword || !confirmPassword) {
            feedbackEl.textContent = 'Todos los campos son obligatorios.';
            feedbackEl.className = 'text-sm mt-2 h-5 text-rose-600';
            return;
        }
        if (newPassword !== confirmPassword) {
            feedbackEl.textContent = 'Las nuevas contraseñas no coinciden.';
            feedbackEl.className = 'text-sm mt-2 h-5 text-rose-600';
            confirmPasswordInput.focus();
            confirmPasswordInput.classList.remove(...defaultBorder);
            confirmPasswordInput.classList.add(...redBorder); // Borde rojo en confirmación
            return;
        }
        
        if (!isPasswordComplex) {
            feedbackEl.textContent = 'La nueva contraseña no cumple los requisitos.';
            feedbackEl.className = 'text-sm mt-2 h-5 text-rose-600';
            newPasswordInput.focus();
            return;
        }

        submitButton.disabled = true;
        submitButton.innerHTML = `${ico('loader')} <span>Actualizando...</span>`;
        feedbackEl.textContent = 'Actualizando contraseña...';
        feedbackEl.className = 'text-sm mt-2 h-5 text-sky-600'; // Azul para "cargando"

        const result = await changeMyPassword({ contrasenaActual: currentPassword, nuevaContrasena: newPassword });

        if (result.success) {
            feedbackEl.textContent = 'Contraseña actualizada con éxito.';
            feedbackEl.className = 'text-sm mt-2 h-5 text-emerald-600';
            passwordForm.reset();
            // Resetear colores de borde en éxito
            newPasswordInput.classList.remove(...redBorder, ...greenBorder);
            newPasswordInput.classList.add(...defaultBorder);
            confirmPasswordInput.classList.remove(...redBorder, ...greenBorder);
            confirmPasswordInput.classList.add(...defaultBorder);
            
            setTimeout(() => { feedbackEl.textContent = ''; }, 3000); 
        } else {
            feedbackEl.textContent = `Error: ${result.message}`;
            feedbackEl.className = 'text-sm mt-2 h-5 text-rose-600';
        }
        submitButton.disabled = false;
        submitButton.innerHTML = `${ico('save')} <span>Actualizar Contraseña</span>`;
    });

    // --- Listener Botón Desactivar Cuenta ---
    deactivateButton.addEventListener('click', async () => {
        if (confirm('¿Está seguro de que desea desactivar su cuenta? Esta acción cambiará su estado a inactivo y le impedirá iniciar sesión.')) {
            deactivateButton.disabled = true;
            deactivateButton.innerHTML = `${ico('loader')} <span>Desactivando...</span>`;
            const result = await deactivateMyAccount();
            if (result.success) {
                alert('Su cuenta ha sido desactivada. Será redirigido a la página de inicio.');
                cerrarSesion(); // Desloguear al usuario
            } else {
                alert(`Error al desactivar la cuenta: ${result.message}`);
                deactivateButton.disabled = false;
                deactivateButton.innerHTML = `${ico('trash')} <span>Desactivar mi Cuenta</span>`;
            }
        }
    });
}


// ===== Helpers de UI (Iconos) =====
// (Debes tener esta función disponible, copiada de los otros archivos)
function ico(n: string) {
    const c = "class='h-5 w-5 flex-none'";
    const cSmall = "class='h-4 w-4 flex-none'"; // Para botones
    switch (n) {
        // Inputs
        case 'user':     return `<svg ${c} viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="7" r="4" stroke-width="2"/><path d="M6 21c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke-width="2"/></svg>`;
        case 'mail':     return `<svg ${c} viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke-width="2"/><polyline points="22,6 12,13 2,6" stroke-width="2"/></svg>`;
        case 'lock':     return `<svg ${c} viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke-width="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4" stroke-width="2"/></svg>`;
        case 'phone':    return `<svg ${c} viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" stroke-width="2"></path></svg>`;
        
        // Botones
        case 'edit':     return `<svg ${cSmall} viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke-width="2"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke-width="2"></path></svg>`;
        case 'save':     return `<svg ${cSmall} viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" stroke-width="2"></path><polyline points="17 21 17 13 7 13 7 21" stroke-width="2"></polyline><polyline points="7 3 7 8 15 8" stroke-width="2"></polyline></svg>`;
        case 'cancel':   return `<svg ${cSmall} viewBox="0 0 24 24" fill="none" stroke="currentColor"><line x1="18" y1="6" x2="6" y2="18" stroke-width="2"></line><line x1="6" y1="6" x2="18" y2="18" stroke-width="2"></line></svg>`;
        case 'alert':    return `<svg ${c} viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" stroke-width="2"></path><line x1="12" y1="9" x2="12" y2="13" stroke-width="2"></line><line x1="12" y1="17" x2="12.01" y2="17" stroke-width="2"></line></svg>`;
        case 'trash':    return `<svg ${cSmall} viewBox="0 0 24 24" fill="none" stroke="currentColor"><polyline points="3 6 5 6 21 6" stroke-width="2"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke-width="2"></path><line x1="10" y1="11" x2="10" y2="17" stroke-width="2"></line><line x1="14" y1="11" x2="14" y2="17" stroke-width="2"></line></svg>`;
        
        // Loader (animado)
        case 'loader':   return `<svg ${cSmall} viewBox="0 0 24 24" fill="none" stroke="currentColor" class="animate-spin"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" stroke-width="2"></path></svg>`;
        
        // (Iconos de otros módulos, por si acaso)
        case 'search':   return `<svg ${c} viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="11" cy="11" r="7" stroke-width="2"/><path d="M21 21l-4.3-4.3" stroke-width="2"/></svg>`;
        case 'calendar': return `<svg ${c} viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="4" width="18" height="18" rx="2" stroke-width="2"/><path d="M16 2v4M8 2v4M3 10h18" stroke-width="2"/></svg>`;
        case 'ticket':   return `<svg ${c} viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3 7h18v4a2 2 0 1 0 0 4v4H3v-4a2 2 0 1 0 0-4V7z" stroke-width="2"/><path d="M13 7v10" stroke-width="2"/></svg>`;
        case 'clock':    return `<svg ${c} viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="9" stroke-width="2"/><path d="M12 7v5l3 3" stroke-width="2"/></svg>`;
        case 'logout':   return `<svg ${cSmall} viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke-width="2"/><path d="M16 17l5-5-5-5" stroke-width="2"/><path d="M21 12H9" stroke-width="2"/></svg>`;
        case 'moon':     return `<svg ${c} viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z" stroke-width="2"/></svg>`;
        case 'shield':   return `<svg ${c} viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 3l8 4v5c0 5-3.5 9-8 9s-8-4-8-9V7l8-4z" stroke-width="2"/><path d="M9 12l2 2 4-4" stroke-width="2"/></svg>`;
        default: return '';
    }
}