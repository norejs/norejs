export default function uuid() {
    if (crypto?.randomUUID) {
        return crypto.randomUUID();
    }
    return _generateUniqueId();
}

function _generateUniqueId() {
    const timestamp = new Date().getTime(); // 获取当前时间的时间戳
    const randomSegment = Math.random().toString(36).substring(2, 15); // 生成一个随机字符串
    return `${timestamp}-${randomSegment}`;
}
