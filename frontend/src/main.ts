import {createApp} from 'vue';
import '@/style.scss';
import App from '@/App.vue';
import router from "@/router";
import {createPinia} from 'pinia'
import {useAppStore} from "@/store/app.ts";
import {redirectToLogin} from "@/composables/auth.ts";
import {applyRequestHandlers} from "@/api/request.ts";

const app = createApp(App);

app.use(createPinia());
app.use(router);

app.mount('#app')
useAppStore();
applyRequestHandlers({loginHandler: () => redirectToLogin(router)});
