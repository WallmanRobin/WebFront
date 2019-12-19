<template>
  <div class="app-container">
    <div class="filter-container">
      <el-autocomplete
        v-model="listQuery.code"
        class="inline-input"
        :fetch-suggestions="roleCodeSearch"
        placeholder="代码"
        @keyup.enter.native="handleFilter"
      />
      <el-autocomplete
        v-model="listQuery.name"
        class="inline-input"
        :fetch-suggestions="roleNameSearch"
        placeholder="名称"
        @keyup.enter.native="handleFilter"
      />
      <query-btn :query-data="queryData" :labels="queryLabels" :sel-visible="selVisible" @hideSelect="hideSelect" @handleSelect="handleSelect" @handleFilter="handleFilter" />
      <el-button
        class="filter-item"
        style="margin-left: 10px;"
        type="primary"
        icon="el-icon-edit"
        @click="handleCreate"
      >
        新增
      </el-button>
      <hr width="100%" size="3">
    </div>
    <div>
      <el-row>
        <el-col :span="6">
          <span style="font-weight:bold;">代码: </span>
          <span>
            <el-input
              v-model="code"
              placeholder="Code"
              style="width: 200px;"
              clearable
              class="filter-item"
              :disabled="codeDisabled"
              @change="updateChanged"
            />
          </span>
        </el-col>
        <el-col :span="6">
          <span style="font-weight:bold;">名称: </span>
          <span>
            <el-input
              v-model="name"
              placeholder="Name"
              style="width: 200px;"
              clearable
              class="filter-item"
              :disabled="nameDisabled"
              @change="updateChanged"
            />
          </span>
        </el-col>
        <el-col :span="3">
          <span style="font-weight:bold;">
            Active:
          </span>
          <span>
            <el-checkbox
              v-model="status"
              style="padding:8px;"
              :disabled="nameDisabled"
              :checked="true"
              @change="updateChanged"
            />
          </span>
        </el-col>
        <el-col :span="4">
          <span>
            <el-button
              class="filter-item"
              style="margin-left: 10px;"
              type="primary"
              :disabled="updateDisabled"
              @click="handleUpdate"
            >
              保存
            </el-button>
          </span>
        </el-col>
      </el-row>
    </div>
    <el-tabs style="margin-top:15px;" type="border-card">
      <el-tab-pane label="后台服务">
        <keep-alive>
          <endpoint ref="endpoint" :endpoint-data="endpointData" @endpointUpdated="endpointUpdated" />
        </keep-alive>
      </el-tab-pane>
      <el-tab-pane label="菜单项">
        <keep-alive>
          <viewroute ref="viewroute" :sel-key="selVR" @vrUpdated="viewrouteUpdated" />
        </keep-alive>
      </el-tab-pane>
    </el-tabs>
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
import endpoint from './components/Endpoint'
import viewroute from './components/Viewroute'
import queryBtn from '@/components/QueryBtn'
import { getRole, updateRole, listRoles } from '@/api/role-admin'

