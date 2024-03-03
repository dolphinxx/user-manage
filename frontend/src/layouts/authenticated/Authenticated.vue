<script lang="ts">

</script>
<script setup lang="ts">
import {useRouter} from "vue-router";
import {useAppStore} from "@/store/app.ts";
import {hasAuthCookie, redirectToLogin} from "@/composables/auth.ts";
import {getPrincipal, logout, updatePassword} from "@/api/common.ts";
import {ArrowDown, User} from "@element-plus/icons-vue";
import {ref, onMounted, toRaw, reactive, onUnmounted} from "vue";
import {type FormInstance, type FormRules} from "element-plus";

const store = useAppStore();
const router = useRouter();

const isCollapseMenu = ref(false);

function handleWindowResize() {
  isCollapseMenu.value = window.innerWidth < 768;
}

onMounted(async () => {
  window.addEventListener('resize', handleWindowResize);
  handleWindowResize();
  if (store.principal === null) {
    if (hasAuthCookie()) {
      // trigger remember me login
      try {
        const principal = await getPrincipal();
        store.setPrincipal(principal);
        // remember-me authentication success.
      } catch (ignore) {
        console.error(ignore);
        redirectToLogin(router);
        return;
      }
    } else {
      // redirect to login page
      redirectToLogin(router);
      return;
    }
  }
});

onUnmounted(() => {
  window.removeEventListener('resize', handleWindowResize);
})

const _logout = () => {
  logout();
  router.replace('/login');
}
const changingPassword = ref(false);
const changePasswordFormRef = ref<FormInstance>();
const changePasswordFormRules = reactive<FormRules<{ oldPassword: string; password: string }>>({
  oldPassword: [
    {required: true, message: '不能为空', trigger: 'blur'},
    {min: 6, max: 64, message: '至少需要6位字符', trigger: 'blur'},
  ],
  password: [
    {required: true, message: '不能为空', trigger: 'blur'},
    {min: 6, max: 64, message: '至少需要6位字符', trigger: 'blur'},
  ],
});

const changePasswordModel = ref<{ oldPassword: string; password: string }>({oldPassword: '', password: ''});
const resetChangePasswordForm = () => changePasswordFormRef.value?.resetFields();
const changePassword = () => {
  changingPassword.value = true;
}
const _updatePassword = async () => {
  if (!(await changePasswordFormRef.value?.validate(() => {
  }))) {
    return;
  }
  changePasswordFormRef.value?.clearValidate();
  try {
    await updatePassword(toRaw(changePasswordModel.value));
    changingPassword.value = false;
    ElMessage({
      type: 'success',
      message: '修改成功',
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
</script>

<template>
  <el-container v-loading="!store.principal" direction="vertical">
    <template v-if="store.principal">
      <el-header>
        <el-menu mode="horizontal" :ellipsis="false" :router="true" :default-active="$route.path">
          <div class="app-brand">逾期管理</div>
          <div class="spacer"></div>
          <el-dropdown class="header-user" v-if="store.principal">
            <span class="header-user-title">
              {{ store.principal!.name }}
              <el-icon class="el-icon--right">
                <arrow-down/>
              </el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="changePassword">修改密码</el-dropdown-item>
                <el-dropdown-item @click="_logout()">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </el-menu>
      </el-header>
      <el-container style="overflow: hidden;">
        <el-aside>
          <el-menu :collapse="isCollapseMenu" :router="true" :default-active="$route.path">
            <el-menu-item index="/overdue">
              <el-icon>
                <user />
              </el-icon>
              <span>逾期管理</span>
            </el-menu-item>
          </el-menu>
        </el-aside>
        <el-main>
          <div class="route-container">
            <router-view/>
          </div>
        </el-main>
      </el-container>
    </template>
  </el-container>
  <el-dialog v-model="changingPassword" title="修改密码" :close-on-click-modal="false" @close="resetChangePasswordForm">
    <el-form ref="changePasswordFormRef" :model="changePasswordModel" :rules="changePasswordFormRules">
      <el-form-item prop="oldPassword" label="当前密码">
        <el-input type="password" :clearable="true" v-model="changePasswordModel.oldPassword" show-password/>
      </el-form-item>
      <el-form-item prop="password" label="新的密码">
        <el-input type="password" :clearable="true" v-model="changePasswordModel.password" show-password/>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="changingPassword = false">取消</el-button>
      <el-button @click="_updatePassword">提交</el-button>
    </template>
  </el-dialog>
</template>

<style scoped lang="scss">
.el-header {
  --el-header-height: 50px;
  --el-menu-base-level-padding: 16px;
  --el-menu-horizontal-height: 50px;
}

.el-aside {
  --el-aside-width: 65px;
}

@media (min-width: 768px) {
  .el-aside {
    --el-aside-width: 150px;
  }
}

.header-user {
  margin: 0 16px;

  .header-user-title {
    cursor: pointer;
    display: flex;
    align-items: center;
    outline: none;

    .el-avatar {
      margin-right: 0.5rem;
    }
  }
}

.header {
  --el-menu-horizontal-height: 50px;
  width: 100%;

  .el-menu-item {
    border-bottom: none !important;
  }
}

.app-brand {
  width: 150px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: var(--el-color-primary);
}

.spacer {
  flex: 1;
}
</style>

<style lang="scss">
.el-header {
  --el-header-padding: 0;
  background-color: var(--el-bg-color);
  user-select: none;
}

.el-aside,
.app-brand {
  --el-aside-width: 200px;
  background-color: var(--el-bg-color);
  user-select: none;
}

.el-main {
  --el-main-padding: 0;
}

.route-container {
  padding: 8px 6px;
}
</style>
