// Description: websocket客户端管理模块
// 注意：使用者需要创建一个自己的客户端类，继承自 WsClient 类
// 本模块仅仅负责管理客户端连接，不负责处理具体的业务逻辑
// WsClient类中的id是一个唯一的字符串，用于标识一个客户端连接

import {WebSocket} from "ws";
import Log from "crlog";

/**
 * 客户端连接的基类，使用者必须继承该类
 */
export abstract class WsClient {

    readonly ws: WebSocket;
    readonly id: string;
    isAlive: boolean;

    protected constructor(ws: WebSocket) {
        this.ws = ws;
        this.id = Date.now() + Math.random().toFixed(4);
        this.isAlive = true;
    }

    /**
     * 发送消息到客户端
     */
    send(name: string, value?: any) {
        this.ws.send(JSON.stringify(value ? {name, value} : {name}));
    }

    /**
     * 使用者必须实现该方法，用于判断当前连接是否已经有效，只有有效的连接，才会发送心跳，否则将会在心跳超时后被关闭
     */
    abstract isValid(): boolean;

    /**
     * 使用者必须实现该方法，用于处理收到的消息
     */
    abstract onMessage(data: any): void;
}


class WsClients {

    clients = new Set<WsClient>();

    addClient(client: WsClient) {
        this.clients.add(client);
        this.showLog && Log.info('新连接加入：', client.id, '当前连接数：', this.clients.size)
    }

    removeClient(client: WsClient, reason = 'unknown') {
        client.ws.close(1000, reason);
        const ok = this.clients.delete(client);
        this.showLog && Log.info('因为', reason, '关闭连接：', client.id, ok, '当前连接数：', this.clients.size)
    }

    /**
     * 是否显示日志，如果不希望显示日志，可以将该值设置为 false
     */
    showLog = true;
}

export const gWsClients = new WsClients();
