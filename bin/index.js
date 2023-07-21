#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function main() {

    // 获取参数
    const params = [...process.argv];
    let isSock = false, isServer = false;
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

    // 如果参数个数不为3个，那么提示使用方法
    if (params.length !== 3) {
        console.log(`zweb命令语法（abc为你想要创建的项目名称）：
        zweb abc            # 创建普通的web项目
        zweb abc -sock      # 创建node.js的聊天服务器
        zweb abc -server    # 创建node.js的web服务器`);
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
    let srcFolder = path.parse(process.argv[1]).dir;
    if (isSock) {
        zSockServer(path.join(srcFolder, 'sock-server'), folderName, name);
        return;
    }

    srcFolder = path.join(srcFolder, 'tpl');
    console.log('原始目录', srcFolder);

    zCopy(path.join(srcFolder, 'gitignore.tpl'), path.join(folderName, '.gitignore'));
    zCopy(path.join(srcFolder, 'package.tpl'), path.join(folderName, 'package.json'), 'proj_name', name);
    zCopy(path.join(srcFolder, 'README.md'), path.join(folderName, 'README.md'));
    zCopy(path.join(srcFolder, 'webpack.common.js'), path.join(folderName, 'webpack.common.js'));
    zCopy(path.join(srcFolder, 'webpack.dev.js'), path.join(folderName, 'webpack.dev.js'));
    zCopy(path.join(srcFolder, 'webpack.prod.js'), path.join(folderName, 'webpack.prod.js'));
    zCopy(path.join(srcFolder, 'src', 'index.html'), path.join(folderName, 'src', 'index.html'));
    zCopy(path.join(srcFolder, 'src', 'index.js'), path.join(folderName, 'src', 'index.js'));
    zCopy(path.join(srcFolder, 'src', 'style.css'), path.join(folderName, 'src', 'style.css'));
}

function zSockServer(srcFolder, dstFolder, name) {
    const files = [
        '/.gitignore',
        '/ecosystem.config.js',
        '/package.json',
        '/README.md',
        '/tsconfig.json',
        '/webpack.config.js',
        '/src/index.ts',
        '/src/@types/net.d.ts',
        '/src/app/appClient.ts',
        '/src/app/appDb.ts',
        '/src/core/wsClients.ts',
        '/src/core/wsServer.ts',
        '/src/db/dbConfig.ts'
    ];
    files.forEach(value => zCopy(path.normalize(srcFolder + value), path.normalize(dstFolder + value), 'proj_name', name))
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
