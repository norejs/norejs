import React from "react";
import * as icons from "@ant-design/icons";

export default function IconRender({ value = "", name = "", ...props }) {
    const Icon = icons[name || value];
    return Icon ? <Icon {...props} /> : "";
}
