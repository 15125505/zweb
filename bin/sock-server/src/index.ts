import {gWsServer} from "./core/wsServer";
import {AppClient} from "./app/appClient";
import Log from "crlog";

// 处理未捕获的异常以及未处理的promise异常，注意，这个事情非常重要，否则一些第三方库的不合理使用可能会导致服务器崩溃
process.on('uncaughtException', (err) => {
    Log.error('未曾捕获的全局异常: ', err);
});
process.on('unhandledRejection', (reason, promise) => {
    Log.error('未曾捕获的Rejection:', promise, 'reason:', reason);
});

// 设置日志输出级别
Log.showStack = true;

// 从环境变量中获取端口号，如果没有则使用 5000
gWsServer.init(parseInt(process.env.PORT ?? '5000'), AppClient.newClient);

// 启动登录检查，这个是为了保证用户一个账号只能连接一次，如果不需要这个功能，可以删除相关代码
AppClient.startLoginCheck();

