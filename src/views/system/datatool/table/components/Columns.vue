<template>
  <div class="app-container">
    <el-table ref="table" v-loading="listLoading" :data="columns" border fit highlight-current-row style="width: 100%;">
      <el-table-column label="列名" sortable="custom" align="center" width="250px">
        <template slot-scope="scope">
          <el-input v-model="scope.row.name" placeholder="列名" style="width: 220px;" :disabled="mode==='reflect'" clearable class="filter-item" @change="changeColumn(scope.row)" @focus="focusColumn" />
        </template>
      </el-table-column>
      <el-table-column label="类型" align="center" width="160px">
        <template slot-scope="{row}">
          <el-select v-model="row.type" reserve-keyword :disabled="mode==='reflect'" @focus="focusColumn" @change="changeType(row)">
            <el-option v-for="item in ['Integer','Float', 'DECIMAL', 'String', 'Date', 'DateTime', 'Text']" :key="item" :label="item" :value="item" />
          </el-select>
        </template>
      </el-table-column>
      <el-table-column label="长度" align="center" width="150px">
        <template slot-scope="{row}">
          <el-input v-model="row.length" placeholder="长度" style="width: 120px;" :disabled="(row.type === 'Integer' || row.type === 'Date' || row.type === 'DateTime' || row.type === 'Text') || mode==='reflect'" clearable class="filter-item" @change="updateEmit" @focus="focusColumn" />
        </template>
      </el-table-column>
      <el-table-column label="小数位数" align="center" width="150px">
        <template slot-scope="{row}">
          <el-input v-model="row.scale" placeholder="位数" style="width: 120px;" :disabled="!(row.type === 'DECIMAL' || row.type === 'Float') || mode==='reflect'" clearable class="filter-item" @change="updateEmit" @focus="focusColumn" />
        </template>
      </el-table-column>
      <el-table-column label="主键" align="center" width="100px">
        <template slot-scope="scope">
          <el-checkbox v-model="scope.row.primary_key" :disabled="mode==='reflect'" @change="updateEmit" @focus="focusColumn" />
        </template>
      </el-table-column>
      <el-table-column label="允许空值" align="center" width="100px">
        <template slot-scope="scope">
          <el-checkbox v-model="scope.row.nullable" :disabled="mode==='reflect'" @change="updateEmit" @focus="focusColumn" />
        </template>
      </el-table-column>
      <el-table-column label="自增长" align="center" width="100px">
        <template slot-scope="scope">
          <el-checkbox v-model="scope.row.autoincrement" :disabled="scope.row.type !== 'Integer' || mode==='reflect'" @change="updateEmit" @focus="focusColumn" />
        </template>
      </el-table-column>
      <el-table-column label="动作" align="center" width="200" class-name="small-padding fixed-width">
        <template slot-scope="{row}">
          <el-button icon="el-icon-plus" type="primary" size="mini" @click="handleAddColumn(row)" />
          <el-button icon="el-icon-minus" type="danger" size="mini" @click="handleRemoveColumn(row)" />
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import { alertError } from '@/utils'

export default {
  props: { columns: { type: Array, default: function() { return [] } }, mode: { type: String, default: '' }},
  data() {
    return {
      oldColumns: null,
      listLoading: false,
      infoDlgVisible: false
    }
  },
  methods: {
    changeColumn(row) {
      const a = this.columns.filter(i => (i.name === row.name))
      if (a.length <= 1) {
        this.updateEmit()
        this.oldColumns = JSON.parse(JSON.stringify(this.columns))
      } else {
        this.columns = JSON.parse(JSON.stringify(this.oldColumns))
        this.updateEmit()
        alertError(this, '错误', '数据列列表中存在重复值，请修改后再提交!')
      }
    },
    focusColumn(event) {
      this.oldColumns = JSON.parse(JSON.stringify(this.columns))
    },
    handleAddColumn(row) {
      const i = this.columns.indexOf(row)
      this.columns.splice(i + 1, 0, { name: '', type: '', length: 0, scale: 0, primary_key: false, nullable: false, autoincrement: false })
      this.updateEmit()
    },
    handleRemoveColumn(row) {
      const i = this.columns.indexOf(row)
      this.columns.splice(i, 1)
      this.updateEmit()
    },
    handleCreate() {
      this.clearColumnItems()
    },
    clearColumnItems() {
      this.columns = [{ name: '', type: '', length: 0, scale: 0, primary_key: false, nullable: false, autoincrement: false }]
      this.oldColumns = [{ name: '', type: '', length: 0, scale: 0, primary_key: false, nullable: false, autoincrement: false }]
      this.updateEmit()
    },
    updateEmit() {
      const o = JSON.parse(JSON.stringify(this.columns))
      this.$emit('columnsUpdated', o)
    },
    changeType(row) {
      if (row.type !== 'Integer') {
        row.autoincrement = false
      }
      if (row.type !== 'DECIMAL' || row.type !== 'Float') {
        row.scale = 0
      }
      this.updateEmit()
    }
  }
}
</script>
