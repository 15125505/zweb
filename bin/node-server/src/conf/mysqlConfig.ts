/**
 * Description: 数据库配置模块，该模块同时会初始化数据库连接池
 * Author: zhoufeng
 * Mysql数据库的配置文件
 * 使用说明：
 * 1. 直接在项目中使用gMysql.pool.query()方法即可执行查询，其它类似；
 * 2. 本模块会尝试读取源码目录下的mysql.json文件，如果读取失败，会使用默认配置；
 * 3. mysql.json文件的格式请直接参考默认配置；
 */

import * as mysql from "mysql2/promise";
import { readConfig } from "./config";

interface Config {
    [key: string]: string | number | boolean;
    host: string;
    port: number;
    user: string;
    password: string;
    database: string;
    connectionLimit: number;
}

// 默认配置
const DEFAULT_CONFIG: Config = {
    host: "127.0.0.1",
    port: 3306,
    user: "root",
    password: "password",
    database: "my_db",
    connectionLimit: 50,
};

class MysqlDb {

    constructor() {
        this.pool = mysql.createPool(readConfig<Config>("mysql.json", DEFAULT_CONFIG));
    }

    /**
     * Mysql数据库连接池
     */
    readonly pool: mysql.Pool;
}

export const gMysql = new MysqlDb();
