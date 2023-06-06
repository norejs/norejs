import React, { Fragment } from "react";
import { Form, Input } from "antd";
import CommonInput from "../Input";
import customElement from "../../../utils/customElement";
import "./style.scss";
export default function FormItem({
    name,
    dependencies,
    label,
    initValue,
    alias,
    tableName,
    customInput,
    type,
    hidden,
    disabled,
    readOnly = false,
    options,
    data,
    sceneProps,
    formType,
    customFormItem,
    isLabel,
    inputProps: defaultInputProps = {},
    ...props
}) {
    // props 参数过滤
    const whiteProps = [
        "rules",
        "colon",
        "extra",
        "getValueFromEvent",
        "getValueProps",
        "hasFeedback",
        "help",
        "hidden",
        "normalize",
        "required",
        "tooltip",
        "trigger",
        "validateFirst",
        "validateStatus",
        "validateTrigger",
        "valuePropName",
        "wrapperCol",
        "maxLength",
        "size",
    ];
    const _props = {};
    Object.keys(props).forEach((key) => {
        if (key && whiteProps.includes(key)) {
            _props[key] = props[key];
        }
    });
    const inputProps = {
        type,
        name,
        tableName,
        disabled,
        readOnly,
        options,
        data,
        sceneProps,
        formType,
        ...defaultInputProps,
    };
    const FormInput = customElement(CommonInput, customInput);
    const CustomFormItem = customElement(Form.Item, customFormItem);
    const formItem = (
        <CustomFormItem
            hidden={hidden}
            label={dependencies ? "" : label}
            name={name}
            initialValue={initValue}
            {..._props}
        >
            <FormInput {...inputProps}></FormInput>
        </CustomFormItem>
    );
    return (
        <Fragment>
            {dependencies ? (
                <Form.Item
                    hidden={hidden}
                    label={label}
                    dependencies={dependencies}
                    {..._props}
                >
                    {(form) => {
                        const dependenciesValue = {};
                        dependencies.forEach((item) => {
                            item &&
                                (dependenciesValue[item] =
                                    form.getFieldValue(item));
                        });

                        return (
                            <CustomFormItem
                                className={"dependencies-form-item"}
                                name={name}
                                initialValue={initValue}
                            >
                                <FormInput
                                    {...inputProps}
                                    dependencies={dependenciesValue}
                                ></FormInput>
                            </CustomFormItem>
                        );
                    }}
                </Form.Item>
            ) : (
                formItem
            )}

            {alias && (
                <Form.Item
                    hidden={true}
                    name={alias}
                    initialValue={initValue}
                    {..._props}
                >
                    <Input type="string" placeholder="" />
                </Form.Item>
            )}
        </Fragment>
    );
}
