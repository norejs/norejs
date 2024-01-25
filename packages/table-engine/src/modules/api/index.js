/**
 * 创建API 实例
 */
export function createApi({
    baseUrl = "",
    request = () => {},
    requestParams = {},
    responseParser = {},
    methods = {},
}) {
    /** 标准的增删改查 */
    const defaultRequestParams = {
        create: {
            type: "post",
            url: `${baseUrl}/create`,
        },
        list: {
            type: "get",
            url: `${baseUrl}/list`,
        },
        update: ({ id = "", ...data }) => ({
            type: "patch",
            url: `${baseUrl}/${id}`,
            data,
        }),
        query: ({ id = "", ...data } = {}) => ({
            type: "get",
            url: `${baseUrl}/${id}`,
            data,
        }),
        remove: ({ id = "", ...data }) => ({
            type: "delete",
            url: `${baseUrl}/${id}`,
            data,
        }),
    };

    const _requestParams = { ...defaultRequestParams, ...requestParams };

    const apiHandle = {
        get(target, prop) {
            let params = _requestParams[prop];
            if (typeof params === "undefined") {
                return Reflect.get(target, prop);
            }

            // 返回一个接口函数
            return async (...requestData) => {
                let newParams;
                if (typeof params === "function") {
                    newParams = params(...requestData);
                } else {
                    newParams =
                        typeof params === "object" ? { ...params } : params;
                }
                const realRequest = methods[prop] ? methods[prop] : request;
                if (!newParams.data) {
                    newParams.data = requestData[0];
                }
                const res = await realRequest(newParams);
                const parser = responseParser?.[prop];
                return typeof parser === "function" ? parser(res) : res;
            };
        },
    };

    const apiInstance = {};
    const apiInstanceProxy = new Proxy(apiInstance, apiHandle);
    return apiInstanceProxy;
}
