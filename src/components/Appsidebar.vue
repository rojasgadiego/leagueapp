<template>
    <div class="sidebar-wrapper">
        <aside class="sidebar" :class="sidebarTheme">
            <div class="sidebar-top">
                <button class="icon-btn logo-btn" @click="navigate('/')" title="Inicio">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                        stroke-linejoin="round">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                        <polyline points="9 22 9 12 15 12 15 22"></polyline>
                    </svg>
                </button>
            </div>

            <div class="sidebar-divider"></div>

            <nav class="sidebar-nav">

                <button class="icon-btn game-btn lol" :class="{ active: route.name === 'leagueoflegens' }"
                    @click="navigate('/leagueoflegens')" title="League of Legends">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2L4.5 20.29L5.21 21L12 18L18.79 21L19.5 20.29L12 2Z" />
                    </svg>
                </button>

                <button class="icon-btn game-btn valorant" :class="{ active: route.name === 'valorant' }"
                    @click="navigate('/valorant')" title="Valorant">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2L2 22h4L12 8l6 14h4L12 2z" />
                    </svg>
                </button>

                <button class="icon-btn game-btn tft" :class="{ active: route.path.startsWith('/tft') }"
                    @click="navigate('/tft')" title="Teamfight Tactics">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2L21.5 7.5V16.5L12 22L2.5 16.5V7.5L12 2ZM12 4.5L4.5 8.75V15.25L12 19.5L19.5 15.25V8.75L12 4.5Z"/>
                    </svg>
                </button>

            </nav>

            <div class="sidebar-divider"></div>

        </aside>
    </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

function navigate(path) {
    router.push(path)
}

const sidebarTheme = computed(() => {
    if (route.path.startsWith('/valorant')) {
        return 'theme-valorant'
    }
    if (route.path.startsWith('/leagueoflegens') || 
        route.path.startsWith('/summoner') || 
        route.path.startsWith('/match') || 
        route.path.startsWith('/compare') || 
        route.path.startsWith('/live') || 
        route.path.startsWith('/builds')) {
        return 'theme-lol'
    }
    return 'theme-default'
})
</script>

<style scoped>
.sidebar-wrapper {
    width: 80px;
    height: 100vh;
    position: sticky;
    top: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    padding: 12px 0;
    background-color: transparent
}

.sidebar {
    width: 60px;
    height: calc(100% - 24px);
    border-radius: 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.05);
    /* Transición suave entre colores */
    background-color: transparent;
    transition: background-color 0.4s ease;
}

.sidebar.theme-lol {
    background-color: #c8973a;
}

.sidebar.theme-valorant {
    background-color: #FF4655;
}

.sidebar.theme-default {
    background-color:transparent;
}

.sidebar-top {
    width: 100%;
    display: flex;
    justify-content: center;
    /* Centra el botón del logo */
    margin-bottom: 8px;
}

.sidebar-nav {
    display: flex;
    flex-direction: column;
    align-items: center;
    /* Centra los botones de navegación */
    gap: 12px;
    width: 100%;
}

.sidebar-divider {
    width: 24px;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
    margin: 1rem 0;
    flex-shrink: 0;
}

.sidebar-friends {
    display: flex;
    flex-direction: column;
    align-items: center;
    /* Centra los avatares de amigos */
    gap: 10px;
    width: 100%;
    overflow-y: auto;
}

/* Estilos de botones centrados internamente */
.icon-btn {
    width: 44px;
    height: 44px;
    border-radius: 12px;
    background: transparent;
    border: none;
    color: #ffffff;
    cursor: pointer;
    display: flex;
    align-items: center;
    /* Centrado vertical del SVG */
    justify-content: center;
    /* Centrado horizontal del SVG */
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
}

.icon-btn svg {
    width: 22px;
    height: 22px;
    display: block;
    /* Elimina espacios extra debajo del SVG */
}

.icon-btn:hover {
    background: rgba(255, 255, 255, 0.05);
    color: #ffffff;
    transform: translateY(-2px);
}

.icon-btn.active {
    background: rgba(0, 0, 0, 0.6);
    color: #ffffff;
}

.icon-btn.active::after {
    content: '';
    position: absolute;
    right: -4px;
    width: 3px;
    height: 16px;
    background: #ffffff;
    border-radius: 4px 0 0 4px;
    box-shadow: -1px 0 8px rgba(255, 255, 255, 0.3);
}

/* Y sobreescribí los colores específicos por juego cuando están activos */
.icon-btn.lol.active {
    color: #ffffff;
}

.icon-btn.valorant.active {
    color: #ffffff;
}

.avatar-btn {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.6);
    font-size: 0.65rem;
    font-weight: 800;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
}

.avatar-btn:hover {
    border-color: rgba(255, 255, 255, 0.4);
    background: rgba(255, 255, 255, 0.1);
    transform: scale(1.1);
}

.avatar-btn.active {
    border-color: #c8973a;
    background: rgba(200, 155, 60, 0.1);
    color: #c8973a;
}

@media (max-width: 768px) {
    .sidebar-wrapper {
        display: none;
    }
}
</style>