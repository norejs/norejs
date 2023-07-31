import { createContext } from "react";
const initValue = {
    ossUrl: "",
    request: null,
    uploadUrl: "",
    apiUrl: "",
    valueTypes: {},
};
const { Provider, Consumer } = createContext({ ...initValue });

function ConfigProvider({ value, children, ...props }) {
    return (
        <Provider value={{ ...initValue, ...value }} {...props}>
            {children}
        </Provider>
    );
}
export { ConfigProvider, Consumer as ConfigConsumer };
