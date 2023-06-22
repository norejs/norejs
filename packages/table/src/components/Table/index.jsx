/**
 * 用于列表组件
 */
import {
    useState,
    useCallback,
    useImperativeHandle,
    forwardRef,
    createElement,
    useRef,
    Fragment,
} from "react";
import { Modal, message, Space, Tag } from "antd";
import useTable from "./hooks/useTable";
import useMount from "@/common/hooks/useMount";
import customElement from "../../utils/customElement";
import transformTree from "@/common/utils/transformTree";
import ActionButton from "../ActionButton";
import ValueTypes from "../ValueTypes";
import ModalForm from "../Form/ModalForm";
import ProTable from "@ant-design/pro-table";
import {
    getTableTreeInfo,
    parseShowParams,
    getPrimaryKey,
    isTableField,
} from "../../modules/table";
import { ConfigConsumer } from "../../modules/config";

import DefaultForm from "../Form/DefaultForm";
/**
 * 通用增删改查组件
 */
const noop = (n) => n;

const FORM_TYPES = {
    CREATE: "create",
    EDIT: "edit",
};
const FORM_TYPES_NAME = {
    [FORM_TYPES.CREATE]: "新建",
    [FORM_TYPES.EDIT]: "编辑",
};
export function CommonTable(
    {
        table = null,
        params: initParams = {},
        // React.Element || React.Component || { edit:,create:}
        formRender = undefined,
        // React.Element || React.Component
        inputRender = undefined,
        // React.Element || React.Component || Object
        listRender = undefined,
        // React.Element || React.Component
        actionButtons = undefined,
        // React.Element || React.Component || {}
        columnRender = undefined,
        // React.Element || React.Component || {size:10,start=0}
        pagination: { size: pageSize = 10, start: pageStart = 0 } = {},
        onCreate = noop,
        onEdit = noop,
        onDelete = noop,
        onFormShow = noop,
        onSubmit = noop,
        topButtons = undefined,
        onUpdate = noop,
    },
    ref,
) {
    const { api, structure = [], name: tableName } = table;
    const [isModalLoading, setIsModalLoading] = useState(false);
    const primaryKey = getPrimaryKey(table);

    // 获取列表
    const fetchList = async (params = {}, pageNo = 1, pageSize) => {
        const res = await api.list({
            ...initParams,
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
        pageSize: pageSize,
        request: fetchList,
    });

    let { dataSource, ...tableOtherSource } = tableProps;

    // 查询当前表格是否树形结构
    const treeInfo = getTableTreeInfo(table);
    if (treeInfo) {
        const { key: parentKey, rootId = 0 } = treeInfo;
        dataSource = transformTree(dataSource, parentKey, rootId);
    }

    /**
     * 删
     */
    const removeHandle = useCallback(
        async (data) => {
            if (!onDelete || (await onDelete(data))) {
                Modal.confirm({
                    content: "是否确认删除",
                    cancelText: "取消",
                    okText: "确定",
                    onOk: async () => {
                        const { success } = await api.remove(data);
                        if (success) {
                            message.success("删除成功");
                        }
                        reload();
                    },
                });
            }
        },
        [reload, api],
    );
    /**
     * 改
     */
    const updateItemById = async (value) => {
        const res = await api.update(value);
        onUpdate(res, value);
        if (res.success) {
            message.success("更新成功");
            reload();
        } else {
            throw new Error("更新失败！" + res.msg);
        }
        return res;
    };

    const createItem = useCallback(
        async (value) => {
            const res = await api.create(value);
            if (res.success) {
                message.success("创建成功");
                reload();
            } else {
                throw new Error(res.msg);
            }
            return res;
        },
        [reload, api],
    );

    /**
     * 弹出改动弹窗
     */
    const [createFormProps, setCreateFormProps] = useState({});
    const editForm = useRef();
    const showFormModal = async ({ type = "create", data: initFormData }) => {
        // 查询最新数据
        setIsModalLoading(true);
        if (!onFormShow || (await onFormShow({ type, data: initFormData }))) {
            let data = { ...initFormData };
            if (type === "edit") {
                const { data: detailData = {} } =
                    (await api.query(initFormData)) || {};
                Object.assign(data, detailData);
            }
            setCreateFormProps({
                title: FORM_TYPES_NAME[type],
                Form: DefaultForm,
                onSubmit: type === "create" ? createItem : updateItemById,
                formProps: {
                    structure,
                    data,
                    name: tableName,
                    input: inputRender,

                    type,
                    form: formRender?.[type] || formRender,
                },
            });
            editForm.current.show();
        }
        setIsModalLoading(false);
    };

    const editHandle = async (data = {}) => {
        if (!onEdit || (await onEdit(data))) {
            return await showFormModal({ data, type: "edit" });
        }
    };

    const createHandle = async (data = {}) => {
        if (!onCreate || (await onCreate(data))) {
            return await showFormModal({ data, type: "create" });
        }
    };

    useImperativeHandle(ref, () => ({
        reload,
        showFormModal,
        editHandle,
        createHandle,
        removeHandle,
        search,
    }));
    useMount(() => {
        search();
    }, []);
    const actionRef = useRef();
    return (
        <ConfigConsumer>
            {({ ability }) => {
                /**
                 * 创建 Table 列头数据
                 */
                const createColumns = () => {
                    const { structure = [] } = table;
                    const tableColumns = structure.reduce(
                        (
                            total,
                            { label, key, alias, show, type, render, options },
                        ) => {
                            const showParams = parseShowParams(show);
                            // console.log("read", tableName, alias || key);
                            showParams.list &&
                                ability.can("read", tableName, alias || key) &&
                                total.push({
                                    title: label,
                                    dataIndex: alias || key,
                                    key,
                                    render: createColumnsRender({
                                        type,
                                        render,
                                        options,
                                    }),
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
                            const ActionButtons = customElement(
                                Space,
                                actionButtons,
                            );
                            return (
                                <ActionButtons id={id} key="action">
                                    <ActionButton
                                        subject={tableName}
                                        action={"update"}
                                        key="update"
                                        type="primary"
                                        data={initData}
                                        onClick={() => {
                                            editHandle(initData);
                                        }}
                                        disabled={isModalLoading}
                                    >
                                        编辑
                                    </ActionButton>

                                    <ActionButton
                                        subject={tableName}
                                        action={"delete"}
                                        key="delete"
                                        data={initData}
                                        onClick={() => {
                                            removeHandle(initData);
                                        }}
                                    >
                                        删除
                                    </ActionButton>
                                </ActionButtons>
                            );
                        },
                    });
                    return tableColumns;
                };

                const commonColumnRender = {
                    options: (options) => {
                        return (optionValue) => {
                            const curOption = options.find(({ value }) => {
                                return optionValue === value;
                            });
                            return curOption?.label || optionValue;
                        };
                    },
                    switch: () => {
                        return (value) => {
                            return (
                                <Tag color={value ? "blue" : "green"}>
                                    {value ? "是" : "否"}
                                </Tag>
                            );
                        };
                    },
                };

                function createColumnsRender({
                    render,
                    type = "string",
                    options = [],
                }) {
                    if (columnRender) {
                        return (value) => {
                            const Column = columnRender?.[type] || columnRender;
                            return (
                                <Column
                                    type={type}
                                    options={options}
                                    value={value}
                                ></Column>
                            );
                        };
                    }

                    if (isTableField(type)) {
                        if (ValueTypes?.["table"]?.Show) {
                            return (value) => {
                                return createElement(
                                    ValueTypes["table"]?.Show,
                                    {
                                        value,
                                        type,
                                        tableName,
                                    },
                                );
                            };
                        }
                    }

                    if (Array.isArray(type)) {
                        return (optionValue) => {
                            const curOption = type.find(({ value, label }) => {
                                return optionValue === value;
                            });
                            if (typeof render === "function") {
                                return render(curOption, optionValue);
                            }
                            return curOption?.label || optionValue;
                        };
                    }
                    // 从valuetype 中获取
                    if (ValueTypes?.[type]?.Show) {
                        return (value) => {
                            return createElement(ValueTypes[type]?.Show, {
                                value,
                            });
                        };
                    }
                    if (commonColumnRender[type]) {
                        return commonColumnRender[type](options);
                    }
                }

                const TableComponent = customElement(ProTable, listRender);

                const topBarRender = () => {
                    const TopBar = customElement(Fragment, topButtons);
                    return (
                        <TopBar>
                            <ActionButton
                                action={"create"}
                                subject={tableName}
                                onClick={() => {
                                    createHandle();
                                }}
                                key="primary"
                                type="primary"
                            >
                                新建
                            </ActionButton>
                        </TopBar>
                    );
                };

                return (
                    <Fragment>
                        <ModalForm
                            ref={editForm}
                            {...createFormProps}
                        ></ModalForm>
                        <TableComponent
                            options={{
                                reload: reload,
                                density: false,
                            }}
                            actionRef={actionRef}
                            search={false}
                            size="small"
                            bordered={true}
                            rowKey="id"
                            columns={createColumns()}
                            loading={loading}
                            toolBarRender={topBarRender}
                            dataSource={dataSource}
                            style={{
                                overflow: "auto",
                            }}
                            {...tableOtherSource}
                        ></TableComponent>
                    </Fragment>
                );
            }}
        </ConfigConsumer>
    );
}
export default forwardRef(CommonTable);
