import {
    useImperativeHandle,
    forwardRef,
    useCallback,
    useEffect,
    useMemo,
} from "react";
import { Form } from "antd";
import ProForm from "@ant-design/pro-form";
import { ConfigConsumer } from "../../../modules/config";
import useAlias from "./hooks/useAlias";
import { parseShowParams } from "../../../modules/table";
import customElement, { isReactComponent } from "../../../utils/customElement";
import FormItem from "../FormItem";
// 需要区分 edit 和 create
export default forwardRef(
    (
        {
            structure = [],
            data = {},
            name: tableName,
            input: customInput,
            type: formType = "",
            form: customForm,
            item: customItem,
            onFormShow = () => {},
        },
        ref,
    ) => {
        const [form] = Form.useForm();
        useImperativeHandle(ref, () => ({ form }));
        const { syncAlias } = useAlias({ structure, form });
        useEffect(() => {
            onFormShow(form);
        }, []);
        const onValuesChange = useCallback(
            (changed) => {
                syncAlias(changed);
            },
            [syncAlias],
        );

        const FormComponent = useMemo(() => {
            return customElement(ProForm);
        }, []);
        return (
            <ConfigConsumer>
                {({ ability }) => {
                    const canStructure = structure.filter(({ key, alias }) => {
                        return ability.can("read", tableName, alias || key);
                    });
                    return (
                        <FormComponent
                            layout={"horizontal"}
                            form={form}
                            name="basic"
                            labelCol={{ span: 4 }}
                            wrapperCol={{ span: 20 }}
                            style={{ padding: "20px 0" }}
                            autoComplete="off"
                            onValuesChange={onValuesChange}
                            submitter={false}
                        >
                            {canStructure.map(
                                ({
                                    label = "",
                                    key = "",
                                    show,
                                    type = "string",
                                    alias = "",
                                    dependencies,
                                    ...props
                                }) => {
                                    const showParams = parseShowParams(show);
                                    let initValue = formatValue(
                                        type,
                                        data?.[key] ?? data?.[alias],
                                    );
                                    const Item = customElement(
                                        FormItem,
                                        customItem,
                                    );
                                    return (
                                        (!formType ||
                                            showParams?.[formType]) && (
                                            <Item
                                                label={label}
                                                key={key}
                                                name={key}
                                                type={type}
                                                dependencies={dependencies}
                                                initValue={initValue}
                                                alias={alias}
                                                tableName={tableName}
                                                hidden={
                                                    showParams?.[formType]
                                                        ?.hidden
                                                }
                                                disabled={
                                                    showParams?.[formType]
                                                        ?.disabled
                                                }
                                                readOnly={
                                                    showParams?.[formType]
                                                        ?.readOnly
                                                }
                                                sceneProps={
                                                    showParams?.[formType]
                                                }
                                                formType={formType}
                                                customInput={
                                                    isReactComponent(
                                                        customInput,
                                                    )
                                                        ? customInput
                                                        : customInput?.[type]
                                                }
                                                data={data}
                                                {...props}
                                            />
                                        )
                                    );
                                },
                            )}
                        </FormComponent>
                    );
                }}
            </ConfigConsumer>
        );
    },
);

function formatValue(type, val) {
    switch (type) {
        case "number":
            return Number(val) || 0;
        default:
            return val;
    }
}
