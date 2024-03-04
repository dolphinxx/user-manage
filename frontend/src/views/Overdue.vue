<script setup lang="ts">
import {onMounted, ref, toRaw, reactive} from 'vue';
import {type FormInstance, genFileId, type UploadInstance, type UploadProps, type UploadRawFile} from "element-plus";
import * as userApi from "@/api/user.ts";
import {requiredRule, toValidator} from "@/utils/validation.ts";
import {renderDate} from "@/utils/render.ts";
import {UploadFilled} from "@element-plus/icons-vue";
import {exportFileUrl, importFileUrl} from "@/api/user.ts";
import {apiPrefix} from "@/api/request.ts";

const formRules = reactive({
  name: [{validator: toValidator([requiredRule]), trigger: 'blur'}],
});

const items = ref<OverdueUser[]>();
const totalPages = ref(0);
const totalCount = ref(0);

const searchParams = ref({name: '', phone: '', idCard: ''});
const searchFormRef = ref<FormInstance>();
const paginateParams = ref({pageNo: 1, pageSize: 10});
const loadDataState = ref(false);
const loadData = async () => {
  try {
    loadDataState.value = true;
    const params = {...toRaw(searchParams.value), ...toRaw(paginateParams.value)};
    const data: {
      page: number;
      size: number;
      totalPages: number;
      totalCount: number;
      items: OverdueUser[]
    } = await userApi.paginateUser(params);
    items.value = data.items;
    totalPages.value = data.totalPages;
    totalCount.value = data.totalCount;
  } catch (err) {
    ElMessage({
      showClose: true,
      type: 'error',
      message: String(err),
    });
  } finally {
    loadDataState.value = false;
  }
}
const resetSearchForm = () => searchFormRef.value?.resetFields();

const creating = ref(false);
const creatingModel = ref<{ name: string; phone: string; idCard: string; remark?: string }>({
  name: '',
  phone: '',
  idCard: '',
  remark: ''
});
const creatingFormRef = ref<FormInstance>();
const clearCreatingForm = () => creatingFormRef.value?.resetFields();

const editing = ref(false);
const defaultEditingModel = {id: 0, name: '', phone: '', idCard: '', remark: ''};
const editingModel = ref<{
  id: number;
  name: string;
  phone: string;
  idCard: string;
  remark?: string
}>(defaultEditingModel);
const editingFormRef = ref<FormInstance>();
const clearEditingForm = () => editingModel.value = defaultEditingModel;

const createRow = () => {
  creating.value = true;
}

const saveRow = async () => {
  try {
    if (!(await creatingFormRef.value!.validate(() => {
    }))) {
      return;
    }
    creatingFormRef.value!.clearValidate();
    const result = await userApi.saveUser(toRaw(creatingModel.value));
    creating.value = false;
    if (result) {
      items.value?.push(result);
    } else {
      loadData();
    }
    ElMessage({
      type: 'success',
      message: '新增成功',
    });
  } catch (err) {
    ElNotification({
      type: 'error',
      title: '操作失败',
      message: String(err),
      duration: 6000,
    });
  }
}

const editRow = async (id: number) => {
  const data = await userApi.getUser(id);
  if (!data) {
    ElNotification({
      type: 'error',
      title: '操作失败',
      message: '记录不存在',
      duration: 6000,
    });
    return;
  }
  editingModel.value = {
    id: data.id,
    name: data.name,
    phone: data.phone,
    idCard: data.idCard,
    remark: data.remark,
  };
  editing.value = true;
}

const updateRow = async () => {
  try {
    if (!(await editingFormRef.value!.validate(() => {
    }))) {
      return;
    }
    editingFormRef.value!.clearValidate();
    const row = toRaw(editingModel.value);
    const id = (row as any).id;
    const result = await userApi.updateUser(row);
    editing.value = false;
    if (result) {
      items.value!.splice(items.value!.findIndex(item => (item as any).id === id), 1, result);
    } else {
      loadData();
    }
    ElMessage({
      type: 'success',
      message: '修改成功',
    });
  } catch (err) {
    ElNotification({
      type: 'error',
      title: '操作失败',
      message: String(err),
      duration: 0,
    });
  }
}

