// Description: WebSocket服务器模块
// 注意： 本模块仅仅允许创建一个websocket服务，不支持创建多个
// 正常情况下，使用者只需要调用 gWsServer.init() 函数即可，并不需要对本模块的其他内容进行了解

import * as http from "http";
import {WebSocket, WebSocketServer} from "ws";
import Log from "crlog";
import {gWsClients, WsClient} from "./wsClients";


class WsServer {

    /**
     * 启动 WebSocket 服务
     * 使用者只需要调用该函数即可，该函数只允许调用一次
     * @param port  监听的端口
     * @param pfnGenClient  用于生成客户端对象的函数
     * @param url   接受websocket请求的url
     */
    init(port: number, pfnGenClient: (ws: WebSocket) => WsClient, url: string = '/ws') {
        if (this.server) {
            Log.error('不允许创建多个 WebSocket 服务');
            return;
        }

        // 必要的初始化
        const server = http.createServer();
        this.server = server;
        const wss = new WebSocketServer({noServer: true});
        setInterval(this.ping.bind(this), 10000);

        // WebSocketServer 对象监听 connection 事件，当有 WebSocket 连接请求时触发
        wss.on('connection', this.onConnection.bind(this));

        // http Server 对象监听 upgrade 事件，当有 WebSocket 连接请求时触发
        const onUpgrade = (ws: WebSocket) => wss.emit('connection', pfnGenClient(ws));
        server.on('upgrade', (request, socket, head) => {

            // 如果请求的 url 不是指定的 url，则返回 401 未授权错误
            if (request.url !== url) {
                socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n'); // 返回 401 未授权错误
                socket.destroy(); // 销毁 socket 对象
                return;
            }

            // WebSocketServer 对象通过 handleUpgrade 函数将 socket 对象升级成 WebSocket 对象
            wss.handleUpgrade(request, socket, head, onUpgrade);
        });

        // http Server 对象开始监听端口
        server.listen(port, () => Log.warn('服务已启动:', port));
    }

    /**
     * 处理客户端连接
     */
    private onConnection(client: WsClient) {

        // 添加到客户端列表
        gWsClients.addClient(client);

        // 监听 error 事件，当出现错误时删除客户端
        client.ws.on('error', err => {
            Log.error('出错：', err);
            gWsClients.removeClient(client, 'error');
        });

        // 监听 message 事件，当收到消息时输出到控制台
        client.ws.on('message', (data: any) => {
            client.onMessage(data);
        });

        // 监听 pong 事件，当收到 pong 消息时设置 isAlive 为 true
        client.ws.on('pong', () => client.isAlive = true);

        // 监听 close 事件，当连接关闭时删除客户端
        client.ws.on('close', () => gWsClients.removeClient(client, 'close'));
    }


    /**
     * 定时向客户端发送 ping 消息，如果客户端在 10 秒内没有响应，则关闭连接
     */
    private ping() {
        Array.from(gWsClients.clients).forEach(client => {
            if (client.isAlive == false) {
                gWsClients.removeClient(client, 'ping timeout');
                return;
            }
            client.isAlive = false;
            client.isValid() && client.ws.ping();
        });
    }

    /**
     * http Server 对象
     */
    private server: http.Server;
}

export const gWsServer = new WsServer();
