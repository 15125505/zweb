// Create by zhoufeng
// Description: dbConfig
// Date: 2023-07-20 11:11

import * as mysql from 'mysql2/promise'

class DbConfig {
    constructor() {
        this.pool = mysql.createPool({
            host: '127.0.0.1',
            port: 3306,
            user: 'green',
            password: 'token2User',
            database: 'chat',
            connectionLimit: 50,
        });
    }

    /**
     * 数据库连接池
     */
    readonly pool: mysql.Pool;
}

export const gDb = new DbConfig();
