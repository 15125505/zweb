declare namespace db {
    type ObjectId = any;

    // 用户模型
    interface User {
        username: string;
        code: string;
    }
}
