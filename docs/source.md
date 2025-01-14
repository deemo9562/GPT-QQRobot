# 源码部署教程
## 前提
- 已经安装好了Node.js和npm
## 1. 下载源码并解压，cd到目录
## 2. 安装依赖
```bash
npm install
```
## 3. 配置
### 3.1
在项目的根目录下创建`.env`文件，内容如下：
```.env
WS_URL=ws://改成你配置的URL
# 如果你在国内需要用代理，请取消下面一行的注释并修改为你的代理地址
#PROXY=http://代理地址:端口
# 如果你在国内，并且不方便使用代理，可以取消下一行的注释，使用第三方的接口（本人不对第三方API的安全性负责）
#API_BASE_PATH=第三方api地址
# 配置上下文长度限制和回答消耗token数限制，如果需要请取消注释
#DEFAULT_MAX_PROMPTS=整数（默认为600）
#DEFAULT_MAX_TOKENS=整数（默认为400）
```
查看目前已收集的第三方api地址 [查看](./api.md)  
其中，`WS_URL`是你go-cqhttp配置的ws通讯的URL。  
如果go-cqhttp用的推荐，且cq和本项目部署在同一台主机上那么，`WS_URL=ws://127.0.0.1:8080` 
### 3.2
在项目根目录下创建`config/api_keys.txt`文件，输入你的OpenAI API Key，一行一个（支持多个API Key，失败了会自动切换为下一个）。
## 4. 启动
第一次启动用
```bash
npm start
```
或者先
```bash
npm run build
```
之后启动可以直接
```bash
npm run start:prod
```