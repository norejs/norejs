import { Image } from "antd";
import { ConfigConsumer } from "../../../modules/config";

export default function ImageRender({
    value: src = "",
    baseUrl = "",
    ...props
}) {
    return (
        <ConfigConsumer>
            {({ ossUrl = "" }) => {
                const fullSrc =
                    src.indexOf("//") > -1 ? src : `${baseUrl || ossUrl}${src}`;
                return (
                    <Image
                        style={{
                            width: 100,
                            height: 100,
                            objectFit: "cover",
                            outline: "none",
                            border: "",
                        }}
                        onError={() => {}}
                        src={`${fullSrc}`}
                        {...props}
                    />
                );
            }}
        </ConfigConsumer>
    );
}
