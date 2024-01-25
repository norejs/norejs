/**
 * 用于存放 搜索相关组件
 */
import React, { Fragment } from "react";
import { Space } from "antd";
import ActionButton from "../ActionButton";
import customElement from "../../utils/customElement";

export default function Top({
    topButtons,
    table: { name: tableName },
    onAddClick = () => {},
}) {
    const Buttons = customElement(Fragment, topButtons);
    return (
        <Space
            style={{
                padding: "20px 0",
            }}
        >
            <Buttons>
                <ActionButton
                    subject={tableName}
                    action={"create"}
                    type="primary"
                    onClick={onAddClick}
                >
                    新建
                </ActionButton>
            </Buttons>
        </Space>
    );
}
