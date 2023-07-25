// Description: 用于定义网络协议的模块
// 所有网络协议遵循以下规则：
// 1. 所有返回给客户端的消息都必须遵循net.Msg的定义
// 2. msg字段的具体内容和协议本身相关，在netRes中定义
// 3. 下方的Login是一个例子，可以根据实际需要进行修改

declare namespace net {

    /**
     * 所有返回的消息都必须遵循本定义
     */
    interface Msg<T> {
        code: number;
        err?: string;
        msg?: T;
    }

    /**
     * 异步返回的消息
     */
    type AsyncMsg<T> = Promise<Msg<T>>;
}

/**
 * 客户端请求的消息参数
 */
declare namespace netParam {

    /**
     * 客户端登录
     */
    interface Login {
        code: string;       // 登录码
    }

}

/**
 * 服务器返回的数据格式
 */
declare namespace netRet {


    /**
     * 客户端登录反馈
     */
    interface Login {
        token: string;     // 登录成功后，服务器返回的token
    }
}

