/**
 * Description: 数据库配置模块，该模块同时会初始化数据库连接池
 * Author: zhoufeng
 * Mongo数据库的配置文件
 * 使用说明：
 * 1. 直接在项目中使用gMongoDb.mongo.db(dbName).collection(collectionName).find()方法即可执行查询，其它类似；
 * 2. 本模块会尝试读取源码目录下的mongo.json文件，如果读取失败，会使用默认配置；
 * 3. mongo.json文件的格式请直接参考默认配置；
 * 4. 本模块会自动创建索引，如果索引已存在，则不会重复创建；
 * 5. 注意，任何对本模块mongo的使用，必须等待gMongoDb.waitConnect()方法执行完毕后，方可使用。也就是说，所有的网络请求
 *    必须在gMongoDb.waitConnect()方法执行完毕后，方可执行。而Process模块的waitForInit也正是基于这个目的才存在的。如
 *    果数据库初始阶段存在网络请求，自然会延迟到数据库初始化完成后执行。如果数据库初始化无法成功，那么整个服务将不可能正
 *    常启动，后续的网络请求将毫无意义，那么此时最重要的是排除问题，而不是想办法兼容这种错误。
 */

import { CreateIndexesOptions, IndexSpecification, MongoClient } from "mongodb";
import Log from "crlog";
import { readConfig } from "./config";

interface Config {
    [key: string]: string | number | boolean;
    url: string;
    maxPoolSize: number;
    minPoolSize: number;
    dbName: string;
}

// 默认配置
const DEFAULT_CONFIG: Config = {
    url: "mongodb://localhost:27017",
    maxPoolSize: 50,
    minPoolSize: 5,
    dbName: "my_db",
};

class MongoDb {

    private config: Config;

    constructor() {

        // 读取配置文件
        this.config = readConfig("mongo.json", DEFAULT_CONFIG);

        // 创建MongoClient
        const client = new MongoClient(this.config.url, {
            maxPoolSize: this.config.maxPoolSize,
            minPoolSize: this.config.minPoolSize,
        });

        // 异步连接数据库
        (async () => {
            await client.connect();
            this.mClient = client;
            Log.info("--MongoDB连接成功");

            // 创建索引
            await this.createIndex();
            Log.info("--MongoDB索引创建成功");
        })().catch((e) => {
            Log.error("MongoDB连接失败", e);
        });
    }

    /**
     * 等待连接数据库，10秒超时
     */
    async waitConnect() {
        let i = 0;
        while (!this.mClient && i < 100) {
            await new Promise((resolve) => setTimeout(resolve, 100));
            i++;
        }
    }

    /**
     * mongo客户端
     */
    get mongo(): MongoClient {
        return this.mClient;
    }

    /**
     * 创建数据库索引
     */
    async createIndex() {

        Log.info("创建必要的索引...");

        // 需要创建的索引
        const indexes: { [collection: string]: { indexSpec: IndexSpecification; options: CreateIndexesOptions }[] } = {
            // 下面是一个示例，该示例表示为user集合创建一个username索引，索引类型为升序，索引名称为username，索引选项为unique: true
            // 注意options中的name属性，将作为我们创建索引的依据，如果需要创建新的索引，请确保name属性和之前的任何已有name不同
            // user: [
            //     {
            //         indexSpec: { username: 1 },
            //         options: {
            //             unique: true,
            //             name: "username",
            //             background: true,
            //         },
            //     },
            // ]
        };

        // 强制创建所有的集合
        for (const key of Object.keys(indexes)) {
            try {
                await this.mongo.db(this.config.dbName).createCollection(key);
            } catch (e) {
                if (e.code !== 48) {
                    Log.error("创建集合失败", e);
                }
            }
        }

        // 依次为所有的表创建索引
        for (const key of Object.keys(indexes)) {
            for (const item of indexes[key]) {
                const collection = this.mongo.db(this.config.dbName).collection(key);
                if (await collection.indexExists(item.options.name)) {
                    continue;
                }
                await collection.createIndex(item.indexSpec, item.options);
            }
        }
    }

    /**
     * mongo数据库连接池
     */
    private mClient: MongoClient;
}

export const gMongoDb = new MongoDb();
