<script setup lang="ts">
import {onMounted, ref, toRaw, reactive} from 'vue';
import {type FormInstance} from "element-plus";
import * as userApi from "@/api/user.ts";
import {requiredRule, toValidator} from "@/utils/validation.ts";
import {renderDate} from "@/utils/render.ts";

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
    const data: { page: number; size: number; totalPages: number; totalCount: number; items: OverdueUser[] } = await userApi.paginateUser(params);
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
const creatingModel = ref<{ name: string; phone: string; idCard: string; remark?: string }>({name: '', phone: '', idCard: '', remark: ''});
const creatingFormRef = ref<FormInstance>();
const clearCreatingForm = () => creatingFormRef.value?.resetFields();

const editing = ref(false);
const defaultEditingModel = {id: 0, name: '', phone: '', idCard: '', remark: ''};
const editingModel = ref<{ id: number; name: string; phone: string; idCard: string; remark?: string }>(defaultEditingModel);
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
          <el-form-item label="电话" prop="phone">
            <el-input name="phone" :clearable="true" v-model="searchParams.phone" @keydown.enter="loadData"/>
          </el-form-item>
          <el-form-item label="身份证" prop="idCard">
            <el-input name="idCard" :clearable="true" v-model="searchParams.idCard" @keydown.enter="loadData"/>
          </el-form-item>
          <el-button type="primary" @click="loadData">查询</el-button>
          <el-button :plain="true" @click="resetSearchForm">重置</el-button>
        </el-form>
      </div>
      <div class="crud-toolbar">
        <div>
          <el-button type="primary" @click="createRow">新增</el-button>
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
          <el-table-column label="电话">
            <template #default="{row}">
              <span>{{ (row as OverdueUser).phone }}</span>
            </template>
          </el-table-column>
          <el-table-column label="身份证">
            <template #default="{row}">
              <span>{{ (row as OverdueUser).idCard }}</span>
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
      <el-form-item label="电　话" prop="phone">
        <el-input :clearable="true" v-model="creatingModel.phone"></el-input>
      </el-form-item>
      <el-form-item label="身份证" prop="idCard">
        <el-input :clearable="true" v-model="creatingModel.idCard"></el-input>
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
      <el-form-item label="电　话" prop="phone">
        <el-input :clearable="true" v-model="editingModel.phone"></el-input>
      </el-form-item>
      <el-form-item label="身份证" prop="idCard">
        <el-input :clearable="true" v-model="editingModel.idCard"></el-input>
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
</style>
