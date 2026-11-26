# TinyPro of vue

## 说明

此项目为 tiny-toolkit-pro 套件初始化的 TinyPro 的 Vue 项目。

## 快速上手

### 依赖安装

请选择任何一个你喜欢的包管理工具进行安装, 这里使用的`npm`

```bash
npm i
```

### 启动开发环境（含 Mock）

`npm start` 会同时启动 Mock 服务和前端开发服务，无需单独启动后端即可访问。

```bash
npm run start:mock
```

启动成功后访问：[http://localhost:3031/](http://localhost:3031/)

### 连接真实后端

若已启动 NestJS / Spring Boot 后端，可关闭 Mock，将接口代理到真实服务：

```bash
npm run dev:full
```

### 单独启动 Mock 服务

如需单独启动 Mock 服务：

```bash
npm run mock
```

## 目录结构

```bash
config              # 打包工具配置文件
public
src
  api               # Api 管理
  assets            # 静态资源
  components        # 公用组件
  config            # HWC 配置文件
  directive         # 指令
  hooks             # 可组合函数 https://cn.vuejs.org/guide/reusability/composables
  layout            # 布局组件
  locale            # 本地国际化词条 (例如登录页)
  mock              # mock服务
  router            # 路由
  store             # 全局状态
  types             # 通用类型
  utils             # 通用工具
  views             # 页面
    ...
```

## 二次开发指南

// WAITING FOR DOCUMENT DEPLOY
// SHOULD LINK TO tiny-pro-front-dev-guideline.md

## 遇到困难?

加官方小助手微信 opentiny-official，加入技术交流群
