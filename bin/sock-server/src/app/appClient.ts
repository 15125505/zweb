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
    static newClient(ws: WebSocket, ip: string): AppClient {
        return new AppClient(ws, ip);
    }

    /**
     * 构造函数，需要注册的消息处理函数在此处注册
     */
    constructor(ws: WebSocket, ip: string) {
        super(ws, ip);
        this.registerMsg<netI.ComeIn, netO.ComeIn>('comeIn', this.onComeIn);
        this.encrypt = true;
    }

    /**
     * 登录消息处理函数
     * 本函数是一个示例，使用者可以根据自己的需要进行修改
     */
    private async onComeIn(value: netI.ComeIn): Promise<netO.ComeIn> {

        // 从数据库查询用户ID
        this.userId = await gAppDb.token2UserId(value.token);
        Log.warn(this.ip, '用户', this.userId, '登录成功', gWsClients.clients.size);

        // 将当前连接信息加入到数据库，这一步操作是为了实现账号互斥
        this.userId && gAppDb.addClient(this.id, this.userId).then(res => {
            if (!AppClient.lastCheckId) {
                AppClient.lastCheckId = res.insertId;
            }
        });

        return {userId: this.userId, id: this.id};
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
     * 本连接对应的用户ID
     */
    private userId: number;

    /**
     * 是否有效连接将决定是否发送心跳
     */
    isValid(): boolean {
        return true;
    }


}
