import { useState, useMemo, useEffect, useCallback } from "react";
import { Select, TreeSelect } from "antd";

import useMount from "common/src/hooks/useMount";
import {
    parseTableField,
    getTable,
    getLabelKey,
    getFieldByName,
    getTableTreeInfo,
    getPrimaryKey,
} from "../../../../modules/table";

import transformTree from "common/src/utils/transformTree";

const { Option } = Select;

// 联表查询
export default function JoinTableSelect({
    tableName: fromTableName,
    type,
    onChange = () => {},
    data: searchParams,
    name,
}) {
    // 是否多选
    const isMultiple = Array.isArray(type);
    // 当前字段直接关联的表实例
    let { tableName: joinTableName = "", fieldName: joinTableField = "" } =
        parseTableField(type, fromTableName);
    const joinTable = getTable(joinTableName);
    const treeInfo = getTableTreeInfo(joinTable);
    const joinTableApi = joinTable?.api;
    const labelKeys = getLabelKey(joinTable) || ["label"];
    const primaryKeys = getPrimaryKey(joinTable) || ["id"];
    const primaryKey = primaryKeys?.[0] || "id";
    const initValue = searchParams[name];
    const [optionsList, setOptionsList] = useState([]);
    const valuesMap = useMemo(() => {
        let map = {};
        optionsList.forEach((item) => {
            primaryKey &&
                item?.[primaryKey] &&
                (map[item?.[primaryKey]] = item);
        });
        return map;
    }, [optionsList, primaryKey]);
    // 获取默认值
    const { default: defaultOption = null } =
        getFieldByName(joinTable, name) || {};
    const defaultValue = defaultOption?.[primaryKey];
    const defaultLabel = defaultOption?.[labelKeys[0]];
    // const { value: defaultValue = undefined, label: defaultLabel = "" } =
    //     defaultOption || {};
    const [selectedValue, setSelectedValue] = useState(
        initValue || defaultValue,
    );

    // 获取选项列表
    const fetchOptionsList = async () => {
        const { data: { list = [] } = {} } = await joinTableApi.list(
            {...searchParams},
            "join_select",
        );
        setOptionsList(list);
    };

    useMount(() => {
        fetchOptionsList();
    });

    const getItemLabel = (item) => {
        return labelKeys.reduce((total, key) => {
            return `${total}${total ? " - " : ""}${item[key]}`;
        }, "");
    };

    useEffect(() => {}, [optionsList]);

    const getParents = useCallback(
        (values = []) => {
            const { rootId = 0, key: parentKey = "parent" } = treeInfo;
            const parents = [];
            Array.isArray(values) &&
                values.forEach((id) => {
                    let parentId = valuesMap?.[id]?.[parentKey];
                    if (
                        typeof parentId !== "undefined" &&
                        parentId != rootId &&
                        !parents.includes(parentId)
                    ) {
                        parents.push(parentId);
                    }
                });
            return parents;
        },
        [valuesMap, treeInfo],
    );
    // 当前选择器的默认值
    if (treeInfo) {
        const { key: parentKey, rootId = 0 } = treeInfo;
        const treeData = transformTree(optionsList, parentKey, rootId);
        const allTreeData = defaultOption
            ? [{ ...defaultOption, children: treeData }]
            : treeData;

        return (
            <TreeSelect
                treeCheckable={isMultiple}
                multiple={isMultiple}
                fieldNames={{
                    label: labelKeys[0],
                    value: primaryKey,
                }}
                value={allTreeData?.length > 0 ? selectedValue : undefined}
                treeData={allTreeData}
                placeholder="Please select"
                onChange={(val) => {
                    setSelectedValue(val);
                    const parents = getParents(val);
                    onChange([...val, ...parents]);
                }}
                treeDefaultExpandAll
            ></TreeSelect>
        );
    }

    return (
        <Select
            mode={isMultiple ? "multiple" : ""}
            value={selectedValue}
            onChange={(val) => {
                setSelectedValue(val);
                onChange(val);
            }}
        >
            {defaultValue !== undefined && (
                <Option value={defaultValue}>{defaultLabel}</Option>
            )}
            {optionsList.map((item) => {
                const value = item[joinTableField];
                return (
                    <Option key={item[joinTableField]} value={value}>
                        {getItemLabel(item)}
                    </Option>
                );
            })}
        </Select>
    );
}