const deleteRow = async (id: number) => {
  ElMessageBox.confirm('确定要删除吗？',
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
  ).then(() => {
    return userApi.deleteUser(id).then(() => {
      items.value!.splice(items.value!.findIndex(item => (item as any).id === id), 1);
      ElMessage({
        type: 'success',
        message: '删除成功',
      });
    }).catch(err => {
      ElNotification({
        type: 'error',
        title: '操作失败',
        message: String(err),
        duration: 6000,
      });
    })
  }).catch(() => {

  })
}
const submittingFile = ref([]);
const uploadRef = ref<UploadInstance>();
const importing = ref(false);
const uploading = ref(false);
const handleUploadSuccess = (response:R<number>) => {
  uploading.value = false;
  if (response.status !== 200) {
    uploadRef.value?.clearFiles();
    ElNotification({
      type: 'error',
      title: '导入失败',
      message: response.message,
      duration: 6000,
    });
    return;
  }
  importing.value = false;
  ElMessage({
    type: 'success',
    message: `成功导入${response.data}条记录`,
  });
}
const handleUploadError = (err: any) => {
  uploading.value = false;
  uploadRef.value?.clearFiles();
  ElNotification({
    type: 'error',
    title: '导入失败',
    message: String(err),
    duration: 6000,
  });
}

const handleUploadExceed: UploadProps['onExceed'] = (files) => {
  uploadRef.value!.clearFiles()
  const file = files[0] as UploadRawFile
  file.uid = genFileId()
  uploadRef.value!.handleStart(file)
}

const importData = () => {
  importing.value = true;
}

const submitImport = () => {
  // if(!uploadRef.value!.fileList || uploadRef.value!.fileList.length === 0) {
  //   ElMessage({
  //     type: 'error',
  //     message: '请选择要上传的文件'
  //   });
  //   return;
  // }
  uploadRef.value!.submit();
  uploading.value = true;
}

const clearSubmittingFile = () => submittingFile.value = [];

const exportData = () => {
  window.open(exportFileUrl);
}

const downloadTpl = () => {
  window.open(`${apiPrefix}/download?file=%E4%BC%9A%E5%91%98%E4%BF%A1%E6%81%AF%E5%AF%BC%E5%85%A5%E6%A8%A1%E6%9D%BF.xlsx`)
}

onMounted(() => loadData());
</script>

