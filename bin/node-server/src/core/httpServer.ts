// Description: http服务器

import * as express from 'express';
import Log from "crlog";
import {Process} from "./process";
const bodyParser = require('body-parser');

class HttpServer {

    /**
     * 用于保存所有的消息处理器
     */
    private handles: Process[];

    /**
     * 用户参数
     */
    private params: {
        port: number;           // 监听的端口
        encrypt: boolean;       // 是否加密
        allowOrigin: boolean;   // 是否允许跨域
        [key: string]: any;
    } = {
        port: 4000,
        encrypt: false,
        allowOrigin: false,
    };

    /**
     * 初始化
     */
    init(params: Partial<typeof this.params>, handles: Process[]) {

        // 防止重复初始化
        if (this.handles) {
            Log.error('重复初始化HttpServer');
            return;
        }
        this.handles = handles;
        for (const param in params) {
            this.params[param] = params[param];
        }

        // express初始化
        const app = express();
        app.disable('x-powered-by');
        app.disable('etag');

        // 这句代码保证所有请求的body都被解析为二进制数据
        app.use(bodyParser.raw({type: '*/*'}));

        // 显示请求的时间等信息
        app.use((req, res, next) => {

            // 跨域设置
            this.params.allowOrigin && res.set({
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization, Content-Length, X-Requested-With'
            });

            // 显示请求的时间等信息
            const startTime = process.hrtime();
            res.on('finish', () => this.showInfo(req, res.statusCode, process.hrtime(startTime)));
            next();
        });

        // 处理请求
        app.use((req, res, next) => {
            this.process(req, res).catch(e => res.status(500).send(e));
        });

        // 启动服务器
        app.listen(this.params.port, () => Log.warn(`启动成功： http://localhost:${this.params.port}/`));
    }

    /**
     * 处理请求
     */
    private async process(req: express.Request, res: express.Response) {
        const data = this.decode(req.body);
        Log.info('收到：', data);
        for (const p of this.handles) {
            const msg = await p.onReq(req.url, data);
            if (msg) {
                Log.info('返回：', msg);
                res.send(this.encode(msg));
                return;
            }
        }
        res.status(404).send('404');
    }

    /**
     * 将数据编码为二进制数据并进行加密
     */
    private encode(data: any): Buffer {
        const buff = Buffer.from(JSON.stringify(data));
        if (this.params.encrypt) {
            for (let i = 0; i < buff.length; ++i) {
                buff[i] = buff[i] ^ 0x47;
            }
        }
        return buff;
    }

    /**
     * 将二进制数据解密并解码为数据
     */
    private decode(buff: Buffer): any {
        if (this.params.encrypt) {
            for (let i = 0; i < buff.length; ++i) {
                buff[i] = buff[i] ^ 0x47;
            }
        }
        try {
            return JSON.parse(buff.toString());
        } catch (e) {
            Log.error('解析数据失败', buff.toString(), e);
        }
    }

    /**
     * 显示请求信息
     */
    private showInfo(req: express.Request, statusCode: number, time: [number, number]) {
        const ip = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || req.socket.remoteAddress;
        let ua = req.headers['user-agent'];
        if (ua.length > 50) {
            ua = ua.substring(ua.length - 50);
        }
        console.log(
            this.color(` ${statusCode} `, 34, statusCode < 400 ? 42 : (statusCode < 500 ? 43 : 41))
            + this.color(this.timeString(time[0], time[1]).padStart(12), 33)
            + this.color('|' + (Array.isArray(ip) ? ip[0] ?? '' : ip).padStart(16), 32)
            + this.color('|' + req.method.padStart(7), 36)
            + this.color('|' + ua.padStart(50), 32)
            + this.color('|' + req.url, 37)
        );
    }

    /**
     * 用于给字符串添加颜色
     */
    private color(text: string, crText: number, crBg?: number): string {
        let str = '\x1b[1;';
        if (crText >= 30 && crText <= 37) {
            str += crText + ';';
        }
        if (crBg >= 40 && crBg <= 47) {
            str += crBg + ';';
        }
        if (str.endsWith(';')) {
            str = str.slice(0, -1);
        }
        str += 'm' + text + '\x1b[0m';
        return str;
    }


    /**
     * 将秒和纳秒转换为字符串
     */
    private timeString(sec: number, nano: number): string {
        let ms = (sec * 1000) + Math.floor(nano / 1000000);
        if (ms < 1) {
            return `${nano / 1000000}µs`;
        } else if (ms < 1000) {
            return `${ms}ms`;
        } else if (ms < 60000) {
            let s = Math.floor(ms / 1000);
            ms = ms % 1000;
            return `${s}s${ms}ms`;
        } else if (ms < 3600000) {
            let m = Math.floor(ms / 60000);
            ms = ms % 60000;
            let s = Math.floor(ms / 1000);
            ms = ms % 1000;
            return `${m}m${s}s${ms}ms`;
        } else {
            let h = Math.floor(ms / 3600000);
            ms = ms % 3600000;
            let m = Math.floor(ms / 60000);
            ms = ms % 60000;
            let s = Math.floor(ms / 1000);
            ms = ms % 1000;
            return `${h}h${m}m${s}s${ms}ms`;
        }
    }
}

export const gHttpServer = new HttpServer();
