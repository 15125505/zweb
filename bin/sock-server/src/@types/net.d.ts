// Description: 用于定义网络协议的模块
// 所有网络协议遵循以下规则：
// 1. 所有消息都必须遵循net.Msg的定义，例如 {name:'login', value: {token: 'xxxx'}}
// 2. 通过消息的name字段确定其消息类型，该类型对应的value字段的含义将在下方定义
// 3. 在下方的定义中，定义的名称是name字段首字母大写后的值，定义的内容是value字段的类型
// 4. 所有客户端发送给服务器的消息，必须有反馈信息，以便客户端确认消息已经被服务器收到
// 5. 下方的Login是一个例子，可以根据实际需要进行修改

declare namespace net {

    /**
     * 输入消息统一格式
     */
    interface InMsg<T = any> {
        name: string;
        value?: T;
    }

    /**
     * 输出消息统一格式
     */
    interface OutMsg<T = any> {
        name: string;
        value?: T;
        err?: string;   // 错误信息字段如果存在，则表示处理出错
    }
}

/**
 * 客户端 -> 服务器
 */
declare namespace netI{

    /**
     * 客户端登录
     */
    interface Login {
        code: string;       // 登录码
    }

}

/**
 * 服务器 -> 客户端
 */
declare namespace netO {

    /**
     * 客户端登录反馈
     */
    interface Login {
        token?: string;     // 登录成功后，服务器返回的token
        reason?: string;    // 登录失败时，服务器返回的原因
    }
}
