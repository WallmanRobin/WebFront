<template>
  <div class="app-container">
    <div class="filter-container">
      <el-autocomplete v-model="listQuery.tree_code" class="inline-input" :fetch-suggestions="treeCodeSearch" placeholder="代码" @keyup.enter.native="handleFilter" />
      <el-autocomplete v-model="listQuery.name" class="inline-input" :fetch-suggestions="treeNameSearch" placeholder="名称" @keyup.enter.native="handleFilter" />
      <query-btn :query-data="queryData" :table-labels="queryLabels" button-label="查询" :sel-visible="selVisible" @hideSelect="hideSelect" @handleSelect="handleSelect" @handleFilter="handleFilter" />
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">
        新增
      </el-button>
      <hr width="100%" size="3">
    </div>
    <div>
      <el-row>
        <el-col :span="6">
          <span style="font-weight:bold;">代码:&nbsp;&nbsp;&nbsp; </span>
          <span>
            <el-input v-model="tree_code" placeholder="Code" style="width: 200px;" clearable class="filter-item" :disabled="codeDisabled" @change="updateChanged" />
          </span>
        </el-col>
        <el-col :span="6">
          <span style="font-weight:bold;">名称:&nbsp;&nbsp;&nbsp; </span>
          <span>
            <el-input v-model="name" placeholder="Name" style="width: 200px;" clearable class="filter-item" :disabled="nameDisabled" @change="updateChanged" />
          </span>
        </el-col>
        <el-col :span="3">
          <span style="font-weight:bold;">
            有效:
          </span>
          <span>
            <el-checkbox v-model="status" style="padding:8px;" :disabled="nameDisabled" :checked="true" @change="updateChanged" />
          </span>
        </el-col>
        <el-col :span="4">
          <span>
            <el-button class="filter-item" style="margin-left: 10px;" type="primary" :disabled="updateDisabled" @click="handleUpdate">
              保存
            </el-button>
          </span>
        </el-col>
      </el-row>
      <el-row>
        <el-col>
          <span>
             &nbsp;
          </span>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="6">
          <span style="font-weight:bold;">参考表: </span>
          <span>
            <el-input v-model="ref_table" placeholder="参考表" style="width: 200px;" clearable class="filter-item" :disabled="nameDisabled" @change="refChanged" />
          </span>
        </el-col>
        <el-col :span="6">
          <span style="font-weight:bold;">代码列: </span>
          <span>
            <el-input v-model="ref_code" placeholder="代码列" style="width: 200px;" clearable class="filter-item" :disabled="nameDisabled" @change="refChanged" />
          </span>
        </el-col>
        <el-col :span="6">
          <span style="font-weight:bold;">描述列: </span>
          <span>
            <el-input v-model="ref_descr" placeholder="描述列" style="width: 200px;" clearable class="filter-item" :disabled="nameDisabled" @change="refChanged" />
          </span>
        </el-col>
      </el-row>
    </div>
    <el-tabs style="margin-top:15px;" type="border-card">
      <el-tab-pane label="树节点">
        <keep-alive>
          <tree ref="tree" :node-data="nodeData" :node-list="nodeList" @treeUpdated="treeUpdated" />
        </keep-alive>
      </el-tab-pane>
    </el-tabs>
    <el-dialog :title="infoDlg.title" :visible.sync="infoDlgVisible" width="30%">
      <span>{{ infoDlg.text }}</span>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="infoDlgVisible = false">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import tree from './components/Tree'
