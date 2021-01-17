#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function main() {

    // 如果参数不为3个，那么提示使用方法
    if (process.argv.length !== 3) {
        console.log('zweb命令语法（abc为你想要创建的项目名称）：\n    zweb abc');
        return ;
    }

    // 创建目录
    let name = process.argv[2];
    let folderName = path.join(process.cwd(), name);
    console.log('开始创建目录！', folderName);

    // 创建目录
    if (fs.existsSync(folderName)) {
        console.warn('项目创建失败：当前路径下已经存在名为', name, '的文件或文件夹！');
        return ;
    }
    fs.mkdirSync(folderName);
    fs.mkdirSync(path.join(folderName, 'src'));

    // 写入文件
    let srcFolder = path.join(path.parse(process.argv[1]).dir, 'tpl');
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

// 复制指定目录下的文件
function zCopy(srcPath, dstPath, replaceString = '', toString = '') {
    try {
        let data = fs.readFileSync(srcPath, 'utf-8');
        if (replaceString) {
            data = data.replace(RegExp(replaceString, 'g'), toString);
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
