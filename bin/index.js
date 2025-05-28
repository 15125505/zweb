#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function main() {

    const packageJson = require('../package.json');
    console.log('zweb版本：', packageJson.version);

    // 获取参数
    const params = [...process.argv];
    let isSock = false, isServer = false, isWeb = false;
    let index = params.indexOf('-sock');
    if (index >= 0) {
        params.splice(index, 1);
        isSock = true;
    }
    index = params.indexOf('-server');
    if (index >= 0) {
        params.splice(index, 1);
        isServer = true;
    }
    index = params.indexOf('-web');
    if (index >= 0) {
        params.splice(index, 1);
        isWeb = true;
    }

    const usage = () => console.log(`zweb命令语法（abc为你想要创建的项目名称）：
        zweb abc -web       # 创建普通的web项目
        zweb abc -sock      # 创建node.js的websocket服务器
        zweb abc -server    # 创建node.js的web服务器`);


    // 如果参数个数不为3个，那么提示使用方法
    if (params.length !== 3) {
        usage();
        return;
    }

    // 创建目录
    let name = params[2];
    let folderName = path.join(process.cwd(), name);
    console.log('开始创建目录：', folderName);

    // 创建目录
    if (fs.existsSync(folderName)) {
        console.warn('项目创建失败：当前路径下已经存在名为', name, '的文件或文件夹！');
        return;
    }

    // 写入文件
    let srcFolder = __dirname
    if (isSock) {
        zSockServer(path.join(srcFolder, 'sock-server'), folderName, name);
        return;
    }
    if (isServer) {
        zNodeServer(path.join(srcFolder, 'node-server'), folderName, name);
        return;
    }
    if (isWeb) {
        zWeb(path.join(srcFolder, 'web'), folderName, name);
        return;
    }

    console.log('项目创建失败：未指定项目类型！');
    usage();
}

function zSockServer(srcFolder, dstFolder, name) {
    const files = [
        '/ecosystem.config.js',
        '/package.json',
        '/README.md',
        '/tsconfig.json',
        '/webpack.config.js',
        '/upload.ts',
        '/src/index.ts',
        '/src/@types/net.d.ts',
        '/src/app/appClient.ts',
        '/src/app/appDb.ts',
        '/src/core/wsClients.ts',
        '/src/core/wsServer.ts',
        '/src/db/dbConfig.ts'
    ];
    files.forEach(value => zCopy(path.normalize(srcFolder + value), path.normalize(dstFolder + value), 'proj_name', name))
    zCopy(path.join(srcFolder, 'gitignore.tpl'), path.join(dstFolder, '.gitignore'));
}

function zNodeServer(srcFolder, dstFolder, name) {
    const files = [
        '/ecosystem.config.js',
        '/.prettierrc.json',
        '/package.json',
        '/README.md',
        '/tsconfig.json',
        '/webpack.config.js',
        '/upload.ts',
        '/src/index.ts',
        '/src/@types/net.d.ts',
        '/src/@types/db.d.ts',
        '/src/app/example.ts',
        '/src/conf/config.ts',
        '/src/conf/mysqlConfig.ts',
        '/src/conf/mongoConfig.ts',
        '/src/core/httpServer.ts',
        '/src/core/process.ts',
    ];
    files.forEach(value => zCopy(path.normalize(srcFolder + value), path.normalize(dstFolder + value), 'proj_name', name))
    zCopy(path.join(srcFolder, 'gitignore.tpl'), path.join(dstFolder, '.gitignore'));
}

function zWeb(srcFolder, dstFolder, name) {
    const files = [
        '/index.html',
        '/package.json',
        '/postcss.config.js',
        '/README.md',
        '/tsconfig.json',
        '/upload.ts',
        '/webpack.config.js',
        '/src/index.ts',
        '/src/style.css',
    ];
    files.forEach(value => zCopy(path.normalize(srcFolder + value), path.normalize(dstFolder + value), 'proj_name', name))
    zCopy(path.join(srcFolder, 'gitignore.tpl'), path.join(dstFolder, '.gitignore'));
}

// 复制指定目录下的文件
function zCopy(srcPath, dstPath, replaceString = '', toString = '') {
    try {
        let data = fs.readFileSync(srcPath, 'utf-8');
        if (replaceString) {
            data = data.replace(RegExp(replaceString, 'g'), toString);
        }
        const dirPath = path.dirname(dstPath);
        if (!fs.existsSync(dirPath)) {
            // 创建目录层次
            fs.mkdirSync(dirPath, {recursive: true});
        }
        fs.writeFileSync(dstPath, data);
    } catch (err) {
        console.error(`项目创建失败：文件<${dstPath}>创建过程中出现异常——`, err);
        return false;
    }
    console.log('文件', dstPath, '已经成功创建！');
    return true;
}


main();
