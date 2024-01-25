import JsonTree from "./JsonTree";
import { Input as AntInput } from "antd";
export default function Input({ value, data, onChange, ...props }) {
    return (
        <Fragment>
            <AntInput value={value} onChange={onChange} />
            <JsonTree {...props} data={value} onChange={onChange} />
        </Fragment>
    );
}
