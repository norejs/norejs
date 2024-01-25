/**
 * 用于列表组件
 */
import {
    useCallback,
    createElement,
    useImperativeHandle,
    forwardRef,
} from "react";
import { Table, Modal, message, Row, Col, Button, Space } from "antd";
import useTable from "./hooks/useTable";
import useMount from "common/hooks/useMount";
import * as modal from "../FormModal";
import OssImage from "../Image";
import customElement from "../../utils/customElement";
import Search from "../Search";
import transformTree from "common/utils/transformTree";
import { isTreeTable, parseShowParams } from "../../modules/table";
/**
 * 通用增删改查组件
 */
const noop = (n) => n;
export function CommonTable(
    {
        table = null,
        createForm = null,
        editForm = null,
        formInput = {},
        listTable = null,
        actionButtons = null,
        topButtons = null,
        searchBar = null,
        fieldColumn = null,
        listParams = {},
        onInit = noop,
        onFormShow = noop,
        onSubmit = noop,
    },
    ref,
) {
    const { api, pageStart = 0 } = table;

    // 获取列表
    const fetchList = async (params = {}, pageNo = 1, pageSize) => {
        const res = await api.list({
            ...listParams,
            ...params,
            page: pageNo + (pageStart - 1),
            size: pageSize,
        });
        const {
            data: { list = [], total = 0 },
            success = false,
            msg,
        } = res;
        return {
            success,
            data: list,
            total,
            message: msg,
        };
    };

    const { search, loading, reload, tableProps } = useTable({
        pageSize: 10,
        request: fetchList,
    });
    let { dataSource, ...tableOtherSource } = tableProps;
    const treeInfo = isTreeTable(table);
    if (treeInfo) {
        const { key: parentKey, rootId = 0 } = treeInfo;
        dataSource = transformTree(dataSource, parentKey, rootId);
    }

    useImperativeHandle(ref, () => ({ reload }));

    const searchHandler = useCallback(
        (values) => {
            search(values);
        },
        [search],
    );
    /**
     * 增
     */
    const createItem = useCallback(
        async (value) => {
            const res = await api.create(value);
            if (res.success) {
                message.success("创建成功");
                reload();
            } else {
                message.error("创建失败！" + res.msg);
            }
            return res;
        },
        [reload, api],
    );

    /**
     * 删
     */
    const removeHandle = useCallback(
        (id) => () => {
            Modal.confirm({
                content: "是否确认删除",
                cancelText: "取消",
                okText: "确定",
                onOk: async () => {
                    const { success } = await api.remove(id);
                    if (success) {
                        message.success("删除成功");
                    }
                    reload();
                },
            });
        },
        [reload, api],
    );

    /**
     * 改
     */
    const updateItemById = async (value) => {
        const res = await api.update(value);
        if (res.success) {
            message.success("更新成功");
            reload();
        } else {
            throw new Error("更新失败！" + res.msg);
            // message.error("更新失败！" + res.msg);
        }
        return res;
    };

    /**
     * 弹出改动弹窗
     */
    const { structure = [], name } = table;
    const editHandle = (initData) => async () => {
        const {
            // success = false,
            data = {},
            // msg = "",
        } = (await api.query(initData?.id)) || {};
        modal.edit({
            onShow: onFormShow,
            form: editForm,
            input: formInput,
            structure,
            data: { ...initData, ...data },
            name,
            submit: (formData) => {
                onSubmit(formData);
                return updateItemById(formData);
            },
        });
    };

    /**
     * 创建 Table 列头数据
     */
    const createColumns = () => {
        const { structure = [] } = table;

        const tableColumns = structure.reduce(
            (total, { label, key, alias, show, type, options }) => {
                const showParams = parseShowParams(show);
                showParams.list &&
                    total.push({
                        title: label,
                        dataIndex: alias || key,
                        key,
                        render: createColumnsRender({ type, options }),
                    });
                return total;
            },
            [],
        );
        const { key = "id" } =
            structure.find((isPrimary) => {
                return isPrimary;
            }) || {};
        tableColumns.push({
            title: "操作",
            dataIndex: key,
            key: "action",
            render: (id, initData) => {
                return customElement(actionButtons || Space, {
                    id,
                    key: "action",
                    children: [
                        <Button
                            key="edit"
                            type="primary"
                            onClick={editHandle(initData)}
                        >
                            编辑
                        </Button>,
                        <Button key="delete" onClick={removeHandle(initData)}>
                            删除
                        </Button>,
                    ],
                });
            },
        });
        return tableColumns;
    };
    function createColumnsRender({ type = "string", options = [] }) {
        // 自定义field
        if (typeof fieldColumn === "function") {
            const filed = fieldColumn(type, options);
            if (filed) {
                return filed;
            }
        }
        if (columnRender[type]) {
            return columnRender[type];
        }
        if (Array.isArray(type)) {
            return (optionValue) => {
                const curOption = type.find(({ value, label }) => {
                    return optionValue === value;
                });
                return curOption?.label || optionValue;
            };
        }
        switch (type) {
            case "options":
                return (optionValue) => {
                    const curOption = options.find(({ value, label }) => {
                        return optionValue === value;
                    });
                    return curOption?.label || optionValue;
                };

            default:
                break;
        }
    }
    const columnRender = {
        image: (src) => {
            return <OssImage width={100} src={src} />;
        },
    };

    useMount(() => {
        search();
        onInit({});
    }, []);

    const createButton = [
        <Button
            key="create"
            type="primary"
            onClick={() => {
                modal.create({
                    onShow: onFormShow,
                    form: createForm,
                    input: formInput,
                    structure,
                    data: {},
                    name,
                    submit: (formData) => {
                        return createItem(formData);
                    },
                });
            }}
        >
            新增
        </Button>,
    ];
    const tableComponent = listTable || Table;
    return (
        <div>
            <Row className="">
                <Col span={24}>
                    {customElement(topButtons, { children: createButton })}
                </Col>
            </Row>
            {/* 查询 */}
            <div className="w-full">
                {customElement(searchBar || Search, {
                    onSearch: searchHandler,
                    structure: structure,
                })}
            </div>

            {createElement(tableComponent, {
                className: "",
                rowKey: "id",
                columns: createColumns(),
                loading: loading,
                dataSource,
                ...tableOtherSource,
            })}
        </div>
    );
}
export default forwardRef(CommonTable);
