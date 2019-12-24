<template>
  <el-popover v-model="selVisible" :placement="placement" :width="tableWidth" trigger="manual" style="overflow: auto">
    <el-table :data="queryData" highlight-current-row @current-change="handleSelect">
      <el-table-column type="index" width="50" />
      <el-table-column v-for="i in tableLabels.length" :key="i-1" width="columnWidth" :label="tableLabels[i-1]">
        <template slot-scope="scope">
          {{ scope.row[i-1] }}
        </template>
      </el-table-column>
    </el-table>
    <el-button
      slot="reference"
      class="filter-item"
      type="primary"
      icon="el-icon-search"
      @click="handleFilter"
    >
      {{ buttonLabel }}
    </el-button>
  </el-popover>
</template>

<script>
export default {
  name: 'QueryBtn',
  props: {
    queryData: { type: Array, default: function() { return [] } },
    tableLabels: { type: Array, default: function() { return [] } },
    selVisible: Boolean,
    buttonLabel: { type: String, default: '查询' },
    tableWidth: { type: String, default: '350' },
    columnWidth: { type: String, default: '150' },
    placement: { type: String, default: 'right' }
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
