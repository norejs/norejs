import React from "react";
import { Modal } from "antd";

export default function SubmitModal(FormComponent) {
    return class Wrap extends React.Component {
        state = {
            loading: false,
        };

        formRef = React.createRef();

        handleOk = (e) => {
            const { onClose, form, submit } = this.props;
            const _form = form || this.formRef.current?.form;
            if (!_form) {
                throw new Error("form 实际不能为空");
            }
            return new Promise((resolve, reject) => {
                _form
                    .validateFields()
                    .then((values) => {
                        this.setState({ loading: true });
                        const promise = submit({ ...values });
                        if (promise instanceof Promise) {
                            promise
                                .then((data) => {
                                    onClose();
                                    resolve(data);
                                })
                                .catch((err) => {
                                    this.setState({ loading: false });
                                    reject(err);
                                });
                        }
                    })
                    .catch((err) => {
                        this.setState({ loading: false });
                        reject(err);
                    });
            });
        };

        handleCancel = (e) => {
            this.props.onClose();
        };

        render() {
            const {
                form,
                visible,
                formItemLayout,
                title,
                width,
                style = {},
                maskClosable,
                ...rest
            } = this.props;

            return (
                <div>
                    <Modal
                        width={width}
                        style={style}
                        maskClosable={maskClosable}
                        destroyOnClose={true}
                        title={title}
                        visible={visible}
                        onOk={this.handleOk}
                        onCancel={this.handleCancel}
                        confirmLoading={this.state.loading}
                    >
                        <FormComponent
                            ref={this.formRef}
                            formItemProps={{ form, ...formItemLayout }}
                            {...rest}
                        />
                    </Modal>
                </div>
            );
        }
    };
}
