<script setup lang="ts">
// @ts-ignore
import zhCn from 'element-plus/dist/locale/zh-cn.mjs';
</script>

<template>
  <div class="app">
    <el-config-provider :locale="zhCn">
      <router-view/>
    </el-config-provider>
  </div>
</template>
