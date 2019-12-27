<template>
  <div class="app-container">
    <el-table ref="table" v-loading="listLoading" :data="endpointData" border fit highlight-current-row style="width: 100%;">
      <el-table-column label="名称" sortable="custom" align="center" width="320">
        <template slot-scope="scope">
          <el-select v-model="scope.row.endpoint" filterable reserve-keyword @change="changeEndpoint(scope.row)" @focus="focusEndpoint">
            <el-option v-for="item in allEndpoints" :key="item.endpoint" :label="item.endpoint" :value="item.endpoint" />
          </el-select>
        </template>
      </el-table-column>
      <el-table-column label="路径" align="left" width="240">
        <template slot-scope="scope">
          <span>{{ scope.row.rule }}</span>
        </template>
      </el-table-column>
      <el-table-column label="方法" align="center" width="160">
        <template slot-scope="scope">
          <el-select v-model="scope.row.method" reserve-keyword @change="isDupEndpoint(scope.row)" @focus="focusEndpoint">
            <el-option v-for="item in scope.row.methods" :key="item" :label="item" :value="item" />
          </el-select>
        </template>
      </el-table-column>
      <el-table-column label="动作" align="center" width="200" class-name="small-padding fixed-width">
        <template slot-scope="{row}">
          <el-button icon="el-icon-plus" type="primary" size="mini" @click="handleAddEndpoint(row)" />
          <el-button icon="el-icon-minus" type="danger" size="mini" @click="handleRemoveEndpoint(row)" />
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import { listEndpoints, listMethods } from '@/api/role-admin'
import { alertError } from '@/utils'

export default {
  props: { endpointData: { type: Array, default: function() { return [] } }},
  data() {
    return {
      name: undefined,
      oldEndpointData: null,
      allEndpoints: null
    }
  },
  mounted() {
    this.prepareEndpoints()
  },
  methods: {
    prepareEndpoints() {
      this.listLoading = true
      listEndpoints().then(response => {
        this.allEndpoints = response.data
        this.listLoading = false
      })
    },
    isDupEndpoint(row) {
      const n = row.endpoint
      const m = row.method
      const a = this.endpointData.filter(i => (i.endpoint === n && i.method === m))
      if (a.length >= 2) {
        this.endpointData = JSON.parse(JSON.stringify(this.oldEndpointData))
        alertError(this, '错误', '后台服务列表中存在重复值，请修改后再提交!')
      }
    },
    changeEndpoint(row) {
      listMethods(row.endpoint).then(response => {
        const { data } = response
        row.methods = data
        if (row.methods.length > 0) {
          let bDup = true
          for (let n = 0; n < row.methods.length; n++) {
            row.method = row.methods[n]
            const a = this.endpointData.filter(i => (i.endpoint === row.endpoint && i.method === row.methods[n]))
            if (a.length <= 1) {
              row.method = row.methods[n]
              bDup = false
              break
            }
          }
          if (bDup) {
            this.endpointData = JSON.parse(JSON.stringify(this.oldEndpointData))
            this.updateEmit()
            alertError(this, '错误', '后台服务列表中存在重复值，请修改后再提交!')
          } else {
            row.rule = this.allEndpoints.filter(i => i.endpoint === row.endpoint)[0].rule
            this.updateEmit()
            this.oldEndpointData = JSON.parse(JSON.stringify(this.endpointData))
          }
        }
      }).catch(error => {
        console.log(error)
      })
    },
    focusEndpoint(event) {
      this.oldEndpointData = JSON.parse(JSON.stringify(this.endpointData))
    },
    handleAddEndpoint(row) {
      const i = this.endpointData.indexOf(row)
      this.endpointData.splice(i + 1, 0, { 'endpoint': '', 'rule': '', 'method': '' })
      this.updateEmit()
    },
    handleRemoveEndpoint(row) {
      const i = this.endpointData.indexOf(row)
      this.endpointData.splice(i, 1)
      this.updateEmit()
    },
    handleCreate() {
      this.clearRoleItems()
    },
    clearRoleItems() {
      this.endpointData = [{ 'endpoint': '', 'rule': '', 'method': '' }]
      this.oldEndpointData = [{ 'endpoint': '', 'rule': '', 'method': '' }]
      this.updateEmit()
    },
    updateEmit() {
      const o = JSON.parse(JSON.stringify(this.endpointData))
      this.$emit('endpointUpdated', o)
    }
  }
}
</script>
