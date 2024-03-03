import {defineStore} from "pinia";

export const useAppStore = defineStore('app', {
    state: () => (<{ principal: Principal | null }>{
        principal: null,
    }),
    actions: {
        setPrincipal(principal: Principal | null) {
            this.$state.principal = principal;
        },
    }
});
