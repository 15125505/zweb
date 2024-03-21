// Description: 处理器基类

import express from "express";

export abstract class Process {
    /**
     * 用于保存消息处理函数的Map
     */
    protected msgFunc = new Map<string, (value: any) => net.AsyncMsg<any>>;

    /**
     * 用于保存自定义的处理函数
     */
    protected commonFunc = new Map<string, (req: express.Request, res: express.Response) => void>();

    constructor() {
        this.init();
    }

    /**
     * 当前是否有消息处理函数
     */
    hasMsgFunc(url: string): boolean {
        return this.msgFunc.has(url);
    }

    /**
     * 当前是否有自定义处理函数
     */
    hasCommonFunc(url: string): boolean {
        return this.commonFunc.has(url);
    }

    /**
     * 用于处理我们自定义的协议请求
     */
    async onReq(url: string, data: any): net.AsyncMsg<any> {
        return this.msgFunc.get(url)?.bind(this)(data);
    }

    /**
     * 用于处理我们自定义的http请求
     */
    onHttpReq(url: string, req: express.Request, res: express.Response) {
        this.commonFunc.get(url)?.bind(this)(req, res);
    }

    abstract init(): void;
}


