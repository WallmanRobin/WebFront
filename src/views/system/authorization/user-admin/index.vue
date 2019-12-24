<template>
  <div class="app-container">
    <div class="filter-container">
      <el-autocomplete v-model="listQuery.user_code" class="inline-input" :fetch-suggestions="userCodeSearch" placeholder="用户代码" @keyup.enter.native="handleFilter" />
      <el-autocomplete v-model="listQuery.name" class="inline-input" :fetch-suggestions="nameSearch" placeholder="名称" @keyup.enter.native="handleFilter" />
      <query-btn :query-data="queryData" :table-labels="queryLabels" button-label="查询" :sel-visible="selVisible" @hideSelect="hideSelect" @handleSelect="handleSelect" @handleFilter="handleFilter" />
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">
        新增
      </el-button>
      <hr width="100%" size="3">
    </div>
    <div>
      <el-row>
        <el-col :span="6">
          <span style="font-weight:bold;">代码: </span>
          <span>
            <el-input v-model="user_code" placeholder="用户代码" style="width: 200px;" clearable class="filter-item" :disabled="userCodeDisabled" @change="updateChanged" />
          </span>
        </el-col>
        <el-col :span="6">
          <span style="font-weight:bold;">名称: </span>
          <span>
            <el-input v-model="name" placeholder="名称" style="width: 200px;" clearable class="filter-item" :disabled="nameDisabled" @change="updateChanged" />
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
        <el-col :span="3">
          <span>
            <el-button class="filter-item" style="margin-left: 10px;" type="primary" :disabled="nameDisabled" @click="pwdDlgVisible = true">
              设置密码
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
          <span style="font-weight:bold;">电话: </span>
          <span>
            <el-input v-model="phone" placeholder="电话" style="width: 200px;" clearable class="filter-item" :disabled="nameDisabled" @change="updateChanged" />
          </span>
        </el-col>
        <el-col :span="6">
          <span style="font-weight:bold;">邮箱: </span>
          <span>
            <el-input v-model="email" placeholder="邮箱" style="width: 200px;" clearable class="filter-item" :disabled="nameDisabled" @change="updateChanged" />
          </span>
        </el-col>
        <el-col :span="1" style="padding: 10px 0px 0px 0px;">
          <span style="font-weight:bold">头像: </span>
        </el-col>
        <el-col :span="2">
          <span>
            <imgPannel :avatar="avatar" :img-base="imgBase" :sub-dir="subDir" :common-portrait="commonPortrait" @portraitSelected="portraitSelected" />
          </span>
        </el-col>
        <el-col :span="6">
          <span>
            <el-button class="filter-item" style="margin-left: 10px;" type="primary" :disabled="updateDisabled" @click="handleUpdate">
              &nbsp;&nbsp;保&nbsp;&nbsp;&nbsp;存&nbsp;&nbsp;
            </el-button>
          </span>
        </el-col>
      </el-row>
    </div>
    <el-dialog :title="pwdDlg.title" center :visible.sync="pwdDlgVisible" width="30%">
      <div>
        <span style="font-weight:bold;">密码: </span>
        <span>
          <el-input v-model="pwdDlg.pwd" placeholder="密码" style="width: 200px;" clearable show-password class="filter-item" />
        </span>
      </div>
      <div>
        <span>
          &nbsp;
        </span>
      </div>
      <div>
        <span style="font-weight:bold;">确认: </span>
        <span>
          <el-input v-model="pwdDlg.confirmPwd" placeholder="确认" style="width: 200px;" show-password clearable class="filter-item" />
        </span>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="handlePassword">确 定</el-button>
        <el-button type="primary" @click="pwdDlgVisible = false">取消</el-button>
      </span>
    </el-dialog>
    <el-tabs style="margin-top:15px;" type="border-card">
      <el-tab-pane label="角色">
        <keep-alive>
          <UserRole ref="role" :role-data="roleData" @roleUpdated="roleUpdated" @roleRowUpdated="roleRowUpdated" />
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
import UserRole from './components/UserRole'
import { getUser, listUsers, updateUser, setPassword, pushUserAvatar } from '@/api/user-admin'
import queryBtn from '@/components/QueryBtn'
import imgPannel from '@/components/ImagePannel'

