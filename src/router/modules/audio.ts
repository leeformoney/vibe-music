export default {
  path: "/audio",
  redirect: "/audio/index",
  meta: {
    icon: "ri:headphone-fill",
    title: "音频管理",
    rank: 3
  },
  children: [
    {
      path: "/audio/index",
      name: "AudioManagement",
      component: () => import("@/views/audio/index.vue"),
      meta: {
        title: "音频管理"
      }
    }
  ]
} satisfies RouteConfigsTable; 