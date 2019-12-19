<template>
  <el-popover v-model="pannelVisibe" placement="right" width="500" trigger="manual">
    <div class="icons-container">
      <div v-for="item of images" :key="item" @click="portraitSelected(item)">
        <el-tooltip placement="top-start">
          <div slot="content">
            {{ generateName(item) }}
          </div>
          <div class="icon-item">
            <img :src="imgBase + '/' + subDir + '/' + item">
          </div>
        </el-tooltip>
      </div>
    </div>
    <img slot="reference" class="img-circle" :src="portrait_url" @click="handleSelectPortrait">
  </el-popover>
</template>

<script>
import { listCartoonPortraits } from '@/api/util'

export default {
  name: 'ImagePannel',
  props: {
    avatar: { type: String, default: undefined },
    commonPortrait: { type: String, default: undefined },
    imgBase: { type: String, default: undefined },
    subDir: { type: String, default: undefined }
  },
  data() {
    return {
      images: [],
      pannelVisibe: false
    }
  },
  computed: {
    portrait_url: function() {
      return this.avatar ? (this.imgBase + '/' + this.avatar) : this.commonPortrait
    }
  },
  methods: {
    generateName(item) {
      let p = item.indexOf('.')
      p = (p !== -1) ? p : item.length
      return item.slice(0, p)
    },
    portraitSelected(item) {
      const img = this.subDir + '/' + item
      this.$emit('portraitSelected', img)
      this.pannelVisibe = false
    },
    handleSelectPortrait() {
      if (this.pannelVisibe) {
        this.pannelVisibe = false
      } else {
        if (this.images.length <= 0) {
          listCartoonPortraits().then(response => {
            if (response.data) {
              if (response.data.length > 0) {
                this.images = response.data
                this.pannelVisibe = true
              }
            }
          })
        } else {
          this.pannelVisibe = true
        }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.icons-container {
  margin: 10px 20px 0;
  overflow: hidden;

  .icon-item {
    margin: 5px;
    height: 60px;
    text-align: center;
    width: 60px;
    float: left;
    font-size: 10px;
    color: #24292e;
    cursor: pointer;
    img {
      width: 60px;
      height: 60px;
    }
    img:active {
      //按钮压下效果
      transform: translateY(2px);
    }
  }

  span {
    display: block;
    font-size: 16px;
    margin-top: 10px;
  }

  .disabled {
    pointer-events: none;
  }
}

.img-circle {
  width: 32px;
  height: 32px;
  cursor: pointer;
  transform: translateY(5%);
}

.img-circle:active {
  //按钮压下效果
  transform: translateY(10%);
}
</style>