import queryBtn from '@/components/QueryBtn'
import { listTrees, listNodes, getTree, updateTree } from '@/api/tree-admin'
export default {
  name: 'TreeAdmin',
  components: { tree: tree, queryBtn: queryBtn },
  data() {
    return {
      listQuery: {
        tree_code: undefined,
        name: undefined
      },
      infoDlg: {
        title: undefined,
        text: undefined
      },
      tree_code: undefined,
      name: undefined,
      status: undefined,
      ref_table: undefined,
      ref_code: undefined,
      ref_descr: undefined,
      codeDisabled: true,
      updateDisabled: true,
      nameDisabled: true,
      nodeData: [],
      nodeList: [],
      treeCodes: [],
      infoDlgVisible: false,
      treeNames: [],
      selVisible: false,
      treeList: [],
      queryData: [],
      queryLabels: []
    }
  },
  mounted() {
    this.prepareTreeNameCode()
  },
  methods: {
    prepareTreeNameCode() {
      listTrees().then(response => {
        if (response.data) {
          this.treeCodes = response.data.map(i => ({ value: i.tree_code }))
          this.treeNames = response.data.map(i => ({ value: i.name }))
        }
      })
    },
    treeCodeSearch(queryString, cb) {
      var treeCodes = this.treeCodes
      var results = queryString ? treeCodes.filter(i => (i.value.toLowerCase().indexOf(queryString.toLowerCase()) === 0)) : treeCodes
      // 调用 callback 返回建议列表的数据
      cb(results)
    },
    treeNameSearch(queryString, cb) {
      var treeNames = this.treeNames
      var results = queryString ? treeNames.filter(i => (i.value.toLowerCase().indexOf(queryString.toLowerCase()) === 0)) : treeNames
      // 调用 callback 返回建议列表的数据
      cb(results)
    },
    packQueryData(data) {
      this.queryData = data.map(i => ([i.tree_code, i.name, i.ref_table, i.ref_code, i.ref_descr]))
    },
    packTreeData(t) {
      this.tree_code = t.tree_code
      this.name = t.name
      this.status = t.status
      this.ref_table = t.ref_table
      this.ref_code = t.ref_code
      this.ref_descr = t.ref_descr
      if (t.node) {
        this.nodeData = t.node
      } else {
        this.nodeData = [{ node_code: '', name: '' }]
      }
      this.getRefList()
    },
    handleFilter() {
      if (this.listQuery.tree_code || this.listQuery.name) {
        this.codeDisabled = true
        this.updateDisabled = true
        this.nameDisabled = false
        getTree(this.listQuery.tree_code, this.listQuery.name).then(response => {
          if (response.data) {
            if (response.data.length > 0) {
              if (response.data.length === 1) {
                this.packTreeData(response.data[0])
              } else {
                this.packQueryData(response.data)
                this.queryLabels = ['代码', '名称', '参考表', '代码列', '描述列']
                this.selVisible = true
                this.treeList = response.data
              }
            }
          }
        })
      }
    },
    getRefList() {
      if (this.ref_table && this.ref_code && this.ref_descr) {
        listNodes(this.ref_table, this.ref_code, this.ref_descr).then(
          response => {
            if (response.data) {
              this.nodeList = response.data
            }
          }
        )
      } else {
        this.nodeList = []
      }
    },
    hideSelect() {
      this.selVisible = false
    },
    handleSelect(val) {
      if (this.treeList.length > 0 && val && val.length > 0) {
        let t = this.treeList.filter(i => (i.tree_code === val[0]))
        if (t && t.length === 1) {
          t = t[0]
          this.packTreeData(t)
        }
        this.selVisible = false
      }
    },
    handleCreate() {
      this.codeDisabled = false
      this.updateDisabled = true
      this.nameDisabled = false
      this.nodeData = [{ node_code: '', name: '' }]
    },
    updateChanged() {
      this.updateDisabled = false
    },
    refChanged() {
      this.updateDisabled = false
      if (this.ref_table && this.ref_code && this.ref_descr) {
        listNodes(this.ref_table, this.ref_code, this.ref_descr).then(
          response => {
            if (response.data) {
              this.nodeList = response.data
            }
          }
        )
      } else {
        this.nodeList = []
      }
    },
    notifyMessage(title, text, type) {
      const h = this.$createElement
      this.$notify({
        type: type,
        title: title,
        message: h('i', { style: 'color: teal' }, text)
      })
    },
    validateTree(node) {
      if (!node.node_code) {
        return false
      }
      if (tree.children) {
        for (let i = 0; i < tree.children.length; i++) {
          if (!this.recursiveTree(node, tree.children[i])) {
            return false
          }
        }
      }
      return true
    },
    validateNodeData() {
      const root = this.nodeData[0]
      if (!root.children || root.children.length === 0) {
        return true
      }
      return this.validateTree(root)
    },
    handleUpdate() {
      if (!this.validateNodeData()) {
        this.infoDlg.title = 'Error'
        this.infoDlg.text = '节点的代码为空值, ，请修改后再提交!'
        this.infoDlgVisible = true
        return
      }
      var t = this.$refs.tree.nodeData[0]
      var d = {
        'tree_code': this.tree_code,
        'name': this.name,
        'status': this.status,
        'ref_table': this.ref_table,
        'ref_code': this.ref_code,
        'ref_descr': this.ref_descr,
        'node': t
      }
      updateTree(d).then(response => {
        this.notifyMessage('提示', '保存成功！', 'success')
      }).catch(error => {
        this.notifyMessage('错误', '保存失败：' + error, 'error')
      })
    },
    disableCreateItems(b) {
      this.codeDisabled = b
      this.updateDisabled = b
    },
    treeUpdated(nodeData) {
      this.updateDisabled = false
      this.nodeData = nodeData
    },
    notifyError(title, text) {
      this.infoDlg.title = title
      this.infoDlg.text = text
      this.infoDlgVisible = true
    }
  }
}
</script>
