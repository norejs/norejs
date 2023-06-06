import { LoadingOutlined, PlusOutlined } from "@ant-design/icons";
import { Upload, message } from "antd";
import { useCallback, useEffect, useState } from "react";
import { refreshToken } from "@/apis/user";
import useAuth from "@/shared/hooks/useAuth";
import { getBase64, getImageSize } from "@/shared/utils/images";
const OSS_URL = process.env.REACT_APP_OSS_URL;

export default function UploadComponent({
    onChange,
    fileType = ["image/jpeg", "image/png"],
    limit = 5,
    value = {},
    business = {},
    thumbnail = { width: 1000, quality: 70 },
}) {
    const [loading, setLoading] = useState(false);
    const [imageUrl, setImageUrl] = useState("");
    const [imageSize, setImageSze] = useState({});
    const { accessToken } = useAuth();
    useEffect(() => {
        const { url = "" } = value || {};
        setImageUrl(url ? OSS_URL + url : "");
    }, [value]);

    async function beforeUpload(file) {
        const isInType = fileType.includes(file.type);

        if (!isInType) {
            message.error("请上传" + fileType.toString() + "格式的文件");
        }
        const isOverLimit = file.size / 1024 / 1024 > limit;
        if (isOverLimit) {
            message.error("文件大小超过" + limit + "M");
        }
        let imageOriginSize = (await getImageSize(file)) || {};
        setImageSze(imageOriginSize);
        if (!isInType || isOverLimit) {
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
    return (
        <div>
            <Upload
                name="file"
                listType="picture-card"
                className="avatar-uploader"
                showUploadList={false}
                action={process.env.REACT_APP_API_URL + "/oss/upload"}
                beforeUpload={beforeUpload}
                onChange={handleChange}
                data={{
                    needThumbnail: !!thumbnail,
                    ...thumbnail,
                    business: JSON.stringify({ ...business, ...imageSize }),
                }}
                headers={{
                    Authorization: accessToken,
                }}
            >
                {imageUrl ? (
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
                )}
            </Upload>
        </div>
    );
}
