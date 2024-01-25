// 用于注入权限
const perKey = "TABLE_ENGIN_PERMS_CODE";
let globalWindow;
export function injectPerms(perms = [], global = window) {
    globalWindow = global;
    globalWindow[perKey] = perms;
}
export function getPerms() {
    return globalWindow?.[perKey];
}
export function checkPerm(code = null) {
    return (
        !code || !globalWindow?.[perKey] || globalWindow[perKey]?.includes(code)
    );
}
