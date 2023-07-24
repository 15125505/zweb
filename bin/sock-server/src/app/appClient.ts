/// <reference path="../@types/net.d.ts" />
// Description: 本文件是一个从WsClient派生自己的客户端类的示例
// 例子中进行了一次登录操作，登录成功后，服务器会返回一个token
// 如果同一个用户多次登录，后面的登录会将前面的登录踢下线


import {gWsClients, WsClient} from "../core/wsClients";
import {WebSocket} from "ws";
import {ClientInfo, gAppDb} from "./appDb";
import Log from "crlog";

export class AppClient extends WsClient {

    /**
     * 用于创建客户端对象的函数
     * 正常情况下，本函数无需修改
     */
    static newClient(ws: WebSocket): AppClient {
        return new AppClient(ws);
    }


    /**
     * 构造函数
     * 正常情况下，本函数无需修改
     */
    private constructor(ws: WebSocket) {
        super(ws);
        this.init();
    }

    /**
     * 处理收到的消息
     * 正常情况下，本函数无需修改
     */
    onMessage(data: any): void {

        Log.log('收到消息', data.toString(), '来自用户：', this.id);

        // 解析并处理消息
        try {
            // 解析消息
            const msg = JSON.parse(data);
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
            fn.bind(this)(msg.value);
        } catch (e) {
            Log.error('消息处理失败', e)
        }
    }


    /**
     * 进行账号互斥检查
     */
    static startLoginCheck() {
        const check = async () => {
            if (!AppClient.lastCheckId) {
                return;
            }
            const vecNewClient = await gAppDb.getClientsAfterId(AppClient.lastCheckId);
            const userId2Client = new Map<number, ClientInfo>();
            vecNewClient.forEach(client => {
                userId2Client.set(client.user_id, client);
                AppClient.lastCheckId = client.id;
            });
            Array.from(gWsClients.clients).forEach((c: AppClient) => {
                const client = userId2Client.get(c.userId);
                if (!client) {
                    return;
                }
                if (c.id != client.client_id) {
                    gWsClients.removeClient(c, 'Other Login');
                }
            });
        }
        setInterval(check, 1000);
    }

    /**
     * 用于记录最后一次检查的ID，用于账号互斥检查
     */
    private static lastCheckId = 0;

    /**
     * 消息处理函数映射表
     */
    private msgFunc = new Map<string, (value: any) => any>();

    //////////////////////////////// 正常情况下，以下内容是需要根据自己业务需求进行调整的 ////////////////////////////////

    /**
     * 本连接对应的用户ID
     */
    private userId: number;

    /**
     * 已经成功登录的连接视为有效连接
     */
    isValid(): boolean {
        return !!this.userId;
    }

    /**
     * 初始化消息处理函数
     * 用户需要将自己的消息处理函数注册到msgFunc中
     */
    private init() {
        this.msgFunc.set('login', this.onLogin);
    }

    /**
     * 登录消息处理函数
     * 本函数是一个示例，使用者可以根据自己的需要进行修改
     */
    private onLogin(value: net.c.Login) {

        // 根据自己的业务需求，此处需要根据登录的信息获得用户ID，这里使用了一个简单的做法
        this.userId = parseInt(value.code);
        Log.warn('用户', this.userId, '登录成功');

        // 通知客户端登录成功
        const ret: net.s.Login = {token: this.id};
        this.send('login', ret);

        // 将当前连接信息加入到数据库，这一步操作是为了实现账号互斥
        gAppDb.addClient(this.id, this.userId).then(res => {
            if (!AppClient.lastCheckId) {
                AppClient.lastCheckId = res.insertId;
            }
        });
    }
}
