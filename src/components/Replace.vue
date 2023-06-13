<template>
    <n-grid x-gap="12" :cols="4" :y-gap="12">
        <n-gi :span="4">
            <n-card>
                <n-upload
                        multiple
                        directory-dnd
                        :custom-request="customRequest"
                        :on-remove="fileRemove"
                        :file-list="fileList"
                >
                    <n-upload-dragger>
                        <div style="margin-bottom: 12px">
                            <n-icon size="48" :depth="3">
                                <archive-icon />
                            </n-icon>
                        </div>
                        <n-text style="font-size: 16px">
                            点击或者拖动文件到该区域来上传
                        </n-text>
                        <n-p depth="3" style="margin: 8px 0 0 0">
                            支持添加多个文件进行批量替换
                        </n-p>
                    </n-upload-dragger>
                </n-upload>
            </n-card>
        </n-gi>
        <n-gi :span="4">
            <n-card title="替换规则">
                <template #footer>
                    <n-space justify="center">
                        <n-button size="small" type="warning" ghost @click="clearRules">清空规则</n-button>
                        <n-button size="small" type="primary" ghost @click="addRules">添加规则</n-button>
                    </n-space>

                </template>
                <div>
                    <div>
                        <n-space justify="center">
                            <n-checkbox :checked="isCaseSensitive">区分大小写</n-checkbox>
                            <n-checkbox :checked="isMatchAllCharacters">全字符匹配</n-checkbox>
                        </n-space>
                    </div>
                    <div style="margin-top: 10px" v-for="item in Array.from(rules)">
                        <n-input-group>
                            <n-button type="primary">
                                将
                            </n-button>
                            <n-input :style="{ width: '50%' }" placeholder="不可为空" v-model:value="item.keyword"/>
                            <!--              placeholder="不可为空"-->
                            <n-button type="primary">
                                替换为
                            </n-button>
                            <!--              placeholder="为空则表示删除"-->
                            <n-input :style="{ width: '50%' }"  placeholder="为空则表示删除"  v-model:value="item.replaceKeyword" />
                            <n-button type="primary" ghost @click="deleteRules(item)">删除规则</n-button>
                        </n-input-group>
                    </div>
                </div>
            </n-card>
        </n-gi>
        <n-gi :span="4">
            <n-card title="保存方式">
                <n-space>
                    <n-radio name="save-type" :value="0" :checked="saveType===0" @change="saveTypeChangeHandler">另存为副本</n-radio>
                    <n-radio name="save-type" :value="1" :checked="saveType===1"  @change="saveTypeChangeHandler">覆盖源文件</n-radio>
                </n-space>
                <n-space vertical justify="center" v-show="saveType===0">
                    <n-button type="primary" dashed block @click="dirButtonHandler">{{dirButtonStr}}</n-button>
                </n-space>
            </n-card>
        </n-gi>
        <n-gi :span="4">
            <n-progress  type="line" v-show="replaceProgressShow"  status="success" :percentage="percentage" :show-indicator="false" />
        </n-gi>
        <n-gi :span="4">
              <n-button type="primary" @click="replace">开始替换</n-button>
        </n-gi>
    </n-grid>
</template>

<script setup lang="ts">
import {UploadCustomRequestOptions,UploadFileInfo,UploadInst,useMessage } from "naive-ui";
import {rep} from "../../electron/main/replace";
import {ref} from "vue";
import {openFileDialog } from '../../electron/preload/index'


const filePaths = new Set();
const fileList = ref<UploadFileInfo[]>()
const rules = ref(new Set([{keyword:"",replaceKeyword:""}]))
const keyword = ref<string>('');
const replaceKeyword = ref<string>('');
const uploadRef = ref<UploadInst | null>(null)
const isCaseSensitive = ref(true)
const isMatchAllCharacters = ref(true)
const saveType = ref(0)
const dirButtonStr = ref("选择保存的文件夹")
const savePath = ref("")
const message = useMessage()
const percentage = ref(0)
const replaceProgressShow = ref(false)

function customRequest(options:UploadCustomRequestOptions) {
  if(options.file.file){
    filePaths.add(options.file.file.path)
  }
}
function fileRemove(fileInfo: UploadFileInfo){
  let file = fileInfo.file
  if(file){
    filePaths.delete(file?.file.path)
  }
}

function saveTypeChangeHandler(e:Event){
  saveType.value = Number((e.target as HTMLInputElement).value)
}
function reset(){
  filePaths.clear()
  fileList.value = new Array<UploadFileInfo>()
  uploadRef.value?.clear()
  keyword.value = ''
  replaceKeyword.value = ''
  savePath.value = ''
  dirButtonStr.value = "选择保存的文件夹"
  rules.value = new Set([{keyword:"",replaceKeyword:""}]);
  percentage.value = 0
  replaceProgressShow.value = false
}

async function dirButtonHandler(){
  const result = await openFileDialog({
    properties: ['openDirectory'],
  });
  if(result[0]){
    savePath.value = result[0]
    dirButtonStr.value = result[0]
  }
}

function replace(){
  if(filePaths.size <= 0){
      message.error('还未选择需要替换的文件')
      return
  }
  if(rules.value.size <= 0){
      message.error('还未填写需要替换的字符')
      return
  }
  if(saveType.value === 0 && savePath.value.length <= 0){
      message.error('还未选择要保存的目标文件夹')
      return
  }

    replaceProgressShow.value = true
    let c = 100/filePaths.size
    filePaths.forEach(path =>{
        rep(path,saveType.value === 0? savePath.value : "",rules.value)
        percentage.value += c
    })
    percentage.value = 100
    message.success('任务已完成')
    reset()
}

function clearRules(){
  rules.value = new Set([{keyword:"",replaceKeyword:""}])
}

function addRules(){
  rules.value.add({keyword:"",replaceKeyword:""})
}

function deleteRules(item:any){
  rules.value.delete(item)
}
</script>

<style>
</style>
