# NoreJs
## runSh

``` javascript
import { runSh } from 'norejs';

// 运行 node -v 命令
runSh('node -v',{
    // 是否直接打印
    print:false
},(code,data)=>{
    // 回调函数
    console.log(code,data);
});
```
