import { useState } from "react";
import { Select } from "antd";

import useMount from "common/src/hooks/useMount";
import {
    parseTableField,
    getTable,
    getLabelKey,
    getRelationTable,
    getPrimaryKey,
} from "../../../../modules/table";

const { Option } = Select;

function getPrimaryValue(item = {}, primaryKeys) {
    return primaryKeys.reduce((total, key) => {
        if (item?.[key]) {
            total = `${total}${total ? "-" : ""}${item[key]}`;
        }
        return total;
    }, "");
}

const getItemLabel = (item, labelKeys) => {
    return labelKeys.reduce((total, key) => {
        return `${total}${total ? " - " : ""}${item[key]}`;
    }, "");
};

// 关系表 比如 用于关联 a->c->b c表中包含 a与b的关联记录
export default function RelationTableSelect({
    tableName: fromTableName,
    type,
    onChange = () => {},
    data: searchParams,
    // name,
}) {
    // 是否多选
    const isMultiple = Array.isArray(type);

    let {
        tableName: relativeTableName = "",
        // fieldName: relativeTableField = "",
    } = parseTableField(type, fromTableName);

    // 获取关系表
    const relationTable = getTable(relativeTableName);

    // 获取表的关联信息
    const joinTables = getRelationTable(relationTable);

    // console.log(joinTableName, joinTableField, relationTable);
    const [selectedValue, setSelectedValue] = useState(isMultiple ? [] : "");
    const [selectorList, setSelectorList] = useState([]);

    // 获取当前的值
    const fetchInitData = async () => {
        let { data = null, success = false } = await relationTable?.api?.list(
            searchParams,
            fromTableName,
        );
        data = data || (isMultiple ? [] : "");
        success && setSelectedValue(data);
        onChange(data);
    };

    // 获取关联表的列表
    const fetchJoinTableList = async () => {
        const selector = [];
        for (let joinTableName in joinTables) {
            let { field = {} } = joinTables[joinTableName];
            if (joinTableName !== fromTableName) {
                const { data = [] } = await getTable(
                    joinTableName,
                )?.api?.list();

                selector.push({
                    data,
                    name: joinTableName,
                    field,
                });
            }
        }
        setSelectorList(selector);
    };

    useMount(() => {
        fetchInitData();
        fetchJoinTableList();
    });

    const mergeValue = (oldValue, newValue) => {
        if (isMultiple) {
            return newValue.map((item, index) => {
                return { ...(oldValue[index] || {}), ...item };
            });
        } else {
            return { ...(oldValue || {}), ...newValue };
        }
    };

    const handleChange = (value) => {
        const newValue = mergeValue(selectedValue, value);
        setSelectedValue(newValue);
        onChange(newValue);
    };

    return selectorList.map(({ name, ...item }, index) => {
        return (
            <TableSelector
                value={selectedValue}
                key={name}
                name={name}
                isMultiple={isMultiple}
                onChange={handleChange}
                {...item}
            />
        );
    });
}

function TableSelector({
    onChange = () => {},
    isMultiple = false,
    data,
    name,
    field,
    value,
}) {
    const table = getTable(name);
    const primaryKey = getPrimaryKey(table);
    const labelKeys = getLabelKey(table);

    // 格式化选中的值
    const getValueByField = (field, data) => {
        const newValue = { ...data };
        for (let j in newValue) {
            let curField = field.find(({ relativeKey }) => {
                return j === relativeKey;
            })?.originKey;
            if (curField) {
                newValue[curField] = newValue[j];
                delete newValue[j];
            }
        }
        return newValue;
    };

    const handleChange = (_, option = null) => {
        let newValue;
        let originData;
        if (isMultiple) {
            originData = [];
            newValue = option.map(({ origin_data }) => {
                originData.push(origin_data);
                return getValueByField(field, origin_data);
            });
        } else {
            originData = option?.origin_data;
            newValue = getValueByField(field, option?.origin_data);
        }
        onChange(newValue);
    };

    const transformToOriginKey = (keys = []) => {
        return keys.map((key) => {
            return (
                field?.find(({ relativeKey }) => {
                    return key === relativeKey;
                })?.originKey || key
            );
        });
    };

    const getCurValue = () => {
        if (isMultiple) {
            return value?.map((item) => {
                return getPrimaryValue(item, transformToOriginKey(primaryKey));
            });
        }
        return getPrimaryValue(value, transformToOriginKey(primaryKey));
    };

    // 选中的值格式化成 select 需要的值
    const curValue = getCurValue();
    return (
        <Select
            value={curValue}
            onChange={handleChange}
            mode={isMultiple ? "multiple" : ""}
        >
            {data.map((item, index) => {
                return (
                    <Option
                        origin_data={item}
                        key={getPrimaryValue(item, primaryKey)}
                        value={getPrimaryValue(item, primaryKey)}
                    >
                        {getItemLabel(item, labelKeys)}
                    </Option>
                );
            })}
        </Select>
    );
}
