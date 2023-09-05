import {gHttpServer} from "./core/httpServer";
import {Example} from "./app/example";
import Log from "crlog";

// 处理未捕获的异常以及未处理的promise异常，注意，这个事情非常重要，否则一些第三方库的不合理使用可能会导致服务器崩溃
process.on('uncaughtException', (err) => {
    Log.error('未曾捕获的全局异常: ', err);
});
process.on('unhandledRejection', (reason, promise) => {
    Log.error('未曾捕获的Rejection:', promise, 'reason:', reason);
});

gHttpServer.init({
    port: parseInt(process.env.PORT ?? '5000'),
    encrypt: true,          // 如果需要加密，将该项设置为true，否则可以删除该项
    allowOrigin: true,      // 如果需要跨域，将该项设置为true，否则可以删除该项
}, [new Example()]); // todo: 将Example替换为自己的处理器，可以有多个处理器
