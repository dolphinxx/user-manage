<script setup lang="ts">
import {ref, reactive} from 'vue';
import {useRouter} from "vue-router";
import {useAppStore} from "@/store/app.ts";
import {type FormInstance, type FormRules} from "element-plus";
import { toValidator, requiredRule, usernameRule, lengthBetweenRuleBuilder } from "@/utils/validation";
import {login} from "@/api/common.ts";
import {User, Lock} from '@element-plus/icons-vue';
import {clearLoginRedirectUrl, getLoginRedirectUrl} from "@/composables/auth.ts";


const router = useRouter();
const store = useAppStore();

const formRef = ref<FormInstance>();
const loginForm = ref({
  username: '',
  password: '',
  rememberMe: false,
});
const errorMsg = ref("");

const rules = reactive<FormRules>({
  username: [{validator: toValidator([requiredRule, usernameRule, lengthBetweenRuleBuilder(4, 20)]), trigger: 'blur'}],
  password: [{validator: toValidator([requiredRule, lengthBetweenRuleBuilder(6, 20)]), trigger: 'blur'}],
});

const loginState = ref(false);

const handleLoginSuccess = () => {
  const redirectUrl = getLoginRedirectUrl();
  clearLoginRedirectUrl();
  router.replace(redirectUrl || "/");
}

const submitLogin = async () => {
  if (!(await formRef.value!.validate())) {
    return;
  }
  loginState.value = true;
  formRef.value!.clearValidate();
  errorMsg.value = "";
  login(loginForm.value.username, loginForm.value.password, loginForm.value.rememberMe).then(r => {
    store.setPrincipal(r);
    handleLoginSuccess();
  }).catch(e => {
    console.error(e);
    errorMsg.value = e.message || e;
  }).finally(() => loginState.value = false);
};
</script>

<template>
  <el-container>
    <div class="login-main">
      <el-card class="login-panel">
        <el-form ref="formRef" :model="loginForm" :rules="rules">
          <div class="login-brand">
<!--            <el-image class="logo" :src="logo"></el-image>-->
            <span>逾期管理</span>
          </div>
          <el-alert v-if="errorMsg" type="error" :title="errorMsg" :closable="false"></el-alert>
          <div class="form-label">账号</div>
          <el-form-item prop="username">
            <el-input v-model.trim="loginForm.username" placeholder="请输入账号" :prefix-icon="User" size="large"/>
          </el-form-item>
          <div class="form-label">
            <span>密码</span>
<!--            <a class="text-caption text-decoration-none text-blue" href="#" rel="noopener noreferrer" tabindex="-1">-->
<!--              忘记密码？</a>-->
          </div>
          <el-form-item prop="password">
            <el-input v-model.trim="loginForm.password" placeholder="请输入密码" type="password" :prefix-icon="Lock"
                      size="large" @keydown.enter="submitLogin" show-password/>
          </el-form-item>
          <div>
            <el-checkbox v-model="loginForm.rememberMe" label="记住登录状态"/>
          </div>
          <el-button type="primary" size="large" style="width: 100%;" @click="submitLogin" :loading="loginState">登录
          </el-button>
        </el-form>
      </el-card>
    </div>
  </el-container>
</template>

<style lang="scss" scoped>
.login-main {
  width: 100%;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--el-color-primary-light-3);
}

.login-panel {
  width: 448px;
  --el-card-padding: 48px;

  .login-brand {
    margin: 24px 0;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 1.75rem;

    .logo {
      margin-right: 0.5rem;
    }
  }

  .form-label {
    display: flex;
    justify-content: space-between;
    padding: 0.5rem 0;

    a {
      color: var(--el-color-primary);
      font-size: 0.75rem;
      font-weight: 400;
      line-height: 1.25rem;
      text-decoration: none;
    }
  }

  .error-msg {
    color: var(--el-color-error);
    padding: 0.25rem 0;
  }
}
</style>
