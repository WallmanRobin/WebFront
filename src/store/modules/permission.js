import { asyncRoutes, constantRoutes } from '@/router'
import { getRoleRoutes } from '@/api/role-admin'
import store from '@/store'
/**
 * Use meta.role to determine if the current user has permission
 * @param roles
 * @param route
 */
/* function hasPermission(roles, route) {
  if (route.meta && route.meta.roles) {
    return roles.some(role => route.meta.roles.includes(role))
  } else {
    return true
  }
} */

/**
 * Filter asynchronous routing tables by recursionf
 * @param routes asyncRoutes
 * @param roles
 */
export function filterAsyncRoutes(routes, path) {
  const res = []

  routes.forEach(route => {
    const tmp = { ...route }
    if (path.indexOf(tmp.path) > -1) {
      if (route.children) {
        tmp.children = filterAsyncRoutes(tmp.children, path)
      }
      res.push(tmp)
    }
  })

  return res
}

const state = {
  routes: [],
  addRoutes: []
}

const mutations = {
  SET_ROUTES: (state, routes) => {
    state.addRoutes = routes
    state.routes = constantRoutes.concat(routes)
  }
}

const actions = {
  generateRoutes({ commit }, roles) {
    return new Promise(resolve => {
      let accessedRoutes
      if (roles.includes('admin')) {
        accessedRoutes = asyncRoutes || []
        commit('SET_ROUTES', accessedRoutes)
        resolve(accessedRoutes)
      } else {
        getRoleRoutes(store.getters.roles).then(response => {
          if (response.data) {
            var ar = response.data
            accessedRoutes = filterAsyncRoutes(asyncRoutes, ar)
            commit('SET_ROUTES', accessedRoutes)
            resolve(accessedRoutes)
          }
        })
      }
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
