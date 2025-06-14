export default {
  path: "/category",
  redirect: "/category/index",
  meta: {
    icon: "ri:folder-music-fill",
    title: "分类管理",
    rank: 2
  },
  children: [
    {
      path: "/category/index",
      name: "CategoryManagement",
      component: () => import("@/views/category/index.vue"),
      meta: {
        title: "分类管理"
      }
    }
  ]
} satisfies RouteConfigsTable; 