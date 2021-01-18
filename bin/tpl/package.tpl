{
  "name": "proj_name",
  "version": "1.0.0",
  "description": "根据zweb模板自动化创建的工程",
  "private": true,
  "scripts": {
    "build": "webpack --config webpack.prod.js",
    "watch": "webpack --config webpack.prod.js --watch",
    "start": "webpack-dev-server --config webpack.dev.js --open"
  },
  "keywords": [],
  "author": "proj_name",
  "license": "ISC",
  "dependencies": {
    "@babel/core": "^7.9.6",
    "@babel/plugin-transform-runtime": "^7.9.6",
    "@babel/preset-env": "^7.9.6",
    "babel-loader": "^8.1.0",
    "clean-webpack-plugin": "^3.0.0",
    "css-loader": "^3.5.3",
    "html-webpack-plugin": "^4.5.0",
    "style-loader": "^1.2.1",
    "uglifyjs-webpack-plugin": "^2.2.0",
    "webpack": "^4.43.0",
    "webpack-cli": "^3.3.11",
    "webpack-dev-server": "^3.11.0",
    "webpack-merge": "^4.2.2"
  }
}
