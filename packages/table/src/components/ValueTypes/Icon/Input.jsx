import React, { useState } from "react";
import { Input } from "antd";
import * as icons from "@ant-design/icons";
import IconRender from "./Show";
export default function IconSelect({ value = "", onChange = () => {} }) {
    const [iconName, setIconName] = useState(value);
    const [show, setShow] = useState(false);
    const iconRender = [];
    for (let i in icons) {
        let Icon = icons[i];

        if (typeof Icon === "object" && i !== "default") {
            iconRender.push(
                <span
                    key={i}
                    style={{
                        padding: 10,
                        display: "inline-block",
                        cursor: "pointer",
                    }}
                    onClick={() => {
                        setIconName(i);
                        onChange(i);
                        setShow(false);
                    }}
                >
                    <Icon style={{ fontSize: 30 }} />
                </span>,
            );
        }
    }
    return (
        <div>
            <Input
                onFocus={() => {
                    setShow(true);
                }}
                value={iconName}
            />
            <IconRender
                name={iconName}
                style={{ fontSize: 30, marginTop: 10 }}
            />
            {show && (
                <div
                    style={{
                        maxHeight: 200,
                        overflow: "auto",
                    }}
                    className="icon-list"
                >
                    {iconRender}
                </div>
            )}
        </div>
    );
}
