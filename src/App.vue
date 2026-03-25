<template>
  <div class="app-layout">
    <!-- Overlay mobile -->
    <Transition name="fade">
      <div v-if="sidebarOpen" class="sidebar-overlay" @click="sidebarOpen = false" />
    </Transition>

    <!-- Sidebar -->
    <Transition name="slide">
      <AppSidebar v-show="sidebarOpen || isDesktop" :class="{ 'mobile-sidebar': !isDesktop }"
        @close="sidebarOpen = false" />
    </Transition>

    <!-- Main -->
    <div class="main-wrapper">
      <!-- Topbar mobile -->
      <header class="mobile-topbar">
        <button class="hamburger" @click="sidebarOpen = !sidebarOpen" aria-label="Menú">
          <span :class="['bar', { open: sidebarOpen }]"></span>
          <span :class="['bar', { open: sidebarOpen }]"></span>
          <span :class="['bar', { open: sidebarOpen }]"></span>
        </button>
        <div class="topbar-logo" @click="router.push('/')">
          <span>⚔️</span>
          <span class="topbar-title">LoL <span class="topbar-accent">Stats</span></span>
        </div>
      </header>

      <main class="main-content">
        <RouterView v-slot="{ Component }">
          <Transition name="page-slide" mode="out-in">
            <component :is="Component" :key="$route.path" />
          </Transition>
        </RouterView>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import AppSidebar from './components/Appsidebar.vue'

const router = useRouter()
const sidebarOpen = ref(false)
const isDesktop = ref(window.innerWidth >= 769)

function onResize() {
  isDesktop.value = window.innerWidth >= 769
  if (isDesktop.value) sidebarOpen.value = false
}

onMounted(() => window.addEventListener('resize', onResize))
onUnmounted(() => window.removeEventListener('resize', onResize))

// Cerrar sidebar al navegar en mobile
router.afterEach(() => {
  if (!isDesktop.value) sidebarOpen.value = false
})
</script>

<style>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  background: #07080f;
  font-family: 'Segoe UI', system-ui, sans-serif;
  color: #e8e0c8;
  -webkit-font-smoothing: antialiased;
}

::-webkit-scrollbar {
  width: 5px;
  height: 5px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: #1e2840;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #c8973a;
}

.app-layout {
  display: flex;
  min-height: 100vh;
  position: relative;
}

/* Overlay oscuro detrás del sidebar en mobile */
.sidebar-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  z-index: 49;
  backdrop-filter: blur(2px);
}

/* Mobile: sidebar flota sobre el contenido */
.mobile-sidebar {
  position: fixed !important;
  top: 0;
  left: 0;
  height: 100vh;
  z-index: 50;
}

.main-wrapper {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

/* Topbar solo visible en mobile */
.mobile-topbar {
  display: none;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: #080c18;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  position: sticky;
  top: 0;
  z-index: 40;
}

.hamburger {
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 5px;
  padding: 4px;
}

.bar {
  display: block;
  width: 20px;
  height: 1.5px;
  background: #6b7a99;
  border-radius: 2px;
  transition: all 0.2s ease;
  transform-origin: center;
}

.bar:nth-child(1).open {
  transform: translateY(6.5px) rotate(45deg);
  background: #c8973a;
}

.bar:nth-child(2).open {
  opacity: 0;
  transform: scaleX(0);
}

.bar:nth-child(3).open {
  transform: translateY(-6.5px) rotate(-45deg);
  background: #c8973a;
}

.topbar-logo {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  cursor: pointer;
  font-family: 'Georgia', serif;
  font-size: 1.1rem;
  font-weight: 800;
  color: #e8e0c8;
}

.topbar-accent {
  color: #c8973a;
}

.main-content {
  flex: 1;
  overflow-x: hidden;
}

/* ─── Transiciones de sidebar/overlay ─────────────── */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.25s ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(-100%);
}

/* ─── Transición de páginas (entra desde la derecha) ─ */
.page-slide-enter-active {
  transition: transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.4s ease;
}

.page-slide-leave-active {
  transition: transform 0.25s ease, opacity 0.25s ease;
}

.page-slide-enter-from {
  transform: translateX(60px);
  opacity: 0;
}

.page-slide-enter-to {
  transform: translateX(0);
  opacity: 1;
}

.page-slide-leave-from {
  transform: translateX(0);
  opacity: 1;
}

.page-slide-leave-to {
  transform: translateX(-30px);
  opacity: 0;
}

@media (max-width: 768px) {
  .mobile-topbar {
    display: flex;
  }
}
</style>