import { useCallback, useMemo } from "react";
// 用于管理参数的别名
export default function useAlias({ structure = [], form = null }) {
    // 别名Map
    const aliasMap = useMemo(() => {
        const res = {};
        structure.forEach(({ alias, key }) => {
            if (alias && key) {
                res[key] = alias;
            }
        });
        return res;
    }, [structure]);

    const syncAlias = useCallback(
        (changed) => {
            for (let i in changed) {
                if (aliasMap[i]) {
                    form.setFieldsValue({ [aliasMap[i]]: changed[i] });
                }
            }
        },
        [form, aliasMap],
    );

    return { syncAlias };
}
