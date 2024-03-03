import {postForm, request} from "@/api/request";

export const login = async (
    username: string,
    password: string,
    rememberMe: boolean
): Promise<Principal> => {
    return request<Principal>("/login", {
        method: "POST",
        body: new URLSearchParams({
            username,
            password,
            rememberMe: rememberMe + "",
        }).toString(),
    });
};

export const logout = async (): Promise<void> => request<void>("/logout");

export const updatePassword = async (params: { oldPassword: string; password: string }): Promise<void> => postForm('/change_password', params);

export const getPrincipal = async () => request<Principal>("/principal");

