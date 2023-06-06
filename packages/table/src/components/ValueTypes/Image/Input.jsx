import { LoadingOutlined, PlusOutlined } from "@ant-design/icons";
import { Upload, message } from "antd";
import { useCallback, useEffect, useState } from "react";
import { getBase64, getImageSize } from "common/src/utils/images";

export default function UploadComponent({
    name = "",
    onChange,
    fileType = ["image/jpeg", "image/png"],
    sizeLimit = 1,
    widthLimit = 1000,
    heightLimit = 1000,
    value = "",
    data = {},
    baseUrl = "",
    children = null,
    showUploadList,
    ...props
}) {
    const [loading, setLoading] = useState(false);
    const [imageUrl, setImageUrl] = useState("");
    const [imageSize, setImageSze] = useState({});

    useEffect(() => {
        setImageUrl(value ? baseUrl + value : "");
    }, [value]);

    async function _beforeUpload(file) {
        const isInType = fileType.includes(file.type);
        if (!isInType) {
            message.error("请上传" + fileType.toString() + "格式的文件");
            throw new Error("文件不符合要求");
        }
        const isOverLimit = file.size / 1024 / 1024 > limit;
        if (isOverLimit) {
            message.error("文件大小超过" + limit + "M");
            throw new Error("文件不符合要求");
        }
        let imageOriginSize = (await getImageSize(file)) || {};
        setImageSze(imageOriginSize);
        const { width, height } = imageOriginSize;
        if (width > widthLimit) {
            message.error("宽度超过" + widthLimit + "px");
            throw new Error("文件不符合要求");
        }
        if (height > heightLimit) {
            message.error("高度超过" + heightLimit + "px");
            throw new Error("文件不符合要求");
        }
    }

    const uploadButton = (
        <div>
            {loading ? <LoadingOutlined /> : <PlusOutlined />}
            <div style={{ marginTop: 8 }}>Upload</div>
        </div>
    );

    const handleChange = useCallback(
        (info) => {
            const _upload = async (info) => {
                const { file } = info;
                const { status, response = {} } = file;
                if (status === "uploading") {
                    setLoading(true);
                    onChange("");
                    return;
                }
                if (status === "done") {
                    getBase64(file.originFileObj, (imageUrl) => {
                        setImageUrl(imageUrl);
                        setLoading(false);
                    });
                }
                if (response.code) {
                    if (response.code === 401) {
                        const res = await refreshToken();

                        if (res.code === 200) {
                            message.warn("");
                        } else {
                            message.error();
                        }
                    }
                    if (response.code !== 200) {
                        if (response.error) {
                            message.error(response.error);
                        }
                        onChange(null);
                    } else {
                        onChange(response?.data[0]);
                    }

                    setLoading(false);
                }
            };
            return _upload(info);
        },
        [onChange],
    );
    const _children =
        children || imageUrl ? (
            <img
                src={imageUrl}
                alt=""
                style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                }}
            />
        ) : (
            uploadButton
        );
    return (
        <div>
            <Upload
                name="file"
                listType="picture-card"
                className="avatar-uploader"
                showUploadList={showUploadList}
                beforeUpload={_beforeUpload}
                onChange={handleChange}
                data={{ ...data, ...imageSize }}
                {...props}
            >
                {_children}
            </Upload>
        </div>
    );
}
