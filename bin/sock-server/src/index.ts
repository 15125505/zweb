import {gWsServer} from "./core/wsServer";
import {AppClient} from "./app/appClient";

// 从环境变量中获取端口号，如果没有则使用 5000
gWsServer.init(parseInt(process.env.PORT ?? '5000'), AppClient.newClient);

// 启动登录检查，这个是为了保证用户一个账号只能连接一次，如果不需要这个功能，可以删除相关代码
AppClient.startLoginCheck();

