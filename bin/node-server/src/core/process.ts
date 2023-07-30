// Description: 处理器基类

export abstract class Process {
    /**
     * 用于保存消息处理函数的Map
     */
    protected msgFunc = new Map<string, (value: any) => net.AsyncMsg<any>>;

    constructor() {
        this.init();
    }

    async onReq(url: string, data: any): net.AsyncMsg<any> {
        const fun = this.msgFunc.get(url);
        if (!fun) {
            return;
        }
        return fun.bind(this)(data);
    }

    abstract init(): void;
}


