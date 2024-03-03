let _loginHandler: () => void;
export const applyRequestHandlers = ({
                                         loginHandler,
                                     }: {
    loginHandler: () => void;
}) => {
    _loginHandler = loginHandler;
};

const apiPrefix = "/api";

export const serializeParams = (params: Record<string, any>): string => {
    const result = new URLSearchParams();
    for (const o in params) {
        if (params.hasOwnProperty(o)) {
            const value = params[o];
            if (value !== undefined && value !== null && value !== '') {
                result.append(o, String(value));
            }
        }
    }
    return result.toString();
};

export const request = async <T>(
    url: string,
    options?: RequestOptions
): Promise<T> => {
    const requestInit = {
        method: options?.method || "GET",
        headers: Object.assign({}, options?.headers)!,
        body: options?.body,
    } as RequestInit & {
        headers: Record<string, string>;
    };
    if (
        requestInit.method === "POST" &&
        requestInit.body &&
        !requestInit.headers["Content-Type"]
    ) {
        requestInit.headers["Content-Type"] = "application/x-www-form-urlencoded";
    }
    url = `${apiPrefix}${url}`;
    if (requestInit.method === "GET" && options?.query) {
        const queryString = serializeParams(options.query);
        if (url.indexOf("?") === -1) {
            url = url + "?" + queryString;
        } else {
            url = (url.endsWith("?") ? "" : "?") + queryString;
        }
    }
    console.log(url, requestInit);
    return fetch(url, requestInit).then((response) => {
        if (response.status === 200) {
            return (response.json() as Promise<R<T>>).then((res) => {
                if (res.status === 200) {
                    return res.data as T;
                }
                if (res.status === 401 && _loginHandler) {
                    _loginHandler();
                    throw new Error(res.message || '请登录');
                }
                throw new Error(res.message || "request failed with status " + res.status);
            });
        }
        throw new Error(
            `failed to perform request ${url}, status=${response.status}`
        );
    });
};

export const postForm = async <T>(
    url: string,
    body?: Record<string, any> | null,
    headers?: RequestHeaders
): Promise<T> => {
    console.log(body, serializeParams(body!));
    return request<T>(url, {
        method: "POST",
        headers: {
            ...headers,
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: body ? serializeParams(body) : null,
    });
};
