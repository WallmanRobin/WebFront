<template>
  <div class="app-container">
    <el-table
      ref="table"
      v-loading="listLoading"
      row-key="role_code"
      :data="roleData"
      border
      fit
      highlight-current-row
      :tree-props="{children: 'children'}"
      style="width: 100%;"
    >
      <el-table-column label="代码" sortable=" custom" align="center" width="320">
        <template slot-scope="scope">
          <el-select v-model="scope.row.role_code" filterable reserve-keyword :disabled="scope.row.parent!=undefined" @change="changeRole(scope.row)" @focus="focusRole">
            <el-option v-for="item in allRoles" :key="item.role_code" :label="item.role_code" :value="item.role_code" />
          </el-select>
        </template>
      </el-table-column>
      <el-table-column label="名称" align="left" width="240">
        <template slot-scope="scope">
          <span>{{ scope.row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="有效" align="left" width="240">
        <template slot-scope="scope">
          <el-checkbox v-model="scope.row.status" style="padding:8px;" :checked="scope.row.status" :disabled="true" />
        </template>
      </el-table-column>
      <el-table-column label="动作" align="center" width="200" class-name="small-padding fixed-width">
        <template slot-scope="{row}">
          <el-button v-if="row.parent==undefined" icon="el-icon-plus" type="primary" size="mini" @click="handleAddRole(row)" />
          <el-button v-if="row.parent==undefined" icon="el-icon-minus" type="danger" size="mini" @click="handleRemoveRole(row)" />
        </template>
      </el-table-column>
    </el-table>
    <el-dialog :title="infoDlg.title" :visible.sync="infoDlgVisible" width="30%">
      <span>{{ infoDlg.text }}</span>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="infoDlgVisible = false">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { listRoles, getRoleTreeData } from '@/api/role-admin'
export default {
  props: {
    roleData: {
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
      name: undefined,
      oldRoleData: null,
      allRoles: null,
      listLoading: true,
      infoDlgVisible: false,
      addDlgVisible: false
    }
  },
  mounted() {
    this.prepareRoles()
  },
  methods: {
    prepareRoles() {
      this.listLoading = true
      listRoles().then(response => {
        this.allRoles = response.data
        this.listLoading = false
      })
    },
    showDupError(title, text) {
      this.infoDlg.title = title
      this.infoDlg.text = text
      this.infoDlgVisible = true
    },
    changeRole(row) {
      var a = this.roleData.filter(i => (i.role_code === row.role_code))
      if (a.length > 1) {
        var o = JSON.parse(JSON.stringify(this.oldRoleData))
        this.$emit('roleRowUpdated', o)
        this.showDupError('Error', '角色列表中存在重复值，请修改后再提交！')
      } else {
        this.replaceRole(row)
        row.name = this.allRoles.filter(i => i.role_code === row.role_code)[0].name
        this.oldRoleData = JSON.parse(JSON.stringify(this.roleData))
      }
    },
    focusRole(event) {
      this.oldRoleData = JSON.parse(JSON.stringify(this.roleData))
    },
    handleAddRole(row) {
      var i = this.roleData.indexOf(row)
      this.roleData.splice(i + 1, 0, { 'role_code': '', 'name': '' })
    },
    handleRemoveRole(row) {
      row.children = undefined
      var i = this.roleData.indexOf(row)
      this.roleData.splice(i, 1)
      var o = JSON.parse(JSON.stringify(this.roleData))
      this.$emit('roleRowUpdated', o)
    },
    handleCreate() {
      this.clearRoleItems()
    },
    clearRoleItems() {
      this.roleData = [{ 'role_code': '', 'name': '' }]
      this.oldRoleData = [{ 'role_code': '', 'name': '' }]
    },
    isRoleRootInRow(row, role_data) {
      for (let i = 0; i < role_data.length; i++) {
        if (role_data[i].role_code === row.role_code) {
          return true
        }
      }
      if (row.children) {
        for (let i = 0; i < row.children.length; i++) {
          const b = this.isRoleRootInRow(row.children[i], role_data)
          if (b) {
            return b
          }
        }
      }
      return false
    },
    isRowInRoleData(roleData, row) {
      for (let i = 0; i < roleData.length; i++) {
        if (row.role_code === roleData[i].role_code) {
          return true
        }
        if (roleData[i].children) {
          const c = this.isRowInRoleData(roleData[i].children, row)
          if (c) {
            return c
          }
        }
      }
      return false
    },
    replaceRole(row) {
      this.listLoading = true
      getRoleTreeData(row.role_code).then(response => {
        let dup = false
        const row_role_code = row.role_code
        const ex_role_data = this.roleData.filter(i => (i !== row))
        row.role_code = ''
        if (response.data) {
          if (this.isRowInRoleData(ex_role_data, response.data)) {
            dup = true
          } else {
            if (response.data.children) {
              if (this.isRoleRootInRow(response.data, ex_role_data)) {
                dup = true
              } else {
                row.children = response.data.children
              }
            }
          }
        }
        if (dup) {
          row.role_code = ''
          row.name = ''
          row.status = false
          row.children = undefined
          const o = JSON.parse(JSON.stringify(this.roleData))
          this.$emit('roleRowUpdated', o)
          this.showDupError('Error', '角色列表中存在重复值，请修改后再提交！')
        } else {
          row.role_code = row_role_code
          row.name = response.data.name
          row.status = response.data.status
          this.oldRoleData = JSON.parse(JSON.stringify(this.roleData))
          const p = JSON.parse(JSON.stringify(this.roleData))
          this.$emit('roleRowUpdated', p)
        }
        this.listLoading = false
      }).catch(error => {
        console.log(error)
        this.listLoading = false
      })
    }
  }
}
</script>