<template>
  <el-container>
    <el-card style="flex: 1;">
      <div>
        <el-form class="crud-form" ref="searchFormRef" :inline="true" :model="searchParams">
          <el-form-item label="姓名" prop="name">
            <el-input name="name" :clearable="true" v-model="searchParams.name" @keydown.enter="loadData"/>
          </el-form-item>
          <el-form-item label="身份证" prop="idCard">
            <el-input name="idCard" :clearable="true" v-model="searchParams.idCard" @keydown.enter="loadData"/>
          </el-form-item>
          <el-form-item label="电话" prop="phone">
            <el-input name="phone" :clearable="true" v-model="searchParams.phone" @keydown.enter="loadData"/>
          </el-form-item>
          <el-button type="primary" @click="loadData">查询</el-button>
          <el-button :plain="true" @click="resetSearchForm">重置</el-button>
        </el-form>
      </div>
      <div class="crud-toolbar">
        <div>
          <el-button type="primary" @click="createRow">新增</el-button>
          <el-button type="primary" @click="importData">导入</el-button>
          <el-button type="primary" @click="exportData">导出</el-button>
        </div>
        <div></div>
      </div>
      <div class="crud-table">
        <el-table :border="true" row-key="id" :data="items">
          <el-table-column type="index" label="#"></el-table-column>
          <el-table-column label="编号">
            <template #default="{row}">
              <span>{{ (row as OverdueUser).id }}</span>
            </template>
          </el-table-column>
          <el-table-column label="姓名">
            <template #default="{row}">
              <span>{{ (row as OverdueUser).name }}</span>
            </template>
          </el-table-column>
          <el-table-column label="身份证">
            <template #default="{row}">
              <span>{{ (row as OverdueUser).idCard }}</span>
            </template>
          </el-table-column>
          <el-table-column label="电话">
            <template #default="{row}">
              <span>{{ (row as OverdueUser).phone }}</span>
            </template>
          </el-table-column>
          <el-table-column label="备注">
            <template #default="{row}">
              <span>{{ (row as OverdueUser).remark }}</span>
            </template>
          </el-table-column>
          <el-table-column label="创建时间">
            <template #default="{row}">
              <span>{{ renderDate((row as OverdueUser).createTime) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" class-name="operations">
            <template #default="{row}">
              <el-button :link="true" type="primary" @click="editRow(row.id)">修改</el-button>
              <el-button :link="true" type="danger" @click="deleteRow(row.id)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div class="crud-footer">
        <div></div>
        <el-pagination v-model:current-page="paginateParams.pageNo" v-model:page-size="paginateParams.pageSize"
                       :background="true" :page-count="totalPages" :total="totalCount" @current-change="loadData"
                       @size-change="loadData" layout="total,sizes,prev,pager,next,jumper"></el-pagination>
      </div>
    </el-card>
  </el-container>
  <el-dialog v-model="creating" @close="clearCreatingForm" title="新增" :close-on-click-modal="false">
    <el-form ref="creatingFormRef" :model="creatingModel" :rules="formRules">
      <el-form-item label="姓　名" prop="name">
        <el-input :clearable="true" v-model="creatingModel.name"></el-input>
      </el-form-item>
      <el-form-item label="身份证" prop="idCard">
        <el-input :clearable="true" v-model="creatingModel.idCard"></el-input>
      </el-form-item>
      <el-form-item label="电　话" prop="phone">
        <el-input :clearable="true" v-model="creatingModel.phone"></el-input>
      </el-form-item>
      <el-form-item label="备　注" prop="remark">
        <el-input type="textarea" :clearable="true" v-model="creatingModel.remark"></el-input>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="creating = false">取消</el-button>
      <el-button @click="saveRow">提交</el-button>
    </template>
  </el-dialog>
  <el-dialog v-model="editing" @close="clearEditingForm" title="修改" :close-on-click-modal="false">
    <el-form ref="editingFormRef" :model="editingModel" :rules="formRules">
      <el-form-item label="姓　名" prop="name">
        <el-input :clearable="true" v-model="editingModel.name"></el-input>
      </el-form-item>
      <el-form-item label="身份证" prop="idCard">
        <el-input :clearable="true" v-model="editingModel.idCard"></el-input>
      </el-form-item>
      <el-form-item label="电　话" prop="phone">
        <el-input :clearable="true" v-model="editingModel.phone"></el-input>
      </el-form-item>
      <el-form-item label="备　注" prop="remark">
        <el-input type="textarea" :clearable="true" v-model="editingModel.remark"></el-input>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="editing = false">取消</el-button>
      <el-button @click="updateRow">提交</el-button>
    </template>
  </el-dialog>
  <el-dialog v-model="importing" title="批量导入" @closed="clearSubmittingFile" :close-on-click-modal="false">
    <el-upload v-model:file-list="submittingFile" class="overdue-uploader" :limit="1" :drag="true" :auto-upload="false"
               accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
               :action="importFileUrl" ref="uploadRef" :on-exceed="handleUploadExceed" @error="handleUploadError"
               @success="handleUploadSuccess">
      <el-icon class="el-icon--upload">
        <upload-filled/>
      </el-icon>
      <div class="el-upload__text">
        <span>将文件拖拽到此处，或</span>
        <em>点击上传</em>
      </div>
      <template #tip>
        <div class="el-upload__tip">
          <span>仅允许导入xls、xlsx格式文件。</span>
          <a @click="downloadTpl">下载模板</a>
        </div>
      </template>
    </el-upload>
    <template #footer>
      <el-button @click="importing = false">取消</el-button>
      <el-button :disabled="submittingFile.length === 0" type="primary" @click="submitImport">提交</el-button>
    </template>
  </el-dialog>
</template>

<style lang="scss">
.crud-form,
.crud-toolbar > * {
  margin: -6px;

  .el-form-item {
    margin-right: 0;
  }

  & > * {
    margin: 6px !important;
  }
}

.crud-toolbar,
.crud-footer {
  display: flex;
  justify-content: space-between;
  margin-top: 12px;
}

.crud-table {
  margin-top: 12px;
}

.crud-form {
  display: flex;
  flex-wrap: wrap;
  flex-direction: row;


  label {
    white-space: nowrap;
    flex-grow: 0;
    flex-shrink: 0;
    align-items: center;
    display: inline-flex;

    .control-label {
      margin-right: 0.5rem;
    }
  }
}

.overdue-uploader {
  .el-upload__tip {
    a {
      color: var(--el-color-primary);
      cursor: pointer;
    }
  }
}
</style>

