<template>
  <div class="app-container">
    <el-tree
      ref="tree"
      :data="allVR"
      show-checkbox
      node-key="path"
      default-expand-all
      highlight-current
      :default-checked-keys="selKey"
      :props="treeProps"
      @check-change="handleUpdateViewRoutes"
    />
  </div>
</template>

<script>
import waves from '@/directive/waves' // waves directive
import { asyncRoutes } from '@/router'

export default {
  directives: { waves },
  props: { selKey: { type: Array, default: function() { return [] } }},

  data() {
    return {
      infoDlg: {
        title: undefined,
        text: undefined
      },
      name: undefined,
      allVR: null,
      vrTree: null,
      treeProps: { children: 'children', label: 'path' }
    }
  },
  mounted() {
    this.allVR = asyncRoutes
  },
  methods: {
    handleUpdateViewRoutes() {
      this.$emit('vrUpdated', true)
    },
    resetChecked() {
      this.$refs.tree.setCheckedKeys([])
    },
    getSelVR() {
      var leaf = this.$refs.tree.getCheckedKeys(true)
      var node = this.$refs.tree.getCheckedKeys().concat(this.$refs.tree.getHalfCheckedNodes().map(i => i.path))
      var a = []
      for (var i = 0; i < node.length; i++) {
        if (leaf.indexOf(node[i]) > -1) {
          a.push({ 'viewroute': node[i], 'leaf': true })
        } else {
          a.push({ 'viewroute': node[i], 'leaf': false })
        }
      }
      return a
    }
  }
}
</script>
