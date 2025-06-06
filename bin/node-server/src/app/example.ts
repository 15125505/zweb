// Description: 本文是一个例子，用于演示如何使用本框架
// 使用方法： 复制一下本文件，然后按照要求修改

import { gMongoDb } from "../conf/mongoConfig";
import { gMysql } from "../conf/mysqlConfig";
import {Process} from "../core/process";

import express from "express";


// todo: 修改类名为你的类名
export class Example extends Process {

    init(): void {
        // todo: 添加自己的http原生处理函数（需要自行处理数据收发）
        this.commonFunc.set('/test', this.onTest);

        // todo: 添加自己的消息处理函数（使用约定的消息传递方式）
        this.msgFunc.set('/login', this.onLogin);
    }

    // todo: 如果是需要自己原生处理http请求，那么使用这种方式
    onTest(req: express.Request, res: express.Response) {
        res.send('test');
    }

    // todo: 在这儿定义消息处理过程
    async onLogin(param: netParam.Login): net.AsyncMsg<netRet.Login> {

        // todo: 此处顺便演示一下如何查询数据库
        const [rows] = await gMysql.pool.query(`select username as token from user where code = ?`, [param.code]);     // 如果sql语句异常，会抛出异常
        let token = (rows as { token: string }[])[0]?.token; // 如果没有查询到结果，rows是一个空数组
        if (!token) {
            return {code: 1, err: '登录码错误'};
        }
        console.log("mysql：", token);

        // todo: 此处顺便演示一下如何查询Mongo数据库
        const user = await gMongoDb.mongo.db('my_db').collection<db.User>('user').findOne({code: param.code});
        if (!user) {
            return {code: 1, err: '登录码错误'};
        }
        token = user.username;
        console.log("mongo：", token);

        return {code: 0, msg: {token}};
    }
}

