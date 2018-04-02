'use strict';

module.exports = app => {
  // 默认路由
  app.get('/', 'home.index');

  // neditor 请求地址自定义：  http://fex.baidu.com/ueditor/#qa-customurl
  app.get('/neditor/config', 'neditor.configUrl'); // 获取配置
  app.post('/neditor/uploadimage', 'neditor.uploadimage'); // 上传图片
  app.post('/neditor/uploadscrawl', 'neditor.uploadscrawl'); // 上传涂鸦
  app.get('/neditor/listimage', 'neditor.listimage'); // 列出图片
  app.get('/neditor/listfile', 'neditor.listfile'); // 列出文件
  app.post('/neditor/uploadvideo', 'neditor.uploadvideo'); // 上传视频
  app.post('/neditor/uploadfile', 'neditor.uploadfile'); // 上传附件
  app.post('/neditor/catchimage', 'neditor.catchimage'); // 执行抓取远程图片 (最好关闭掉此功能)


};
