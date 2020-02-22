<template>
  <div class="app-container">
    <div>
      <div style="display:inline-block;padding: 0px 0px 10px 0px">
        <label class="radio-label" style="padding-left:0;">文件名: &nbsp;&nbsp;&nbsp;</label>
        <el-input v-model="filename" placeholder="请输入导出模板文件名 (默认为excel-list)" style="width:345px;" prefix-icon="el-icon-document" />
      </div>
      <br>
      <div style="display:inline-block;padding: 0px 0px 10px 0px">
        <label class="radio-label">文件类型: </label>
        <el-select v-model="bookType" style="width:120px;">
          <el-option
            v-for="item in ['xlsx', 'csv', 'txt']"
            :key="item"
            :label="item"
            :value="item"
          />
        </el-select>
      </div>
      <br>
      <div style="display:inline-block;">
        <label class="radio-label">自动定宽: </label>
        <el-radio-group v-model="autoWidth">
          <el-radio :label="true" border>
            是
          </el-radio>
          <el-radio :label="false" border>
            否
          </el-radio>
        </el-radio-group>
      </div>
      <el-button :loading="downloadLoading" style="margin:0 0 20px 50px" type="primary" icon="el-icon-document" @click="handleDownload">
        导出
      </el-button>
    </div>
  </div>
</template>

<script>
// import { parseTime } from '@/utils'
// options components

export default {
  name: 'ExportExcel',
  props: { excelData: { type: Array, default: function() { return [] } }, excelHeader: { type: Array, default: function() { return [] } }},
  data() {
    return {
      list: null,
      downloadLoading: false,
      filename: '',
      autoWidth: true,
      bookType: 'xlsx'
    }
  },
  methods: {
    handleDownload() {
      this.downloadLoading = true
      import('@/vendor/Export2Excel').then(excel => {
        const tHeader = this.excelHeader
        const data = this.excelData
        excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: this.filename,
          autoWidth: this.autoWidth,
          bookType: this.bookType
        })
        this.downloadLoading = false
      })
    }
  }
}
</script>

<style>
.radio-label {
  font-size: 14px;
  color: #606266;
  line-height: 40px;
}
</style>
