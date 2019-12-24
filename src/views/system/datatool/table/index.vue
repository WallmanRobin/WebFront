<template>
  <div class="app-container">
    <div class="filter-container">
      <el-autocomplete
        v-model="listQuery.name"
        class="inline-input"
        :fetch-suggestions="nameSearch"
        placeholder="表名"
        @keyup.enter.native="handleFilter"
      />
      <el-autocomplete
        v-model="listQuery.descr"
        class="inline-input"
        :fetch-suggestions="descrSearch"
        placeholder="描述"
        @keyup.enter.native="handleFilter"
      />
      <query-btn :query-data="tables" :sel-visible="selQueryVisible" :table-labels="queryLabels" button-label="查询" @hideSelect="hideSelect" @handleSelect="handleSelect" @handleFilter="handleFilter" />
      <el-button
        class="filter-item"
        style="margin-left: 10px;"
        type="primary"
        icon="el-icon-edit"
        @click="handleCreate"
      >
        新增
      </el-button>
      <query-btn :query-data="tables" :sel-visible="selRefVisible" :table-labels="queryLabels" placement="right-end" button-label="映射表" table-width="500" column-width="230" @hideSelect="hideRefSelect" @handleSelect="handleSelect" @handleFilter="handleRefFilter" />
      <hr width="100%" size="3">
    </div>
    <div>
      <el-row>
        <el-col :span="5">
          <span style="font-weight:bold;">表名: </span>
          <span>
            <el-input
              v-model="name"
              placeholder="表名"
              style="width: 200px;"
              clearable
              class="filter-item"
              :disabled="nameDisabled"
              @change="updateChanged"
            />
          </span>
        </el-col>
        <el-col :span="5">
          <span style="font-weight:bold;">描述: </span>
          <span>
            <el-input
              v-model="descr"
              placeholder="描述"
              style="width: 200px;"
              clearable
              class="filter-item"
              :disabled="descrDisabled"
              @change="updateChanged"
            />
          </span>
        </el-col>
        <el-col :span="2">
          <span style="font-weight:bold;">
            Active:
          </span>
          <span>
            <el-checkbox
              v-model="status"
              style="padding:8px;"
              :disabled="descrDisabled"
              :checked="true"
              @change="updateChanged"
            />
          </span>
        </el-col>
        <el-col :span="10">
          <span>
            <el-button
              class="filter-item"
              style="margin-left: 10px;"
              type="primary"
              :disabled="!(columnsData&&columnsData.length>0&&columnsData[0].name!='')"
              @click="handleUpdate"
            >
              保存
            </el-button>
          </span>
          <span>
            <el-button
              class="filter-item"
              style="margin-left: 10px;"
              type="primary"
              :disabled="!(columnsData&&columnsData.length>0&&columnsData[0].name!='')"
              @click="handleCreateTable"
            >
              建表
            </el-button>
          </span>
          <span>
            <el-dialog :visible.sync="exportExcelVisible" title="导出模板">
              <export-falt-excel :excel-data="excelData" :excel-header="excelHeader" :excel-type="excelType" />
            </el-dialog>
            <el-button
              class="filter-item"
              style="margin-left: 10px;"
              type="primary"
              :disabled="!(columnsData&&columnsData.length>0&&columnsData[0].name!='')"
              @click="handleExportTemplate"
            >
              导出模板
            </el-button>
          </span>
          <span>
            <el-dialog :visible.sync="uploadExcelVisible" title="导入数据">
              <div class="app-container">
                <upload-excel :on-success="uploadSuccess" :before-upload="beforeUpload" />
                <div v-if="uploadTableData && uploadTableData.length>0" style="padding: 10px 0 0 10px">
                  <span>
                    已成功导入<B>{{ uploadTableData.length }}</B>条数据。
                  </span>
                  <span>写入前删除</span>
                  <el-checkbox v-model="truncate" style="padding:8px;" />
                  <span padding="0 0 0 5px">
                    <el-button class="filter-item" style="margin-left: 10px;" type="primary" @click="handleDumpTable">
                      写入该表
                    </el-button>
                  </span>
                </div>
              </div>
            </el-dialog>
            <el-button
              class="filter-item"
              style="margin-left: 10px;"
              type="primary"
              :disabled="!(columnsData&&columnsData.length>0&&columnsData[0].name!='')"
              @click="handleUpload"
            >
              导入数据
            </el-button>
          </span>
        </el-col>
      </el-row>
    </div>
    <columns ref="columns" :columns="columnsData" :mode="mode" @columnsUpdated="columnsUpdated" />
    <el-dialog :title="infoDlg.title" :visible.sync="infoDlgVisible" width="30%">
      <span>{{ infoDlg.text }}</span>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="infoDlgVisible = false">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import columns from './components/Columns'
