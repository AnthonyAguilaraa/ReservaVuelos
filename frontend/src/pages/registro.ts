// src/pages/registro.ts
import { registrarUsuario } from '../services/authService';
import { renderLogin } from './login';

// --- Estilos de UI (Botones, Inputs) ---
const btnBase = [
    "w-full inline-flex items-center justify-center gap-2",
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

const btnSecondary = [ // Blanco/Slate
    "text-slate-700 dark:text-slate-200",
    "bg-white/70 dark:bg-slate-900/40 backdrop-blur",
    "hover:bg-white dark:hover:bg-slate-900",
    "ring-slate-200/70 dark:ring-slate-800",
    "focus-visible:ring-sky-500",
].join(" ");

const inputBase = [ // Con padding para icono
    "w-full rounded-xl border",
    "bg-white/70 dark:bg-slate-900/40",
    "pl-10 pr-3 py-2 text-sm text-slate-700 dark:text-slate-200",
    "placeholder:text-slate-400 focus:outline-none focus:ring-2",
    "transition-colors duration-200", // Añadido para la validación
].join(" ");

const inputBaseNoIcon = inputBase.replace("pl-10", "px-3");

// Clases de borde para validación (copiadas de perfilUsuario)
const defaultBorder = ['border-slate-200/70', 'dark:border-slate-700', 'focus:ring-sky-500'];
const redBorder = ['border-rose-500', 'dark:border-rose-600', 'focus:ring-rose-500'];
const greenBorder = ['border-emerald-500', 'dark:border-emerald-600', 'focus:ring-emerald-500'];


/**
 * Valida la fortaleza de una contraseña.
 * (Tu función original, sin cambios)
 */
function validarClave(clave: string): boolean {
    const minLength = 8;
    const hasUppercase = /[A-Z]/.test(clave);
    const hasLowercase = /[a-z]/.test(clave);
    const hasNumber = /[0-9]/.test(clave);
    const hasSpecialChar = /[^A-Za-z0-9]/.test(clave); 

    return (
        clave.length >= minLength &&
        hasUppercase &&
        hasLowercase &&
        hasNumber &&
        hasSpecialChar
    );
}

export function renderRegistro(container: HTMLDivElement) {
    container.innerHTML = `
    <div class="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white">
        
        <div class="flex flex-col items-center justify-center p-6 sm:p-12 relative overflow-y-auto">
            
            <button id="theme-toggle" class="absolute top-4 right-4 inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold ring-1 ring-inset ring-slate-200/70 dark:ring-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800">
                ${ico('moon')}
            </button>

            <div class="max-w-md w-full">

                <div class="flex items-center gap-3 mb-8">
                    <div class="h-10 w-10 grid place-items-center rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 flex-none">
                        ${logo()}
                    </div>
                    <div>
                        <h2 class="text-2xl font-extrabold text-slate-900 dark:text-white">Registro de Usuario</h2>
                        <p class="text-sm text-slate-500 dark:text-slate-400">Complete sus datos para crear una cuenta.</p>
                    </div>
                </div>

                <div class="rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-white/70 dark:bg-slate-900/50 backdrop-blur shadow-xl">
                    
                    <form id="registro-form" class="p-6 md:p-8 space-y-5">
                        
                        <div>
                            <label for="nombre" class="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Nombre Completo:</label>
                            <div class="relative">
                                <span class="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">${ico('user')}</span>
                                <input type="text" id="nombre" name="nombre" required class="${inputBase} ${defaultBorder.join(' ')}">
                            </div>
                        </div>

                        <div>
                            <label for="correo-reg" class="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Correo Electrónico:</label>
                             <div class="relative">
                                <span class="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">${ico('mail')}</span>
                                <input type="email" id="correo-reg" name="correo" required class="${inputBase} ${defaultBorder.join(' ')}">
                            </div>
                        </div>

                        <div>
                            <label for="clave-reg" class="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Contraseña:</label>
                            <div class="relative">
                                <span class="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">${ico('lock')}</span>
                                <input type="password" id="clave-reg" name="clave" required 
                                       class="${inputBase} ${defaultBorder.join(' ')}"
                                       aria-describedby="clave-hint">
                            </div>
                            <p id="clave-hint" class="text-xs text-slate-500 dark:text-slate-400 mt-2">
                                Mín. 8 caracteres, 1 mayús, 1 minús, 1 núm y 1 símbolo.
                            </p>
                        </div>
                        
                        <div>
                            <label for="confirmar-clave-reg" class="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Confirmar Contraseña:</label>
                            <div class="relative">
                                <span class="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">${ico('lock')}</span>
                                <input type="password" id="confirmar-clave-reg" name="confirmarClave" required class="${inputBase} ${defaultBorder.join(' ')}">
                            </div>
                        </div>

                        <div>
                            <label for="telefono" class="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Teléfono (Opcional):</label>
                            <div class="relative">
                                <span class="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">${ico('phone')}</span>
                                <input type="tel" id="telefono" name="telefono" class="${inputBase} ${defaultBorder.join(' ')}">
                            </div>
                        </div>
                        
                        <button type="submit" class="${btnBase} ${btnPrimary}">
                            ${ico('user-plus')} <span>Crear Cuenta</span>
                        </button>
                        
                        <p id="registro-message" class="text-sm text-center h-5"></p>
                    </form>
                    
                    <div class="relative pb-6 md:pb-8 px-6 md:px-8">
                        <div class="absolute inset-0 flex items-center px-6 md:px-8">
                            <div class="w-full border-t border-slate-200/70 dark:border-slate-800"></div>
                        </div>
                        <div class="relative flex justify-center text-sm">
                            <span class="px-2 bg-white/0 backdrop-blur-sm text-slate-500 dark:text-slate-400">o</span>
                        </div>
                    </div>

                    <div class="p-6 md:p-8 pt-0">
                        <button type="button" id="btn-volver-login" class="${btnBase} ${btnSecondary}">
                            ${ico('arrow-left')} <span>Volver a Iniciar Sesión</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="hidden lg:flex flex-col items-center justify-center bg-gradient-to-br from-sky-600 to-indigo-700 p-12 text-white text-center">
            <div class="mb-6">
                <svg class="h-24 w-24 text-sky-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
            </div>
            <h1 class="text-4xl font-extrabold mb-4">Un Nuevo Viaje Comienza</h1>
            <p class="text-lg text-sky-100 max-w-sm">
                Cree su cuenta para acceder a beneficios y gestione sus reservas fácilmente.
            </p>
        </div>

    </div>
    `;

    // --- Lógica de eventos (Sin cambios) ---
    
    const registroForm = container.querySelector<HTMLFormElement>('#registro-form');
    const messageEl = container.querySelector<HTMLParagraphElement>('#registro-message');
    const btnVolverLogin = container.querySelector<HTMLButtonElement>('#btn-volver-login');
    const claveInput = container.querySelector<HTMLInputElement>('#clave-reg');
    const submitButton = registroForm?.querySelector<HTMLButtonElement>('button[type="submit"]');

    claveInput?.addEventListener('input', () => {
        const clave = claveInput.value;
        claveInput.classList.remove(...defaultBorder, ...redBorder, ...greenBorder);
        if (clave.length === 0) {
            claveInput.classList.add(...defaultBorder);
            return;
        }
        if (validarClave(clave)) {
            claveInput.classList.add(...greenBorder);
        } else {
            claveInput.classList.add(...redBorder);
        }
    });

    registroForm?.addEventListener('submit', async (e) => {
        e.preventDefault(); 
        if (!messageEl || !submitButton) return;

        const nombre = (container.querySelector<HTMLInputElement>('#nombre'))!.value;
        const correo = (container.querySelector<HTMLInputElement>('#correo-reg'))!.value;
        const clave = (container.querySelector<HTMLInputElement>('#clave-reg'))!.value;
        const confirmarClave = (container.querySelector<HTMLInputElement>('#confirmar-clave-reg'))!.value;
        const telefono = (container.querySelector<HTMLInputElement>('#telefono'))!.value.trim(); 

        messageEl.className = 'text-center text-sm mt-3 h-5 text-rose-600'; 

        if (clave !== confirmarClave) {
            messageEl.textContent = 'Las contraseñas no coinciden.';
            return;
        }

        if (!validarClave(clave)) {
            messageEl.textContent = 'La contraseña no cumple los requisitos.';
            return;
        }

        messageEl.textContent = 'Registrando...';
        messageEl.className = 'text-center text-sm mt-3 h-5 text-sky-600';
        submitButton.disabled = true;
        submitButton.innerHTML = `${ico('loader')} <span>Registrando...</span>`;

        const datos = { nombre, correo, clave, telefono };
        const result = await registrarUsuario(datos);
        
        submitButton.disabled = false;
        submitButton.innerHTML = `${ico('user-plus')} <span>Crear Cuenta</span>`;

        if (result.success) {
            messageEl.textContent = `${result.message}. Será redirigido al login.`;
            messageEl.className = 'text-center text-sm mt-3 h-5 text-emerald-600';
            
            setTimeout(() => {
                container.innerHTML = '';
                renderLogin(container);
            }, 3000);
        } else {
            messageEl.textContent = result.message;
            messageEl.className = 'text-center text-sm mt-3 h-5 text-rose-600';
        }
    });

    btnVolverLogin?.addEventListener('click', () => {
        container.innerHTML = '';
        renderLogin(container);
    });

    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    container.querySelector('#theme-toggle')?.addEventListener('click', () => {
        const isDark = document.documentElement.classList.toggle('dark');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    });
}


// ===== Helpers de UI (Iconos) =====
function ico(n: string) {
    const c = "class='h-5 w-5 flex-none'";
    const cSmall = "class='h-4 w-4 flex-none'";
    switch (n) {
        // Inputs
        case 'user':       return `<svg ${c} viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="7" r="4" stroke-width="2"/><path d="M6 21c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke-width="2"/></svg>`;
        case 'mail':       return `<svg ${c} viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke-width="2"/><polyline points="22,6 12,13 2,6" stroke-width="2"/></svg>`;
        case 'lock':       return `<svg ${c} viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke-width="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4" stroke-width="2"/></svg>`;
        case 'phone':      return `<svg ${c} viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" stroke-width="2"></path></svg>`;
        
        // Botones
        case 'user-plus':  return `<svg ${cSmall} viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke-width="2"/><circle cx="8.5" cy="7" r="4" stroke-width="2"/><line x1="20" y1="8" x2="20" y2="14" stroke-width="2"/><line x1="17" y1="11" x2="23" y2="11" stroke-width="2"/></svg>`;
        case 'arrow-left': return `<svg ${cSmall} viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M19 12H5" stroke-width="2"/><path d="M12 19l-7-7 7-7" stroke-width="2"/></svg>`;
        case 'loader':     return `<svg ${cSmall} viewBox="0 0 24 24" fill="none" stroke="currentColor" class="animate-spin"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" stroke-width="2"></path></svg>`;
        case 'moon':       return `<svg ${c} viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z" stroke-width="2"/></svg>`;
        
        default: return '';
    }
}

function logo() {
    return `<svg class="h-5 w-5" viewBox="0 0 32 32" fill="currentColor"><path d="M3 18c9-2 15-6 23-14l3 3C22 15 18 21 17 29h-4l1-7-7 1v-4l5-5H3z"/></svg>`;
}