// 用于管理 表单中字段的关联
import { useCallback, useMemo, useState, useEffect } from "react";

export default function useDependencies({ structure, initData }) {
    const dependenciesMap = useMemo(() => {
        const res = {};
        structure.forEach(({ dependencies, key }) => {
            if (dependencies && dependencies.length > 0 && key) {
                dependencies.forEach((dependency) => {
                    if (!res[dependency]) {
                        res[dependency] = [];
                    }
                    if (!res[dependency].includes(key)) {
                        res[dependency].push(key);
                    }
                });
            }
        });

        return res;
    }, [structure]);

    const [dependenciesValues, _setDependenciesValues] = useState({});

    const setDependenciesValues = useCallback(
        (changed) => {
            const newValue = {};
            for (let changedKey in changed) {
                let changedValue = changed[changedKey];
                if (dependenciesMap[changedKey]) {
                    dependenciesMap[changedKey].forEach((dependency) => {
                        if (!newValue[dependency]) {
                            newValue[dependency] = {};
                        }
                        newValue[dependency][changedKey] = changedValue;
                    });
                }
            }

            if (Object.keys(newValue).length > 0) {
                _setDependenciesValues({ ...dependenciesValues, ...newValue });
            }
        },
        [dependenciesValues, _setDependenciesValues, dependenciesMap],
    );
    useEffect(() => {
        setDependenciesValues(initData);
        // eslint-disable-next-line
    }, [initData]);
    return { dependenciesMap, dependenciesValues, setDependenciesValues };
}
