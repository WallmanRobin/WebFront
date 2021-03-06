import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

/* Layout */
import Layout from '@/layout'

/**
 * Note: sub-menu only appear when route children.length >= 1
 * Detail see: https://panjiachen.github.io/vue-element-admin-site/guide/essentials/router-and-nav.html
 *
 * hidden: true                   if set true, item will not show in the sidebar(default is false)
 * alwaysShow: true               if set true, will always show the root menu
 *                                if not set alwaysShow, when item has more than one children route,
 *                                it will becomes nested mode, otherwise not show the root menu
 * redirect: noRedirect           if set noRedirect will no redirect in the breadcrumb
 * name:'router-name'             the name is used by <keep-alive> (must set!!!)
 * meta : {
    roles: ['admin','editor']    control the page roles (you can set multiple roles)
    title: 'title'               the name show in sidebar and breadcrumb (recommend set)
    icon: 'svg-name'             the icon show in the sidebar
    noCache: true                if set true, the page will no be cached(default is false)
    affix: true                  if set true, the tag will affix in the tags-view
    breadcrumb: false            if set false, the item will hidden in breadcrumb(default is true)
    activeMenu: '/example/list'  if set path, the sidebar will highlight the path you set
  }
 */

/**
 * constantRoutes
 * a base page that does not have permission requirements
 * all roles can be accessed
 */
export const constantRoutes = [
  {
    path: '/redirect',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '/redirect/:path*',
        component: () => import('@/views/redirect/index')
      }
    ]
  },
  {
    path: '/login',
    component: () => import('@/views/login/index'),
    hidden: true
  },
  {
    path: '/auth-redirect',
    component: () => import('@/views/login/auth-redirect'),
    hidden: true
  },
  {
    path: '/404',
    component: () => import('@/views/error-page/404'),
    hidden: true
  },
  {
    path: '/401',
    component: () => import('@/views/error-page/401'),
    hidden: true
  },
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [
      {
        path: '/dashboard',
        component: () => import('@/views/dashboard/index'),
        name: 'Dashboard',
        meta: { title: '统计榜', icon: 'dashboard', affix: true }
      }
    ]
  },
  {
    path: '/profile',
    component: Layout,
    redirect: '/profile/index',
    hidden: true,
    children: [
      {
        path: '/profile/index',
        component: () => import('@/views/profile/index'),
        name: 'Profile',
        meta: { title: 'Profile', icon: 'user', noCache: true }
      }
    ]
  }
]

/**
 * asyncRoutes
 * the routes that need to be dynamically loaded based on user roles
 */
export const asyncRoutes = [
  {
    path: '/system',
    component: Layout,
    redirect: '/system/authorization',
    alwaysShow: true, // will always show the root menu
    name: 'System',
    meta: {
      title: '系统配置',
      icon: 'setting'
    },
    children: [
      {
        path: '/system/authorization',
        component: () => import('@/views/system/authorization/index'),
        name: 'Authorization',
        meta: { title: '权限管理', icon: 'lock' },
        redirect: '/system/authorization/user',
        children: [
          {
            path: '/system/authorization/user',
            component: () => import('@/views/system/authorization/user-admin/index'),
            name: 'Users',
            meta: { icon: 'peoples', title: '用户管理' }
          },
          {
            path: '/system/authorization/role',
            component: () => import('@/views/system/authorization/role-admin/index'),
            name: 'Roles',
            meta: { icon: 'people', title: '角色管理' }
          }
        ]
      },
      {
        path: '/system/tree',
        component: () => import('@/views/system/tree-admin/index'),
        name: 'Tree',
        meta: { title: '树管理', icon: 'tree' }
      }
    ]
  },
  {
    path: '/tool',
    component: Layout,
    redirect: '/tool/datatool',
    alwaysShow: true, // will always show the root menu
    name: 'Tool',
    meta: {
      title: '系统工具',
      icon: 'tool'
    },
    children: [
      {
        path: '/tool/datatool',
        component: () => import('@/views/system/datatool/index'),
        redirect: '/tool/datatool/table',
        alwaysShow: true, // will always show the root menu
        name: 'DataTool',
        meta: {
          title: '数据管理',
          icon: 'form'
        },
        children: [
          {
            path: '/tool/datatool/table',
            component: () => import('@/views/system/datatool/table/index'),
            name: 'TableTool',
            meta: { title: '表管理', icon: 'table' }
          }
        ]
      }
    ]
  },
  // 404 page must be placed at the end !!!
  { path: '*', redirect: '/404', hidden: true }
]

const createRouter = () => new Router({
  // mode: 'history', // require service support
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRoutes
})

const router = createRouter()

// Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // reset router
}

export default router
