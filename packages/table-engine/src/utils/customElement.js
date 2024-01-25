import { isValidElement, Component } from "react";
export function isReactComponent(obj) {
    return obj && (typeof obj === "function" || obj instanceof Component);
}
export default function customElement(origin, custom = undefined) {
    if (typeof custom === "undefined") {
        return origin;
    }
    // 如果是元素直接替换
    if (isValidElement(custom)) {
        return () => {
            return custom;
        };
    }

    return isReactComponent(custom)
        ? custom
        : () => {
              return null;
          };
}
