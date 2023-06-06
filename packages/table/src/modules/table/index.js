import { createApi } from "../api";

const TABLE_CACHE = {};

// 字段演示

// 采取黑名单机制
// const columns = [
//     {
//         label: "ID",
//         key: "id",
//         isPrimary: true,
//         alias:"id_no",
//         show: {
//             // 列表中 是否显示，默认显示
//             list: false,
//             // 编辑弹窗是否显示，默认显示
//             edit: {
//                 // 编辑弹窗显示,但是禁用
//                 hidden: true,
//                 hidden: true,
//             },
//             create: {
//                 // 新增弹窗显示，但是禁用
//                 display: true,
//                 // 街面上不显示但是接口中传递
//                 hidden: true,
//             },
//         },
//         // 类型，会根据类型判断 用什么input渲染，也可以用来表示 table的关联信息,支持传入自定义渲染组件名
//         type: "string",
//         // 依赖的字段，如果对应字段更新时，会重新渲染
//         dependencies: [],
//     },
// ];

/**
 * 注册表
 * @param {*} tableName
 * @param {*} param1
 * @returns
 */
export function registerTable(
    tableName,
    { structure = [], api = null, ...otherProps } = {},
) {
    if (!TABLE_CACHE[tableName]) {
        let apiInstance = api || createApi({ baseUrl: `/${tableName}` });
        TABLE_CACHE[tableName] = {
            structure: structure,
            name: tableName,
            api: apiInstance,
            ...otherProps,
        };
    }
    return TABLE_CACHE[tableName];
}

/**
 * 获取表
 * @param {*} tableName
 * @returns
 */
export function getTable(tableName) {
    return TABLE_CACHE[tableName];
}

/**
 * 获取表单链
 */
export function getTableFieldChain(fieldTypeStr = "", res = []) {
    const { tableName = "", fieldName = "" } = parseTableField(fieldTypeStr);
    const { structure = [] } = getTable(tableName);
    const curField =
        structure.find(({ key }) => {
            return key === fieldName;
        }) || {};
    const { type = "string" } = curField;
    res.push({ tableName, fieldName });
    if (isTableField(type)) {
        getTableFieldChain(type, res);
    } else {
        res.push(type);
    }
    return res;
}

/**
 * 解析表字段
 */
export function parseTableField(fieldStr) {
    if (isTableField(fieldStr)) {
        if (Array.isArray(fieldStr)) {
            return parseTableField(fieldStr[0]);
        }
        let tableInfo = fieldStr?.replace("table:", "")?.split(".");
        let tableName = tableInfo[0];
        let fieldName = tableInfo[1] || "";
        return { tableName, fieldName };
    }
    return fieldStr;
}

/**
 * 是否表格字段
 * @param {*} fieldStr
 * @returns
 */
export function isTableField(fieldStr) {
    if (Array.isArray(fieldStr)) {
        return isTableField(fieldStr[0]);
    }
    return (
        fieldStr &&
        (typeof fieldStr === "string" && fieldStr?.indexOf("table:")) === 0
    );
}

/**
 * 获取主键
 */
export function getPrimaryKey(table = {}) {
    const { structure = [] } = table;
    return structure.reduce((total = [], { isPrimary = false, key }) => {
        isPrimary && total.push(key);
        return total;
    }, []);
}

/**
 * 获取关联表以及关联的具体字段
 */
export function getRelationTable(table = {}) {
    const { structure = [] } = table;
    let relation = {};
    structure.forEach(({ type = "", key }) => {
        const { tableName = "", fieldName } = parseTableField(type);

        if (tableName) {
            if (!relation[tableName]) {
                relation[tableName] = { field: [] };
            }
            relation[tableName]?.field?.push({
                originKey: key,
                relativeKey: fieldName,
            });
        }
    });
    return relation;
}

/**
 * getLabelKey
 */
export function getLabelKey(table = {}) {
    const { structure = [] } = table;
    const labelKeys = structure.reduce(
        (total = [], { isLabel = false, key }) => {
            isLabel && total.push(key);
            return total;
        },
        [],
    );
    return labelKeys.length > 0 ? labelKeys : null;
}

export function getFieldByName(table, fieldName) {
    const { structure = [] } = table;
    return structure.find(({ key }) => {
        return key === fieldName;
    }, []);
}

export function getTableTreeInfo(table) {
    const { structure = [], name } = table || {};
    const parentId = structure.find(({ type = "" }) => {
        return (
            type?.startsWith?.("table:self.") ||
            type?.startsWith?.("table:" + name + ".")
        );
    }, []);
    return parentId;
}

export function parseShowParams(show = {}) {
    const { list = {}, search = false, create = {}, edit = {} } = show;
    const res = { list, search, create, edit };
    ["edit", "create", "search"].forEach((key) => {
        if (res[key] && typeof res[key] === "boolean") {
            res[key] = {};
        }
    });
    return res;
}
