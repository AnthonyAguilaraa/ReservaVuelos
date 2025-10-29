// src/pages/login.ts
import { iniciarSesion } from '../services/authService';
import { renderDashboard } from './dashboard';
import { renderRegistro } from './registro';

export function renderLogin(container: HTMLDivElement) {

    // --- Estilos de botones (adaptados del dashboard) ---
    const btnBase = [
        "w-full inline-flex items-center justify-center gap-2",
        "px-4 py-2.5 rounded-xl text-sm font-semibold",
        "transition-all duration-200 ring-1 ring-inset",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
    ].join(" ");

    const btnPrimary = [
        "text-white bg-gradient-to-r from-sky-600 to-indigo-700",
        "ring-sky-700/30 shadow-md shadow-sky-900/20",
        "hover:from-sky-700 hover:to-indigo-800",
        "focus-visible:ring-sky-500",
    ].join(" ");

    const btnSecondary = [
        "text-slate-700 dark:text-slate-200",
        "bg-white/70 dark:bg-slate-900/40 backdrop-blur",
        "hover:bg-white dark:hover:bg-slate-900",
        "ring-slate-200/70 dark:ring-slate-800",
        "focus-visible:ring-sky-500",
    ].join(" ");

    // --- Estilo de Inputs (adaptado del dashboard) ---
    const inputBase = [
        "w-full rounded-xl border border-slate-200/70 dark:border-slate-700",
        "bg-white/70 dark:bg-slate-900/40",
        "pl-10 pr-3 py-2 text-sm text-slate-700 dark:text-slate-200",
        "placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500",
    ].join(" ");

    // --- HTML con el nuevo diseño de pantalla dividida ---
    container.innerHTML = `
    <div class="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white">
        
        <div class="flex flex-col items-center justify-center p-6 sm:p-12 relative">
            
            <button id="theme-toggle" class="absolute top-4 right-4 inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold ring-1 ring-inset ring-slate-200/70 dark:ring-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800">
                ${ico('moon')}
            </button>

            <div class="max-w-md w-full">
                
                <div class="flex items-center gap-3 mb-8">
                    <div class="h-10 w-10 grid place-items-center rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 flex-none">
                        ${logo()}
                    </div>
                    <div>
                        <h2 class="text-2xl font-extrabold text-slate-900 dark:text-white">Aerolínea Dashboard</h2>
                        <p class="text-sm text-slate-500 dark:text-slate-400">Bienvenido. Ingrese a su cuenta.</p>
                    </div>
                </div>

                <div class="rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-white/70 dark:bg-slate-900/50 backdrop-blur shadow-xl">
                    
                    <form id="login-form" class="p-6 md:p-8 space-y-5">
                        <div>
                            <label for="correo" class="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
                                Correo Electrónico
                            </label>
                            <div class="relative">
                                <span class="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                                    ${ico('mail')}
                                </span>
                                <input type="email" id="correo" name="correo" required 
                                       class="${inputBase}">
                            </div>
                        </div>
                        
                        <div>
                            <label for="clave" class="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
                                Contraseña
                            </label>
                            <div class="relative">
                                 <span class="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                                    ${ico('lock')}
                                </span>
                                <input type="password" id="clave" name="clave" required
                                       class="${inputBase}">
                            </div>
                        </div>
                        
                        <button type="submit" class="${btnBase} ${btnPrimary}">
                            Ingresar al Sistema
                        </button>
                        <p id="login-error-message" class="text-rose-500 text-sm text-center h-5"></p>
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
                        <button type="button" id="btn-ir-registro" class="${btnBase} ${btnSecondary}">
                            Registrarse por primera vez
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
            <h1 class="text-4xl font-extrabold mb-4">Bienvenido a Bordo</h1>
            <p class="text-lg text-sky-100 max-w-sm">
                Su portal exclusivo para la gestión de vuelos, reservas y más.
            </p>
        </div>

    </div>
    `;

    // --- Lógica de eventos (Sin cambios) ---

    const loginForm = container.querySelector<HTMLFormElement>('#login-form');
    const errorMessage = container.querySelector<HTMLParagraphElement>('#login-error-message');
    const btnIrARegistro = container.querySelector<HTMLButtonElement>('#btn-ir-registro');

    loginForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!errorMessage) return;

        const correo = (container.querySelector<HTMLInputElement>('#correo'))!.value;
        const clave = (container.querySelector<HTMLInputElement>('#clave'))!.value;

        errorMessage.textContent = 'Validando...';
        errorMessage.classList.remove('text-rose-500'); 
        errorMessage.classList.add('text-slate-600'); 

        const result = await iniciarSesion(correo, clave);

        if (result.success) {
            container.innerHTML = '';
            renderDashboard(container); // Muestra el dashboard
        } else {
            errorMessage.textContent = result.message; 
            errorMessage.classList.add('text-rose-500'); 
            errorMessage.classList.remove('text-slate-600');
        }
    });

    btnIrARegistro?.addEventListener('click', () => {
        container.innerHTML = '';
        renderRegistro(container); // Muestra el formulario de registro
    });

    // Theme toggle + persistencia (copiado del dashboard)
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    container.querySelector('#theme-toggle')?.addEventListener('click', () => {
        const isDark = document.documentElement.classList.toggle('dark');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    });

    // --- Helpers de UI (Sin cambios) ---
    function ico(n: string) {
        const c = "class='h-5 w-5 flex-none'";
        switch (n) {
            case 'mail':     return `<svg ${c} viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke-width="2"/><polyline points="22,6 12,13 2,6" stroke-width="2"/></svg>`;
            case 'lock':     return `<svg ${c} viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke-width="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4" stroke-width="2"/></svg>`;
            case 'search':   return `<svg ${c} viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="11" cy="11" r="7" stroke-width="2"/><path d="M21 21l-4.3-4.3" stroke-width="2"/></svg>`;
            case 'calendar': return `<svg ${c} viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="4" width="18" height="18" rx="2" stroke-width="2"/><path d="M16 2v4M8 2v4M3 10h18" stroke-width="2"/></svg>`;
            case 'ticket':   return `<svg ${c} viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3 7h18v4a2 2 0 1 0 0 4v4H3v-4a2 2 0 1 0 0-4V7z" stroke-width="2"/><path d="M13 7v10" stroke-width="2"/></svg>`;
            case 'clock':    return `<svg ${c} viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="9" stroke-width="2"/><path d="M12 7v5l3 3" stroke-width="2"/></svg>`;
            case 'user':     return `<svg ${c} viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="7" r="4" stroke-width="2"/><path d="M6 21c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke-width="2"/></svg>`;
            case 'logout':   return `<svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke-width="2"/><path d="M16 17l5-5-5-5" stroke-width="2"/><path d="M21 12H9" stroke-width="2"/></svg>`;
            case 'moon':     return `<svg ${c} viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z" stroke-width="2"/></svg>`;
            case 'shield':   return `<svg ${c} viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 3l8 4v5c0 5-3.5 9-8 9s-8-4-8-9V7l8-4z" stroke-width="2"/><path d="M9 12l2 2 4-4" stroke-width="2"/></svg>`;
            default: return '';
        }
    }
    function logo() {
        return `<svg class="h-5 w-5" viewBox="0 0 32 32" fill="currentColor"><path d="M3 18c9-2 15-6 23-14l3 3C22 15 18 21 17 29h-4l1-7-7 1v-4l5-5H3z"/></svg>`;
    }
}