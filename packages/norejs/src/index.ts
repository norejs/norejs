// // 入口文件
// export { default as runSh } from './modules/runSh';
// export { debounce } from './modules/debounce';
// export { useDebounce } from './hooks/useDebounce';

const weakmap = new WeakMap();
console.log(weakmap);
export default class A{
    constructor(){
        weakmap.set(this, 'A');
    }
}