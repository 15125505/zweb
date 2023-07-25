import {gHttpServer} from "./core/httpServer";
import {Example} from "./app/example";

gHttpServer.init({
    port: parseInt(process.env.PORT ?? '5000'),
    encrypt: true,          // 如果需要加密，将该项设置为true，否则可以删除该项
    allowOrigin: true,      // 如果需要跨域，将该项设置为true，否则可以删除该项
}, [new Example()]); // todo: 将Example替换为自己的处理器，可以有多个处理器
