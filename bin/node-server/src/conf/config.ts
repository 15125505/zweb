import Log from "crlog";
import * as fs from "fs";
import * as path from "path";

/**
 * 读取配置文件
 * @param fileName 配置文件名
 * @param defaultConfig 默认配置
 * @returns 配置对象
 * 说明：
 * 本函数会尝试读取源码目录下的对应配置文件，并校验配置文件格式是否和默认配置一致，如果一致，则返回配置对象，否则返回默认配置；
 */
export function readConfig<T extends { [key: string]: string | number | boolean }>(
    fileName: string,
    defaultConfig: T
): T {
    const configPath = path.join(__dirname, fileName);
    let config: typeof defaultConfig;
    try {
        const fileConfig = JSON.parse(fs.readFileSync(configPath, "utf-8"));
        const isValidConfig = Object.keys(defaultConfig).every((key) => {
            return typeof fileConfig[key] === typeof defaultConfig[key];
        });
        if (isValidConfig) {
            config = fileConfig;
        } else {
            Log.error(`--配置文件${fileName}格式不正确，将使用默认配置。`);
            config = defaultConfig;
        }
    } catch (e) {
        Log.error(`--读取配置文件${fileName}失败，将使用默认配置。`);
        config = defaultConfig;
    }
    Log.info(`--读取配置文件${fileName}后最终使用的配置：`, JSON.stringify(config, null, 2));
    return config;
}
