'use strict';
const path = require('path')

module.exports = appInfo => {
  const config = exports = {};

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1522511079700_2770';

  // add your config here
  config.middleware = [
    
  ];

  config.static = {
    prefix: '/public/', 
    dir: path.join(appInfo.baseDir, '/app/public')
  }

  config.view = {
    defaultViewEngine: 'nunjucks',
    root: path.join(appInfo.baseDir, 'app/view'),
    mapping: {
      '.html': 'nunjucks',
    },
  };

  // 关闭 csrf 
  config.security = {
    csrf: {
      enable: false,
    }
  }

  // 让 bodyParser 支持解析text类型的参数
  config.bodyParser = {
    enableTypes:['json','form','text'],
    extendTypes: {
      json: ['application/x-javascript'],
      text: ['text/xml'] 
    }
  };

  exports.multipart = {
    fileSize: '50mb',
  };

  config.oss = {
    client: {
      accessKeyId: process.env.ALI_SDK_OSS_ID || '',
      accessKeySecret: process.env.ALI_SDK_OSS_SECRET || '',
      bucket: process.env.ALI_SDK_OSS_BUCKET || '',
      region: process.env.ALI_SDK_OSS_REGION || '',
    },
  };


  return config;
};
