import { Select } from "antd";

export default function CommonSelect({
    formType,
    sceneProps,
    options,
    type,
    ...props
}) {
    const optionsList = Array.isArray(type) ? type : options;

    return (
        <Select {...props} placeholder="请选择">
            <Select.Option key={"no_value"} value={""}>
                请选择
            </Select.Option>
            ;
            {optionsList.map(({ label, value }, index) => {
                return (
                    <Select.Option key={index} value={value}>
                        {label}
                    </Select.Option>
                );
            })}
        </Select>
    );
}
