import {postForm, request} from "@/api/request.ts";

export const getUser = async (id: number): Promise<OverdueUser | null> => request('/user/detail', {query: {id}});
export const paginateUser = async (params: { name?: string; phone?: string; idCard?: string; pageNo?: number; pageSize?: number }): Promise<{ page: number; size: number; totalPages: number; totalCount: number; items: OverdueUser[] }> => request('/user/paginate', {query: params});

export const saveUser = async (params: { name: string; phone: string; idCard: string; remark?: string }): Promise<OverdueUser | null> => postForm('/user/create', params);
export const updateUser = async (params: { id: number; name: string; phone: string; idCard: string; remark?: string }): Promise<OverdueUser | null> => postForm('/user/update', params);

export const deleteUser = async (id: number): Promise<void> => postForm('/user/delete', {id});
