type Principal = {
    id: number;
    name: string;
    username: string;
}

type OverdueUser = {
    id: number;
    name: string;
    phone: string;
    idCard: string;
    remark?: string;
    status?: number;
    createTime?: number;
    updateTime?: number;
}
