// import { useCallback, useRef, useMemo } from 'react';
// import { debounce } from '../modules/debounce';
// export function useDebounce(fn, state = [], delay = 500) {
//     const cbRef = useRef(() => {});
//     cbRef.current = useCallback(() => {
//         fn();
//     }, [fn, ...state]);

//     return useMemo(() => {
//         // 原来的 debounce 的 setTimeout 清楚
//         return debounce(() => {
//             // console.log(cbRef?.current)
//             cbRef?.current?.();
//         }, delay);
//     }, []);
// }