export default {
  name: 'RoleAdmin',
  components: { endpoint: endpoint, viewroute: viewroute, queryBtn: queryBtn },
  directives: { waves },
  data() {
    return {
      listQuery: {
        code: undefined,
        name: undefined
      },
      infoDlg: {
        title: undefined,
        text: undefined
      },
      code: undefined,
      name: undefined,
      status: undefined,
      codeDisabled: true,
      updateDisabled: true,
      nameDisabled: true,
      endpointData: null,
      selVR: null,
      roleCodes: undefined,
      infoDlgVisible: false,
      roleNames: undefined,
      roleList: [],
      selVisible: false,
      queryData: [],
      queryLabels: []
    }
  },
  mounted() {
    this.prepareRoleNameCode()
  },
  methods: {
    prepareRoleNameCode() {
      listRoles().then(response => {
        if (response.data) {
          this.roleNames = response.data.map(i => ({ value: i.name }))
          this.roleCodes = response.data.map(i => ({ value: i.role_code }))
        }
      })
    },
    roleCodeSearch(queryString, cb) {
      var roleCodes = this.roleCodes
      var results = queryString ? roleCodes.filter(i => (i.value && i.value.toLowerCase().indexOf(queryString.toLowerCase()) === 0)) : roleCodes
      // 调用 callback 返回建议列表的数据
      cb(results)
    },
    roleNameSearch(queryString, cb) {
      var roleNames = this.roleNames
      var results = queryString ? roleNames.filter(i => (i.value && i.value.toLowerCase().indexOf(queryString.toLowerCase()) === 0)) : roleNames
      // 调用 callback 返回建议列表的数据
      cb(results)
    },
    packQueryData(data) {
      this.queryData = data.map(i => ([i.code, i.name]))
    },
    packRoleData(r) {
      this.code = r.code
      this.name = r.name
      this.status = r.status
      if (r.endpoint && r.endpoint.length > 0) {
        this.endpointData = r.endpoint
      } else {
        this.endpointData = [{ 'endpoint': undefined, 'rule': undefined, 'method': undefined }]
      }
      if (r.viewroute && r.viewroute.length > 0) {
        this.selVR = r.viewroute
      } else {
        this.selVR = []
      }
    },
    handleFilter() {
      if (this.listQuery.code || this.listQuery.name) {
        this.clearRoleItems()
        this.codeDisabled = true
        this.updateDisabled = true
        this.nameDisabled = false
        this.$refs.endpoint.listLoading = true
        getRole(this.listQuery.code, this.listQuery.name).then(response => {
          if (response.data) {
            if (response.data.length === 1) {
              this.packRoleData(response.data[0])
            } else {
              this.packQueryData(response.data)
              this.queryLabels = ['代码', '名称', '参考表', '代码列', '描述列']
              this.selVisible = true
              this.roleList = response.data
            }
          }
          this.$refs.endpoint.listLoading = false
        })
      }
    },
    hideSelect() {
      this.selVisible = false
    },
    handleSelect(val) {
      if (this.roleList.length > 0) {
        let r = this.roleList.filter(i => (i.code === val[0]))
        if (r && r.length === 1) {
          r = r[0]
          this.packRoleData(r)
        }
        this.selVisible = false
      }
    },
    handleCreate() {
      this.codeDisabled = false
      this.updateDisabled = true
      this.nameDisabled = false
      this.clearRoleItems()
    },
    updateChanged() {
      this.updateDisabled = false
    },
    notifyMessage(title, text) {
      const h = this.$createElement
      this.$notify({
        title: title,
        message: h('i', { style: 'color: teal' }, text)
      })
    },
    validateEndpointData() {
      if (this.endpointData.length === 1 && !this.endpointData.endpoint) {
        return true
      }
      const a = this.endpointData.filter(i => (i.endpoint === undefined))
      if (a.length > 0) {
        this.$refs.endpoint.$refs.table.setCurrentRow(a[0])
        return false
      }
      return true
    },
    handleUpdate() {
      if (!this.validateEndpointData()) {
        this.notifyError('后台服务列表中存在空值，请修改后再提交!')
      } else {
        var s = this.$refs.viewroute.getSelVR()
        var d = {
          'code': this.code,
          'name': this.name,
          'status': this.status,
          'endpoint': this.endpointData,
          'viewroute': s
        }
        updateRole(d).then(response => {
          this.notifyMessage('提示', '保存成功！')
        }).catch(error => {
          this.notifyMessage('错误', '保存失败：' + error)
        })
      }
    },
    disableCreateItems(b) {
      this.codeDisabled = b
      this.updateDisabled = b
      this.$refs.viewroute.resetChecked()
    },
    clearRoleItems() {
      this.code = undefined
      this.name = undefined
      this.status = true
      this.endpointData = [{ 'endpoint': undefined, 'rule': undefined, 'method': undefined }]
      this.selVR = []
      this.$refs.viewroute.resetChecked()
    },
    endpointUpdated(endpointData) {
      this.endpointData = endpointData
      this.updateDisabled = false
    },
    viewrouteUpdated(updated) {
      this.updateDisabled = false
    },
    notifyError(title, text) {
      this.infoDlg.title = title
      this.infoDlg.text = text
      this.infoDlgVisible = true
    }
  }
}
</script>
