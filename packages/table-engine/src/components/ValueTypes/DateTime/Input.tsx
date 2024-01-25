import { DatePicker } from "antd";
import moment from "moment";
const { RangePicker } = DatePicker;
import DateTimeShow from "./Show";
export default function DateTimeInput({
    onChange,
    style,
    value = "",
    sceneProps,
    formType,
    readOnly,
}) {
    const Picker = formType === "search" ? RangePicker : DatePicker;
    const placeholder =
        formType === "search" ? ["开始日期", "结束日期"] : "请选择日期";
    console.log(readOnly);
    if (readOnly) {
        return <DateTimeShow value={value} />;
    }
    return (
        <Picker
            readOnly={readOnly}
            value={moment(value)}
            onChange={onChange}
            format="YYYY-MM-DD HH:mm:ss"
            placeholder={placeholder}
            style={{
                width: "100%",
                ...style,
            }}
            {...sceneProps}
        />
    );
}
