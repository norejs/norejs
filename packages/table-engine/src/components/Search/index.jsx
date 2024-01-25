import React from "react";
import { Form } from "antd";
import CommonInput from "../Form/Input";
import { parseShowParams } from "../../modules/table";
import customElement from "../../utils/customElement";

import { QueryFilter } from "@ant-design/pro-form";

export default function Search({
    onSearch = () => {},
    inputRender,
    structure = [],
}) {
    const [form] = Form.useForm();
    const searchColumns = structure.filter((item) => {
        const showParams = parseShowParams(item.show);
        item.inputParams = showParams.search;
        return showParams.search;
    });
    const getFields = () => {
        const children = searchColumns.map(
            ({ show, inputParams, ...props }) => {
                const { key, label } = props;
                const {
                    hidden = false,
                    disabled = false,
                    default: defaultValue,
                } = inputParams;
                const InputElement = customElement(CommonInput, inputRender);
                return (
                    <Form.Item
                        key={key}
                        name={key}
                        label={label}
                        rules={[]}
                        hidden={hidden}
                        initialValue={defaultValue}
                    >
                        <InputElement
                            name={key}
                            disabled={disabled}
                            style={{ width: "100%" }}
                            formType={"search"}
                            sceneProps={inputParams}
                            {...props}
                        />
                    </Form.Item>
                );
            },
        );

        return children;
    };
    const fields = getFields();
    return fields.length > 0 ? (
        <QueryFilter
            layout="vertical"
            style={{
                margin: 30,
                marginBottom: 0,
                marginTop: 0,
                borderBottom: "0.5px dashed rgba(0,0,0,.1)",
            }}
            form={form}
            // labelCol={{ span: 6 }}
            name="advanced_search"
            onFinish={(val) => {
                onSearch(val);
            }}
        >
            {fields}
        </QueryFilter>
    ) : null;
}
