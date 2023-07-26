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
    send(name: string, value?: any, err?: string) {
        const out: net.OutMsg = {name};
        if (err) {
            Log.error('消息处理失败：', err)
            out.err = err;
        } else if (value) {
            out.value = value;
        }
        this.ws.send(JSON.stringify(out));
    }

    /**
     * 使用者必须实现该方法，用于判断当前连接是否已经有效，只有有效的连接，才会发送心跳，否则将会在心跳超时后被关闭
     */
    abstract isValid(): boolean;

    /**
     * 处理收到的消息
     * 正常情况下，本函数无需修改
     */
    onMessage(data: any): void {

        Log.log('收到消息', data.toString(), '来自用户：', this.id);

        // 解析并处理消息
        try {
            // 解析消息
            const msg = JSON.parse(data) as net.InMsg;
            if (!msg.name) {
                Log.error('消息格式错误', msg);
                return;
            }

            // 找到消息处理函数并调用
            const fn = this.msgFunc.get(msg.name);
            if (!fn) {
                Log.error('未找到消息处理函数', msg.name);
                return;
            }
            fn(msg.value).then(ret => this.send(msg.name, ret)).catch(err => this.send(msg.name, undefined, err));
        } catch (e) {
            Log.error('消息处理失败', e)
        }
    }


    /**
     * 注册消息处理函数
     */
    protected registerMsg<I, O>(name: string, fn: (value: I) => Promise<O>) {
        this.msgFunc.set(name, fn.bind(this));
    }

    /**
     * 消息处理函数映射表
     */
    protected msgFunc = new Map<string, (value: any) => Promise<any>>();
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
