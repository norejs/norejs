import { Button } from "antd";
import { ConfigConsumer } from "../../modules/config";
import { Can } from "@casl/react";
import { subject } from "@casl/ability";
// TODO :后续可以加上其他按钮
export default function ActionButton({
    action,
    field,
    data = null,
    subject: subjectName,
    ...props
}) {
    return (
        <ConfigConsumer>
            {({ ability }) => {
                const curSubject = data
                    ? subject(subjectName, data)
                    : subjectName;
                // console.log(action, field, subject,ability);
                return (
                    <Can
                        I={action}
                        field={field}
                        a={curSubject}
                        ability={ability}
                    >
                        <Button {...props}></Button>
                    </Can>
                );
            }}
        </ConfigConsumer>
    );
}