import queryBtn from '@/components/QueryBtn'
import exportFaltExcel from '@/components/Excel/ExportFlatExcel'
import uploadExcel from '@/components/Excel/UploadExcel'
import { listTables, getTable, updateTable, getRefTable, jsonMappingToTable, dumpTable } from '@/api/datatool'
import { parseTime } from '@/utils'

export default {
  name: 'TableTool',
  components: { columns: columns, queryBtn: queryBtn, exportFaltExcel: exportFaltExcel, uploadExcel: uploadExcel },
  data() {
    return {
      listQuery: {
        name: undefined,
        descr: undefined
      },
      infoDlg: {
        title: undefined,
        text: undefined
      },
      name: undefined,
      descr: undefined,
      status: undefined,
      descrDisabled: true,
      updateDisabled: true,
      nameDisabled: true,
      columnsData: undefined,
      tablesData: undefined,
      infoDlgVisible: false,
      tableNames: undefined,
      tableDescrs: undefined,
      tables: [],
      selQueryVisible: false,
      selRefVisible: false,
      queryLabels: [],
      mode: 'custom',
      exportExcelVisible: false,
      excelType: undefined,
      excelData: undefined,
      excelHeader: undefined,
      crateTableVisible: false,
      uploadExcelVisible: false,
      uploadTableData: [],
      uploadTableHeader: [],
      truncate: true
    }
  },
  mounted() {
    this.prepareTableNameDescr()
  },
  methods: {
    prepareTableNameDescr() {
      listTables().then(response => {
        if (response.data) {
          this.tableNames = response.data.map(i => ({ value: i.name }))
          this.tableDescrs = response.data.map(i => ({ value: i.descr }))
        }
      })
    },
    descrSearch(queryString, cb) {
      var tableDescrs = this.tableDescrs
      var results = queryString ? tableDescrs.filter(i => (i.value && i.value.toLowerCase().indexOf(queryString.toLowerCase()) === 0)) : tableDescrs
      // 调用 callback 返回建议列表的数据
      cb(results)
    },
    nameSearch(queryString, cb) {
      var tableNames = this.tableNames
      var results = queryString ? tableNames.filter(i => (i.value && i.value.toLowerCase().indexOf(queryString.toLowerCase()) === 0)) : tableNames
      // 调用 callback 返回建议列表的数据
      cb(results)
    },
    packQueryData(data) {
      this.tables = data.map(i => ([i.name, i.descr]))
    },
    packTableData(r) {
      this.name = r.name
      this.descr = r.descr
      this.status = r.status
      if (r.columns && r.columns.length > 0) {
        this.columnsData = r.columns
      } else {
        this.clearTableColumnsItem()
      }
    },
    handleFilter() {
      // this.clearTableItems()
      this.descrDisabled = false
      this.updateDisabled = true
      this.nameDisabled = true
      this.mode = 'custom'
      this.$refs.columns.listLoading = true
      getTable(this.listQuery.name, this.listQuery.descr).then(response => {
        if (response.data) {
          if (response.data.length === 1) {
            this.packTableData(response.data[0])
          } else {
            this.packQueryData(response.data)
            this.tablesData = response.data
            this.queryLabels = ['表名', '描述']
            this.selQueryVisible = true
            this.selRefVisible = false
          }
        }
        this.$refs.columns.listLoading = false
      })
    },
    handleRefFilter() {
      // this.clearTableItems()
      this.descrDisabled = true
      this.updateDisabled = true
      this.nameDisabled = true
      this.mode = 'reflect'
      this.$refs.columns.listLoading = true
      getRefTable().then(response => {
        if (response.data) {
          if (response.data.length === 1) {
            this.packTableData(response.data[0])
          } else {
            this.packQueryData(response.data)
            this.tablesData = response.data
            this.queryLabels = ['表名', '描述']
            this.selQueryVisible = false
            this.selRefVisible = true
          }
        }
        this.$refs.columns.listLoading = false
      })
    },
    hideSelect() {
      this.mode = 'custom'
      this.selQueryVisible = false
    },
    hideRefSelect() {
      this.mode = 'reflect'
      this.selRefVisible = false
    },
    handleSelect(val) {
      if (this.tables.length > 0 && val) {
        let r = this.tablesData.filter(i => (i.name === val[0]))
        if (r && r.length === 1) {
          r = r[0]
          this.packTableData(r)
        }
        if (this.mode === 'custom') {
          this.selQueryVisible = false
        } else if (this.mode === 'reflect') {
          this.selRefVisible = false
        }
      }
    },
    handleCreate() {
      this.descrDisabled = false
      this.updateDisabled = true
      this.nameDisabled = false
      this.mode = 'custom'
      this.clearTableItems()
    },
    updateChanged() {
      this.updateDisabled = false
    },
    notifyMessage(title, text, type) {
      const h = this.$createElement
      this.$notify({
        type: type,
        title: title,
        message: h('i', { style: 'color: teal' }, text)
      })
    },
    validateTableData() {
      let a = this.columnsData.filter(i => (i.name === undefined || i.name === ''))
      if (a.length > 0) {
        this.$refs.columns.$refs.table.setCurrentRow(a[0])
        this.notifyError('数据列列表中存在空值，请修改后再提交!')
        return false
      }
      a = this.columnsData.filter(i => (i.length === 0 && i.type !== 'Integer' && i.type !== 'Date' && i.type !== 'DateTime' && i.type !== 'Text'))
      if (a.length > 0) {
        this.$refs.columns.$refs.table.setCurrentRow(a[0])
        this.notifyError('数据列的长度不允许为零，请修改后再提交!')
        return false
      }
      return true
    },
    handleUpdate() {
      if (this.validateTableData()) {
        var d = {
          'name': this.name,
          'descr': this.descr,
          'status': this.status,
          'columns': this.columnsData
        }
        updateTable(d).then(response => {
          this.notifyMessage('提示', '保存成功！', 'success')
        }).catch(error => {
          this.notifyMessage('错误', '保存失败：' + error, 'error')
        })
      }
    },
    disableCreateItems(b) {
      this.descrDisabled = b
      this.updateDisabled = b
      this.$refs.viewroute.resetChecked()
    },
    clearTableColumnsItem() {
      this.columnsData = [{ name: undefined, type: undefined, length: undefined, scale: undefined, primary_key: undefined, nullable: undefined, autoincrement: undefined }]
    },
    clearTableItems() {
      this.name = undefined
      this.descr = undefined
      this.status = true
      this.clearTableColumnsItem()
    },
    columnsUpdated(columnsData) {
      this.columnsData = columnsData
      this.updateDisabled = false
    },
    notifyError(title, text) {
      this.infoDlg.title = title
      this.infoDlg.text = text
      this.infoDlgVisible = true
    },
    packExportXLSTemplate() {
      if (this.columnsData && this.columnsData.length > 0) {
        this.excelHeader = this.columnsData.filter(i => !i.autoincrement).map(i => i.name)
        this.excelType = this.columnsData.filter(i => !i.autoincrement).map(i => i.type)
        this.excelData = [[...this.columnsData.filter(i => !i.autoincrement).map(i => {
          switch (i.type) {
            case 'String':
              return 'String'
            case 'Text':
              return 'Text'
            case 'Integer':
              return '123456789'
            case 'DECIMAL':
              return '123456789.99'
            case 'Float':
              return '123456789.99'
            case 'Date':
              return parseTime(new Date(), '{y}-{m}-{d}')
            case 'DateTime':
              return parseTime(new Date())
          }
        })]]
        this.exportExcelVisible = true
      } else {
        this.exportExcelVisible = false
        this.notifyMessage('错误', '导出模板前请先选择对应的数据表！', 'error')
      }
    },
    handleExportTemplate() {
      if (!this.exportExcelVisible) {
        this.packExportXLSTemplate()
      } else {
        this.exportExcelVisible = false
      }
    },
    beforeUpload() {
      this.uploadTableData = []
      return true
    },
    uploadSuccess({ results, header }) {
      this.uploadTableData = results
      this.uploadTableHeader = header
    },
    handleCreateTable() {
      if (this.validateTableData()) {
        this.$confirm('创建表将会删除原表及其数据，你确认继续吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          var d = {
            'name': this.name,
            'descr': this.descr,
            'status': this.status,
            'columns': this.columnsData
          }
          updateTable(d).then(response => {
            jsonMappingToTable({ name: this.name, columns: this.columnsData }).then(response => {
              this.notifyMessage('提示', '创建成功！', 'success')
            }).catch(error => {
              this.notifyMessage('错误', '创建失败：' + error, 'error')
            })
          }).catch(error => {
            this.notifyMessage('错误', '创建失败：' + error, 'error')
          })
        })
      }
    },
    handleDumpTable() {
      dumpTable({ name: this.name, truncate: this.truncate, data: this.uploadTableData }).then(response => {
        if (response.data) {
          const code = response.data.code
          const text = response.data.text
          if (code === 0) {
            this.notifyMessage('提示', '写入成功！', 'success')
          } else {
            this.notifyMessage('错误', '写入失败：' + text, 'error')
          }
        } else {
          this.notifyMessage('提示', '写入失败！', 'error')
        }
      }).catch(error => {
        this.notifyMessage('错误', '写入失败：' + error, 'error')
      })
    },
    handleUpload() {
      this.uploadTableData = []
      this.uploadTableHeader = []
      this.uploadExcelVisible = !this.uploadExcelVisible
    }
  }
}
</script>
