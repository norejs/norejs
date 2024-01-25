import JoinTableSelect from "./JoinTableSelect";
import RelationTableSelect from "./RelationTableSelect";

import { parseTableField } from "../../../../modules/table";

export default function TableSelect({
    tableName: fromTableName,
    type,
    ...props
}) {
    // 当前字段直接关联的表实例
    let { fieldName = "" } = parseTableField(type, fromTableName);
    if (fieldName) {
        return (
            <JoinTableSelect tableName={fromTableName} type={type} {...props} />
        );
    } else {
        return (
            <RelationTableSelect
                tableName={fromTableName}
                type={type}
                {...props}
            />
        );
    }
}
