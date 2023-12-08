export function debounce(fn, delay) {
    // 维护一个 timer，用来记录当前执行函数状态
    let timer = null;

    return function () {
        // 通过 ‘this’ 和 ‘arguments’ 获取函数的作用域和变量
        let context = this;
        let args = arguments;
        // 清理掉正在执行的函数，并重新执行
        clearTimeout(timer);
        timer = setTimeout(function () {
            fn.apply(context, args);
        }, delay);
    };
}
