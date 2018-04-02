# egg-neditor-demo

## 在egg.js中使用 neditor，图片和文件上传到阿里云OSS

## 关于 neditor

Neditor 是notadd团队基于 Ueditor 的一款富文本编辑器，基于百度Ueditor。

感谢[Notadd](https://www.notadd.com)


## 关于egg.js

阿里开源的企业级node.js开发框架，详见 [egg docs][egg]



### 准备工作：阿里oss帐号 ###

新建bucket（权限为公共读）;创建 accesskey，填写到配置文件 `config.default.js`中


### 编译安装

```bash
$ npm i
$ npm run dev
$ open http://localhost:3001/
```

### Deploy

```bash
$ npm start
$ npm stop
```

### npm scripts

- Use `npm run lint` to check code style.
- Use `npm test` to run unit test.
- Use `npm run autod` to auto detect dependencies upgrade, see [autod](https://www.npmjs.com/package/autod) for more detail.


## 相关链接 

Neditor github 地址：[https://github.com/notadd/neditor](https://github.com/notadd/neditor "Neditor github 地址")

Ueditor 官网：[http://ueditor.baidu.com](http://ueditor.baidu.com "ueditor 官网")

Ueditor API 文档：[http://ueditor.baidu.com/doc](http://ueditor.baidu.com/doc "ueditor API 文档")

Ueditor github 地址：[http://github.com/fex-team/ueditor](http://github.com/fex-team/ueditor "ueditor github 地址")


