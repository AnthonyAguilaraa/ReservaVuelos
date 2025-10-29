// src/pages/dashboard.ts
import { cerrarSesion } from '../services/authService';
import { renderConsultaVuelos } from './consultaVuelos';
import { renderReservaVuelos } from './reservaVuelos';
import { renderCompraBilletes } from './compraBilletes';
import { renderHistorialCompras } from './historialCompras';
import { renderPerfilUsuario } from './perfilUsuario';

export function renderDashboard(container: HTMLDivElement) {
  const navBtnBase = [
    "group w-full inline-flex items-center gap-3",
    "px-3 py-2 rounded-xl text-sm font-semibold",
    "transition-all duration-200 ring-1 ring-inset",
    "focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500",
  ].join(" ");

  const navBtnIdle = [
    "text-slate-700 dark:text-slate-200",
    "bg-white/70 dark:bg-slate-900/40 backdrop-blur",
    "hover:bg-white dark:hover:bg-slate-900",
    "ring-slate-200/70 dark:ring-slate-800",
  ].join(" ");

  const navBtnActive = [
    "text-white bg-gradient-to-r from-sky-600 to-indigo-700",
    "ring-sky-700/30 shadow-md shadow-sky-900/20",
  ].join(" ");

  container.innerHTML = `
  <div class="min-h-screen bg-slate-50 dark:bg-slate-950">
    <div class="grid min-h-screen grid-cols-1 lg:grid-cols-[260px_1fr]">

      <!-- SIDEBAR -->
      <aside class="border-b lg:border-b-0 lg:border-r border-slate-200/70 dark:border-slate-800 bg-white/80 dark:bg-slate-900/60 backdrop-blur">
        <div class="p-4 flex items-center gap-3">
          <div class="h-10 w-10 grid place-items-center rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900">
            ${logo()}
          </div>
          <div>
            <h2 class="text-base font-extrabold text-slate-900 dark:text-white">Aerolínea Dashboard</h2>
            <p class="text-[11px] text-slate-500 dark:text-slate-400">Operaciones • Reservas</p>
          </div>
        </div>

        <nav class="p-3 space-y-2" aria-label="Navegación principal">
          <button id="btn-consulta" class="${navBtnBase} ${navBtnIdle}">
            ${ico('search')} <span>Consulta de Vuelos</span>
            ${chev()}
          </button>
          <button id="btn-reserva" class="${navBtnBase} ${navBtnIdle}">
            ${ico('calendar')} <span>Reserva de Vuelos</span>
            ${chev()}
          </button>
          <button id="btn-compra" class="${navBtnBase} ${navBtnIdle}">
            ${ico('ticket')} <span>Compra de Billetes</span>
            ${chev()}
          </button>
          <button id="btn-historial" class="${navBtnBase} ${navBtnIdle}">
            ${ico('clock')} <span>Mi Historial</span>
            ${chev()}
          </button>
          <button id="btn-perfil" class="${navBtnBase} ${navBtnIdle}">
            ${ico('user')} <span>Modificar mi Registro</span>
            ${chev()}
          </button>
        </nav>

        <div class="p-4 mt-auto hidden lg:block">
          <div class="rounded-xl border border-slate-200/70 dark:border-slate-800 p-3 text-xs text-slate-600 dark:text-slate-300">
            ${ico('shield')} Sesión segura • TLS 1.3
          </div>
        </div>
      </aside>

      <!-- MAIN -->
      <main class="flex flex-col">
        <!-- TOPBAR -->
        <header class="border-b border-slate-200/70 dark:border-slate-800 bg-white/80 dark:bg-slate-900/60 backdrop-blur">
          <div class="px-4 py-3 flex flex-wrap items-center gap-3 justify-between">
            <div class="flex items-center gap-3">
              <h1 class="text-lg md:text-xl font-extrabold text-slate-900 dark:text-white">Panel de Control</h1>
              <nav class="hidden md:block text-xs text-slate-500 dark:text-slate-400">
                <ol class="flex items-center gap-2">
                  <li class="font-semibold text-slate-700 dark:text-slate-200">Inicio</li>
                  <li>/</li>
                  <li>Reservas</li>
                </ol>
              </nav>
            </div>

            <div class="flex items-center gap-2 w-full md:w-auto">
              <div class="relative flex-1 md:flex-none">
                <input id="global-search" placeholder="Buscar vuelos, reservas, clientes…" class="w-full md:w-80 rounded-xl border border-slate-200/70 dark:border-slate-700 bg-white/70 dark:bg-slate-900/40 px-3 py-2 pl-9 text-sm text-slate-700 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500" />
                <span class="pointer-events-none absolute inset-y-0 left-0 pl-2 flex items-center text-slate-400">${ico('search')}</span>
              </div>
              <button id="theme-toggle" class="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold ring-1 ring-inset ring-slate-200/70 dark:ring-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800">
                ${ico('moon')} <span>Tema</span>
              </button>
              <button id="btn-logout" class="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-rose-500">
                ${ico('logout')} <span>Salir</span>
              </button>
            </div>
          </div>
        </header>

        <!-- CONTENT -->
        <section id="content-area" class="p-4 md:p-6">
          <!-- Vista inicial tipo dashboard -->
          <div id="home-dashboard" class="space-y-6">
            <!-- KPIs -->
            <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              ${kpiCard("Reservas hoy", "128", "▲ 8.4%", "positivo")}
              ${kpiCard("Ingresos (USD)", "$24.3k", "▲ 3.1%", "positivo")}
              ${kpiCard("Cancelaciones", "6", "▼ 1.2%", "negativo")}
              ${kpiCard("Puntualidad", "92%", "▲ 0.9%", "positivo")}
            </div>

            <!-- Secciones rápidas -->
            <div class="grid gap-4 lg:grid-cols-3">
              <div class="rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-white/70 dark:bg-slate-900/50 p-4">
                <div class="flex items-center justify-between mb-3">
                  <h3 class="font-semibold text-slate-800 dark:text-slate-100">Acciones rápidas</h3>
                </div>
                <div class="grid grid-cols-2 gap-3">
                  <button id="quick-consulta" class="rounded-xl px-3 py-2 text-sm font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center gap-2">
                    ${ico('search')} Consulta
                  </button>
                  <button id="quick-reserva" class="rounded-xl px-3 py-2 text-sm font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center gap-2">
                    ${ico('calendar')} Nueva reserva
                  </button>
                  <button id="quick-compra" class="rounded-xl px-3 py-2 text-sm font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center gap-2">
                    ${ico('ticket')} Compra
                  </button>
                  <button id="quick-perfil" class="rounded-xl px-3 py-2 text-sm font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center gap-2">
                    ${ico('user')} Perfil
                  </button>
                </div>
              </div>

              <div class="rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-white/70 dark:bg-slate-900/50 p-4 lg:col-span-2">
                <div class="flex items-center justify-between mb-3">
                  <h3 class="font-semibold text-slate-800 dark:text-slate-100">Resumen de operaciones</h3>
                </div>
                <div class="grid sm:grid-cols-2 gap-3 text-sm text-slate-600 dark:text-slate-300">
                  <div class="rounded-xl border border-slate-200/70 dark:border-slate-800 p-3 flex items-center justify-between">
                    <span>Vuelos activos</span><strong>34</strong>
                  </div>
                  <div class="rounded-xl border border-slate-200/70 dark:border-slate-800 p-3 flex items-center justify-between">
                    <span>Asientos disponibles</span><strong>1,186</strong>
                  </div>
                  <div class="rounded-xl border border-slate-200/70 dark:border-slate-800 p-3 flex items-center justify-between">
                    <span>Check-ins en curso</span><strong>472</strong>
                  </div>
                  <div class="rounded-xl border border-slate-200/70 dark:border-slate-800 p-3 flex items-center justify-between">
                    <span>Incidencias</span><strong>2</strong>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </section>

        <!-- FOOTER -->
        <footer class="mt-auto border-t border-slate-200/70 dark:border-slate-800 px-4 py-3 text-xs text-slate-500 dark:text-slate-400">
          Aerolínea • Centro UIO • © ${new Date().getFullYear()}
        </footer>
      </main>
    </div>
  </div>
  `;

  // ==== Wiring ====
  const contentArea = container.querySelector<HTMLDivElement>('#content-area')!;
  const homeDashboard = container.querySelector<HTMLDivElement>('#home-dashboard')!;

  const setActive = (activeId: string) => {
    document.querySelectorAll<HTMLButtonElement>('aside nav button').forEach(btn => {
      const isActive = btn.id === activeId;
      btn.classList.remove(...navBtnIdle.split(' ').filter(Boolean));
      btn.classList.remove(...navBtnActive.split(' ').filter(Boolean));
      btn.classList.add(...(isActive ? navBtnActive : navBtnIdle).split(' ').filter(Boolean));
      btn.setAttribute('aria-current', isActive ? 'page' : 'false');
    });
  };

  const showLoader = () => {
    contentArea.innerHTML = `
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        ${Array.from({length: 6}).map(() => `
          <div class="rounded-2xl border border-slate-200/70 dark:border-slate-800 p-4">
            <div class="h-4 w-1/3 bg-slate-200/80 dark:bg-slate-800 animate-pulse rounded mb-3"></div>
            <div class="h-3 w-2/3 bg-slate-200/80 dark:bg-slate-800 animate-pulse rounded mb-2"></div>
            <div class="h-3 w-1/2 bg-slate-200/80 dark:bg-slate-800 animate-pulse rounded"></div>
          </div>
        `).join('')}
      </div>
    `;
  };

  const route = (id: string, render: (el: HTMLDivElement) => void) => {
    setActive(id);
    showLoader();
    setTimeout(() => {
      contentArea.innerHTML = '';
      render(contentArea);
    }, 220);
  };

  // Sidebar routes
  container.querySelector('#btn-consulta')?.addEventListener('click', () => route('btn-consulta', renderConsultaVuelos));
  container.querySelector('#btn-reserva')?.addEventListener('click', () => route('btn-reserva', renderReservaVuelos));
  container.querySelector('#btn-compra')?.addEventListener('click', () => route('btn-compra', renderCompraBilletes));
  container.querySelector('#btn-historial')?.addEventListener('click', () => route('btn-historial', renderHistorialCompras));
  container.querySelector('#btn-perfil')?.addEventListener('click', () => route('btn-perfil', renderPerfilUsuario));

  // Quick actions
  container.querySelector('#quick-consulta')?.addEventListener('click', () => (container.querySelector('#btn-consulta') as HTMLButtonElement)?.click());
  container.querySelector('#quick-reserva')?.addEventListener('click', () => (container.querySelector('#btn-reserva') as HTMLButtonElement)?.click());
  container.querySelector('#quick-compra')?.addEventListener('click', () => (container.querySelector('#btn-compra') as HTMLButtonElement)?.click());
  container.querySelector('#quick-perfil')?.addEventListener('click', () => (container.querySelector('#btn-perfil') as HTMLButtonElement)?.click());

  // Logout
  container.querySelector('#btn-logout')?.addEventListener('click', () => cerrarSesion());

  // Theme toggle + persistencia
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) document.documentElement.classList.toggle('dark', savedTheme === 'dark');
  container.querySelector('#theme-toggle')?.addEventListener('click', () => {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  });

  // Buscador global (callback libre para que lo conectes después)
  container.querySelector<HTMLInputElement>('#global-search')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const q = (e.target as HTMLInputElement).value.trim();
      if (!q) return;
      // Por defecto, abrimos "Consulta de Vuelos"
      (container.querySelector('#btn-consulta') as HTMLButtonElement)?.click();
      // Aquí podrías pasar q a tu módulo de consulta
      // renderConsultaVuelos(contentArea, q);
    }
  });

  // ===== Helpers de UI =====
  function kpiCard(title: string, value: string, delta: string, tipo: "positivo" | "negativo") {
    const deltaColor = tipo === "positivo" ? "text-emerald-600" : "text-rose-600";
    const deltaIcon  = tipo === "positivo" ? "▲" : "▼";
    return `
      <div class="rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-white/70 dark:bg-slate-900/50 p-4">
        <p class="text-xs font-semibold text-slate-500 dark:text-slate-400">${title}</p>
        <div class="mt-1 flex items-end justify-between">
          <h4 class="text-2xl font-extrabold text-slate-900 dark:text-white">${value}</h4>
          <span class="text-xs ${deltaColor} font-bold">${deltaIcon} ${delta}</span>
        </div>
      </div>
    `;
  }

  function ico(n: string) {
    const c = "class='h-5 w-5 flex-none'";
    switch (n) {
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
  function chev() {
    return `<svg class="ml-auto h-4 w-4 opacity-60 group-hover:opacity-100" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M9 6l6 6-6 6" stroke-width="2"/></svg>`;
  }
  function logo() {
    return `<svg class="h-5 w-5" viewBox="0 0 32 32" fill="currentColor"><path d="M3 18c9-2 15-6 23-14l3 3C22 15 18 21 17 29h-4l1-7-7 1v-4l5-5H3z"/></svg>`;
  }
}
