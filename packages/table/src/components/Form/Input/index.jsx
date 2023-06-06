import { isValidElement } from "react";
import { Input, InputNumber, Switch } from "antd";
import TableSelect from "./TableSelect";
import CommonSelect from "./CommonSelect";
import { isTableField } from "../../../modules/table";
import "react-quill/dist/quill.snow.css";
import ReactQuill from "react-quill";
import { UnControlled as CodeMirror } from "react-codemirror2";
import valueTypes from "../../ValueTypes";
import { ConfigConsumer } from "../../../modules/config";

import "codemirror/lib/codemirror.css";
import "codemirror/theme/material.css";
require("codemirror/mode/xml/xml");
require("codemirror/mode/javascript/javascript");

// 用于包装原生的Input 避免出现传递多余的参数
function OriginInput({ Input: InputComponents, type, props, ...otherProps }) {
    const { formType, sceneProps, isLabel, ...inputProps } = props;
    return <InputComponents type={type} {...inputProps} {...otherProps} />;
}
export function inputFactory(
    type,
    tableName,
    props,
    valueTypesFromConfig = {},
) {
    // 如果字段关联其他表
    if (isTableField(type)) {
        return <TableSelect tableName={tableName} type={type} {...props} />;
    }
    // 如果是数组
    if (Array.isArray(type)) {
        return CommonSelect;
    }

    // 是否在valuetype中注册过
    if (valueTypesFromConfig?.[type]?.Input) {
        return valueTypesFromConfig?.[type]?.Input;
    }
    if (valueTypes?.[type]?.Input) {
        return valueTypes?.[type]?.Input;
    }

    // TODO:换成valuetype
    switch (type) {
        case "options":
            return CommonSelect;
        case "richText":
            return richText;
        case "document":
            return DocumentInput;
        case "code":
            return codeEditor;
        case "number":
            return (
                <OriginInput
                    Input={InputNumber}
                    placeholder="请输入"
                    props={props}
                />
            );
        case "switch":
            return ({ value, onChange, ...props }) => {
                return <Switch checked={value} onChange={onChange} />;
            };
        default:
            return (
                <OriginInput
                    Input={Input}
                    placeholder="请输入"
                    type={type}
                    props={props}
                />
            );
    }
}

function richText(props) {
    return <ReactQuill style={{ height: 400, paddingBottom: 60 }} {...props} />;
}

function codeEditor({ value, onChange }) {
    return (
        <CodeMirror
            value={value}
            options={{
                mode: "xml",
                theme: "material",
                lineNumbers: true,
            }}
            onChange={(editor, data, value) => {
                onChange(value);
            }}
        />
    );
}

function DocumentInput({ dependencies = {}, ...props }) {
    const { type } = dependencies;
    return <CommonInput {...props} type={type} />;
}

export default function CommonInput({ type, tableName, ...props }) {
    return (
        <ConfigConsumer>
            {({ valueTypes = {} }) => {
                const InputElement = inputFactory(
                    type,
                    tableName,
                    props,
                    valueTypes,
                );
                return isValidElement(InputElement) ? (
                    InputElement
                ) : (
                    <InputElement type={type} {...props} />
                );
            }}
        </ConfigConsumer>
    );
}