export default {
  name: 'RoleAdmin',
  components: { UserRole: UserRole, queryBtn: queryBtn, imgPannel: imgPannel },
  data() {
    return {
      listQuery: {
        user_code: undefined,
        name: undefined
      },
      infoDlg: {
        title: undefined,
        text: undefined
      },
      pwdDlg: {
        pwd: undefined,
        confirmPwd: undefined,
        title: '设置密码'
      },
      user_code: undefined,
      name: undefined,
      status: undefined,
      password: undefined,
      phone: undefined,
      email: undefined,
      avatar: undefined,
      userCodeDisabled: true,
      updateDisabled: true,
      nameDisabled: true,
      roleData: null,
      userCodes: [],
      userNames: [],
      userList: [],
      pwdDlgVisible: false,
      selVisible: false,
      queryData: [],
      queryLabels: [],
      infoDlgVisible: false,
      pannelVisibe: false,
      imgBase: undefined,
      subDir: undefined,
      commonPortrait: undefined
    }
  },
  mounted() {
    this.prepareUserNameCode()
    const base = process.env.VUE_APP_IMAGE_BASE
    this.commonPortrait = base + '/portraits/common/portrait.gif'
    this.subDir = 'cartoon'
    this.imgBase = base + '/portraits'
  },
  methods: {
    prepareUserNameCode() {
      listUsers().then(response => {
        if (response.data) {
          this.userCodes = response.data.map(i => ({ value: i.user_code }))
          this.userNames = response.data.map(i => ({ value: i.name }))
        }
      })
    },
    userCodeSearch(queryString, cb) {
      var userCodes = this.userCodes
      var results = queryString ? userCodes.filter(i => (i.value.toLowerCase().indexOf(queryString.toLowerCase()) === 0)) : userCodes
      // 调用 callback 返回建议列表的数据
      cb(results)
    },
    nameSearch(queryString, cb) {
      var userNames = this.userNames
      var results = queryString ? userNames.filter(i => (i.value.toLowerCase().indexOf(queryString.toLowerCase()) === 0)) : userNames
      // 调用 callback 返回建议列表的数据
      cb(results)
    },
    packQueryData(data) {
      this.queryData = data.map(i => ([i.user_code, i.name, i.phone, i.email]))
    },
    packUserData(u) {
      this.user_code = u.user_code
      this.name = u.name
      this.status = u.status
      this.password = undefined
      this.phone = u.phone
      this.email = u.email
      this.avatar = u.avatar
      if (u.role && u.role.length > 0) {
        this.roleData = u.role
      } else {
        this.roleData = [{ 'role_code': undefined, 'name': undefined }]
      }
    },
    handleFilter() {
      if (this.listQuery.user_code || this.listQuery.name) {
        this.userCodeDisabled = true
        this.updateDisabled = true
        this.nameDisabled = false
        this.userList = []
        this.$refs.role.listLoading = true
        this.packUserData({ 'user_code': undefined, 'name': undefined, 'status': undefined, 'phone': undefined, 'email': undefined, 'avatar': undefined })
        getUser(this.listQuery.user_code, this.listQuery.name).then(response => {
          if (response.data) {
            if (response.data.length > 0) {
              if (response.data.length === 1) {
                this.packUserData(response.data[0])
              } else {
                this.packQueryData(response.data)
                this.queryLabels = ['代码', '姓名', '电话', '邮箱']
                this.userList = response.data
                this.selVisible = true
              }
            }
          } else {
            this.clearUserItems()
          }
          this.$refs.role.listLoading = false
        })
      }
    },
    hideSelect() {
      this.selVisible = false
    },
    handleSelect(val) {
      if (this.userList.length > 0) {
        let u = this.userList.filter(i => (i.user_code === val[0]))
        if (u && u.length === 1) {
          u = u[0]
          this.packUserData(u)
        }
        this.selVisible = false
      }
    },
    handleCreate() {
      this.userCodeDisabled = false
      this.updateDisabled = true
      this.nameDisabled = false
      this.clearUserItems()
    },
    updateChanged() {
      this.updateDisabled = false
    },
    notifyMessage(title, text, type) {
      const h = this.$createElement
      this.$notify({
        title: title,
        message: h('i', { style: 'color: teal' }, text)
      })
    },
    validateRoleData() {
      if (this.roleData.length === 1 && !this.roleData.role_code) {
        return true
      }
      var a = this.roleData.filter(i => (!i.role_code))
      if (a.length > 0) {
        this.$refs.role.$refs.table.setCurrentRow(a[0])
        return false
      }
      return true
    },
    handleUpdate() {
      if (!this.validateRoleData()) {
        this.infoDlg.title = '错误'
        this.infoDlg.text = '角色列表中存在空值，请修改后再提交!!'
        this.infoDlgVisible = true
      } else {
        var u = { 'user_code': this.user_code, 'name': this.name, 'status': this.status, 'phone': this.phone, 'email': this.email, 'role': this.roleData }
        updateUser(u).then(response => {
          this.notifyMessage('提示', '保存成功！', 'success')
        }).catch(error => {
          this.notifyMessage('错误', '保存失败：' + error, 'error')
        })
      }
    },
    handlePassword() {
      if (this.pwdDlg.pwd !== this.pwdDlg.confirmPwd) {
        this.notifyMessage('错误', '两次密码不一致！', 'error')
      } else {
        var u = { 'user_code': this.user_code, 'password': this.pwdDlg.pwd }
        setPassword(u).then(response => {
          this.notifyMessage('提示', '密码设置成功！', 'success')
        }).catch(error => {
          this.notifyMessage('错误', '密码设置失败：' + error, 'error')
        })
        this.pwdDlgVisible = false
      }
    },
    disableCreateItems(b) {
      this.userCodeDisabled = b
      this.updateDisabled = b
    },
    clearUserItems() {
      this.code = undefined
      this.name = undefined
      this.status = true
      this.password = undefined
      this.phone = undefined
      this.email = undefined
      this.avatar = undefined
      this.roleData = [{ 'role_code': undefined, 'name': undefined, 'method': undefined }]
    },
    roleUpdated(updated) {
      this.updateDisabled = !updated
    },
    roleRowUpdated(roleData) {
      this.roleData = roleData
      this.updateDisabled = false
    },
    portraitSelected(item) {
      this.avatar = item
      if (this.user_code) {
        pushUserAvatar({ user_code: this.user_code, avatar: item }).then(response => {
          this.notifyMessage('提示', '头像保存成功！', 'success')
        }).catch(error => {
          this.notifyMessage('错误', '头像保存失败：' + error, 'error')
        })
      }
    }
  }
}
</script>
