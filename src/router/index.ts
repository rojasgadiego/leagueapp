import { createRouter, createWebHistory } from 'vue-router'
import HomeLeagueView from '../views/leagueoflegens/HomeLeagueView.vue'
import MatchView from '../views/leagueoflegens/MatchView.vue'
import CompareView from '../views/leagueoflegens/CompareView.vue'
import LiveView from '../views/leagueoflegens/LiveView.vue'
import BuildsView from '../views/leagueoflegens/BuildsView.vue'
import ValorantView from '../views/valorant/HomeValorant.vue'
import SummonerValorantView from '../views/valorant/SummonerValorantView.vue'
import SummonerView from '../views/leagueoflegens/SummonerView.vue'


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/leagueoflegens', name: 'leagueoflegens', component: HomeLeagueView },
    { path: '/summoner/:tagLine/:gameName', name: 'summoner', component: SummonerView },
    { path: '/match/:matchId', name: 'match', component: MatchView },
    { path: '/compare', name: 'compare', component: CompareView },
    { path: '/live/:puuid', name: 'live', component: LiveView },
    { path: '/builds', name: 'builds', component: BuildsView },
    { path: '/valorant', name: 'Valorant', component: ValorantView },
    { path: '/valorant/:gameName/:tagLine', name: 'ValorantSummoner', component: SummonerValorantView}
  ]
})

export default router