<template>
  <div class="app-container">
    <el-tree
      ref="tree"
      :data="nodeData"
      node-key="node_code"
      default-expand-all
      highlight-current
      :expand-on-click-node="false"
      :props="treeProps"
    >
      <span slot-scope="{ node, data }" class="custom-tree-node">
        <span>
          <el-select v-model="node.data.node_code" filterable placeholder="请选择" @change="changeNodeCode(node)">
            <el-option v-for="item in codes" :key="item.value" :label="item.value" :value="item.value" />
          </el-select>
        </span>
        <span>{{ node.data.name }}</span>
        <span>
          <el-button type="text" size="mini" @click="() => append(data)">新增</el-button>
          <el-button type="text" size="mini" @click="() => remove(node, data)">删除</el-button>
        </span>
      </span>
    </el-tree>
    <el-dialog :title="infoDlg.title" :visible.sync="infoDlgVisible" width="30%">
      <span>{{ infoDlg.text }}</span>
      <span slot="footer" class="dialog-footer">
        <el-button v-waves type="primary" @click="infoDlgVisible = false">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import waves from '@/directive/waves' // waves directive

export default {
  directives: { waves },
  props: {
    nodeData: {
      type: Array,
      default: function() {
        return []
      }
    },
    nodeList: {
      type: Array,
      default: function() {
        return []
      }
    }
  },
  data() {
    return {
      infoDlg: {
        title: undefined,
        text: undefined
      },
      treeProps: { children: 'children', label: 'name' },
      codes: [],
      names: [],
      infoDlgVisible: false,
      expKey: []
    }
  },
  watch: {
    nodeList: function() {
      this.codes = this.nodeList.map(i => ({ value: i.code }))
      this.names = this.nodeList.map(i => ({ value: i.name }))
    }
  },
  methods: {
    handleUpdateTreeRoutes() {
      this.$emit('treeUpdated', true)
    },
    append(data) {
      const newChild = { node_code: 'new', name: 'new' }
      if (!data.children) {
        this.$set(data, 'children', [])
      }
      data.children.push(newChild)
      this.$refs.tree.$nextTick()
    },
    remove(node, data) {
      const parent = node.parent
      const children = parent.data.children || parent.data
      const index = children.findIndex(d => d.node_code === data.node_code)
      children.splice(index, 1)
      if (this.nodeData.length === 0) {
        this.nodeData.push({ node_code: undefined, name: undefined })
      }
      const o = JSON.parse(JSON.stringify(this.nodeData))
      this.$emit('treeUpdated', o)
    },
    nodeCodeSearch(queryString, cb) {
      var codes = this.codes
      var results = queryString ? codes.filter(i => (i.value.toLowerCase().indexOf(queryString.toLowerCase()) === 0)) : codes
      // 调用 callback 返回建议列表的数据
      cb(results)
    },
    showDupError(title, text) {
      this.infoDlg.title = title
      this.infoDlg.text = text
      this.infoDlgVisible = true
    },
    recursiveTree(node, tree) {
      let r = 0
      if (node.data.node_code === tree.node_code) {
        r++
      }
      if (tree.children) {
        for (let i = 0; i < tree.children.length; i++) {
          r += this.recursiveTree(node, tree.children[i])
          if (r >= 2) {
            return r
          }
        }
      }
      return r
    },
    validateNode(node) {
      const r = this.recursiveTree(node, this.nodeData[0])
      return r >= 2
    },
    changeNodeCode(node) {
      if (this.validateNode(node, this.nodeData)) {
        node.data.node_code = undefined
        this.$refs.tree.setCurrentNode(node)
        this.showDupError('Error', 'Duplicate roles exist, please correct it!')
        return
      }
      const e = this.nodeList.find(i => (node.data.node_code === i.code))
      if (e) {
        node.data.name = e.name
      }
      const o = JSON.parse(JSON.stringify(this.nodeData))
      this.$emit('treeUpdated', o)
    }
  }
}
</script>

<style>
  .el-tree-node__content {
    height: 40px;
  }
</style>
