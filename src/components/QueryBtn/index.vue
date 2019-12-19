<template>
  <el-popover v-model="selVisible" placement="right" width="250" trigger="manual">
    <el-table :data="queryData" highlight-current-row @current-change="handleSelect">
      <el-table-column type="index" width="20" />
      <el-table-column v-for="i in labels.length" :key="i-1" width="100" :label="labels[i-1]">
        <template slot-scope="scope">
          {{ scope.row[i-1] }}
        </template>
      </el-table-column>
    </el-table>
    <el-button
      slot="reference"
      v-waves
      class="filter-item"
      type="primary"
      icon="el-icon-search"
      @click="handleFilter"
    >
      查询
    </el-button>
  </el-popover>
</template>

<script>
import waves from '@/directive/waves'
export default {
  name: 'QueryBtn',
  directives: { waves },
  props: {
    queryData: { type: Array, default: function() { return [] } },
    labels: { type: Array, default: function() { return [] } },
    selVisible: Boolean
  },
  data() {
    return {
      infoDlg: {
        title: undefined,
        text: undefined
      },
      name: undefined,
      oldEndpointData: null,
      allEndpoints: null,
      listLoading: true,
      infoDlgVisible: false,
      addDlgVisible: false
    }
  },
  methods: {
    handleSelect(val) {
      this.$emit('handleSelect', val)
    },
    handleFilter() {
      if (!this.selVisible) {
        this.$emit('handleFilter')
      } else {
        this.$emit('hideSelect')
      }
    }
  }
}
</script>

<style scoped>

</style>
