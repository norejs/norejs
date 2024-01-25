import { Image } from "antd";
const OSS_URL = process.env.REACT_APP_OSS_URL;

export default function OssImage({ value, ...props }) {
    let fullSrc = src.indexOf("static/") > -1 ? src : `/static/${src}`;

    fullSrc = fullSrc?.indexOf("//") > -1 ? fullSrc : `${OSS_URL}${fullSrc}`;
    return <Image src={`${fullSrc}`} {...props} />;
}
