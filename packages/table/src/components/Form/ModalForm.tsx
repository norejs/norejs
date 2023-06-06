/**
 * 用于编辑或者新建的Form表单
 */
import {
    forwardRef,
    useImperativeHandle,
    useRef,
    useState,
    useEffect,
} from "react";
import { Modal, Form as AntForm } from "antd";

interface IEditFormProps {
    Form;
    onSubmit: Function;
    formProps?;
    modalProps?;
    title?;
}

export default forwardRef(
    (
        {
            title,
            Form = null,
            formProps = {},
            modalProps = {},
            onSubmit = (v) => {},
        }: IEditFormProps,
        ref,
    ) => {
        const formRef = useRef<{ form }>();
        const form = formRef?.current?.form;
        const [visible, setVisible] = useState(false);
        const [isLoading, setIsLoading] = useState(false);
        const showHandler = () => {
            setVisible(true);
        };
        const hideHandler = () => {
            setVisible(false);
        };
        const submitHandler = async () => {
            setIsLoading(true);

            try {
                const values = await form.validateFields();
                await onSubmit(values);
                hideHandler();
            } catch (error) {
                console.log(error);
            }
            setIsLoading(false);
        };
        useImperativeHandle(ref, () => ({
            form,
            show: showHandler,
            hide: hideHandler,
            submit: submitHandler,
        }));
        useEffect(() => {
            form?.resetFields();
        }, [visible]);
        return (
            <Modal
                width={600}
                title={title}
                onCancel={() => {
                    setVisible(false);
                }}
                visible={visible}
                onOk={submitHandler}
                {...modalProps}
            >
                {Form && visible && <Form ref={formRef} {...formProps} />}
            </Modal>
        );
    },
);
