// Description: 这个文件用于演示如何操作数据库，目前的例子是访问连接数据表

import * as mysql from "mysql2/promise";
import {gDb} from "../db/dbConfig";
import Log from "crlog";

export interface ClientInfo {
    id: number;         // 这是该连接请求在数据库中的ID
    client_id: string;  // 这是该连接的唯一ID，对于每个websocket连接都有一个唯一的ID
    user_id: number;    // 这是该连接对应的用户ID
}

class AppDb {

    constructor() {
        setInterval(() => {
            this.clearExpiredClients().catch(e => {
                console.log('清理过期客户端连接失败', e);
            });
        }, 60 * 1000);
    }

    // 添加一个新的记录到客户端连接表
    async addClient(clientId: string, userId: number): Promise<mysql.ResultSetHeader> {
        const res = await gDb.pool.query(`insert into chat.client (client_id, user_id) values (?, ?)`, [clientId, userId]);
        return res[0] as mysql.ResultSetHeader;
    }

    // 获取指定ID之后的所有记录
    async getClientsAfterId(id: number): Promise<ClientInfo[]> {
        const res = await gDb.pool.query(`select id, client_id, user_id from chat.client where id > ?`, [id]);
        return res[0] as ClientInfo[];
    }


    // 清理数据库中的过期记录
    private async clearExpiredClients(): Promise<void> {

        // 获取十分钟之前的记录数量
        const [rows] = await gDb.pool.query(`select count(*) as count from chat.client where create_time < DATE_SUB(NOW(), INTERVAL 10 MINUTE)`);
        const count = (rows as { count: number }[])[0].count;
        if (count < 10000) {
            Log.info('检查过期客户端连接', count);
            return;
        }
        Log.warn('清理过期客户端连接：', count);

        // 删除十分钟之前的记录并执行optimize table
        const tm = Date.now();
        await gDb.pool.query(`delete from chat.client where create_time < DATE_SUB(NOW(), INTERVAL 10 MINUTE)`);
        await gDb.pool.query(`optimize table chat.client`);
        Log.warn('清理过期客户端连接耗时：', Date.now() - tm, 'ms');
    }
}

export const gAppDb = new AppDb();
