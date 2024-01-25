import {
    parseTableField,
    getTable,
    getLabelKey,
    getPrimaryKey,
} from "../../../modules/table";

/** 增加值是某个字段时如何展示 */
export default function TableShow({ value, type }) {
    const isMultiple = Array.isArray(type);
    const tableInfo = parseTableField(type);
    const table = getTable(tableInfo.tableName);
    const labelKey = tableInfo.fieldName
        ? [tableInfo.fieldName]
        : getLabelKey(table) || getPrimaryKey(table);
    let renderValue;
    function transformToLabel(valueItem, labelKey) {
        return labelKey.reduce((total, keyName) => {
            let gap = total ? "-" : "";
            return `${total}${gap}${valueItem[keyName] || "空"}`;
        }, "");
    }
    if (typeof value === "object") {
        if (isMultiple) {
            renderValue = value.map((valueItem, index) => {
                return (
                    <div key={index}>
                        {transformToLabel(valueItem, labelKey)}
                    </div>
                );
            });
        } else {
            renderValue = transformToLabel(value, labelKey);
        }
    }

    return <Fragment>{renderValue}</Fragment>;
}
