'use strict';
const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const sendToWormhole = require('stream-wormhole');
const uuid = require('uuid/v1');

module.exports = app => {
  class NeditorController extends app.Controller {
    async configUrl() {
      this.ctx.set('Content-Type', 'application/javascript; charset=utf-8')
      this.ctx.body = fs.createReadStream('./app/public/neditor/config.json');
    }

    /**
     * 图片上传
     * 返回示例：
     * {
        "state": "SUCCESS",
        "url": "/neditor/php/upload/image/20180331/1522471499976492.jpg",
        "title": "1522471499976492.jpg",
        "original": "QQ图片20180126102935.jpg",
        "type": ".jpg",
        "size": 67075
      }

      失败 state = 'FAIL'
     */
    async uploadimage() {
      const ctx = this.ctx;
      const parts = ctx.multipart();
      let part;
      const fileSize = '@!0';
      let fileDir = ctx.query.path || 'dev';
      let size = 0;
      while ((part = await parts()) != null) {
        if (part.length) {
          //arrays are busboy fields
          console.log('field: ' + part[0]);
          console.log('value: ' + part[1]);
          console.log('valueTruncated: ' + part[2]);
          console.log('fieldnameTruncated: ' + part[3]);
          if(part[0] === 'size'){
            size = part[1];
          }
        } else {
          if (!part.filename) {
            // user click `upload` before choose a file,
            // `part` will be file stream, but `part.filename` is empty
            // must handler this, such as log error.
            ctx.body = {
              "state": 'FAIL',
              "error": 'filename is required'
            };
            return;
          }
          // otherwise, it's a stream
          console.log('field: ' + part.fieldname);
          console.log('filename: ' + part.filename);
          console.log('encoding: ' + part.encoding);
          console.log('mime: ' + part.mime);
          let result;
          try {
            // 获取文件后缀
            let suffix = path.extname(part.filename) || '';
            let fname = uuid().replace(/-/g, '');
            let filePath = `${fileDir}/${fname}${suffix}`;
            result = await app.oss.put(filePath, part);
            console.log('oss upload success');
            

            // let response = {
            //   "success": true,
            //   "msg": "",
            //   "file_path": result.url.replace('bto-dev.oss-cn-hangzhou.aliyuncs.com','files.bto-dev.utoper.com') + fileSize
            // }
            let response = {
              "state": "SUCCESS",
              "url": result.url,
              "title": fname + suffix,
              "original": part.filename,
              "type": suffix,
              "size": size
            }
            ctx.body = response;
          } catch (err) {
            // 必须将上传的文件流消费掉，要不然浏览器响应会卡死
            await sendToWormhole(part);
            console.log('oss upload failed');
            //throw err;
            ctx.body = {
              "state": 'FAIL',
              "error": err.message
            };
          }
          
          //console.log(result);
        }
      }
    }

    /**
     * 涂鸦上传
     * 返回示例：
     * {
        "state": "SUCCESS",
        "url": "/neditor/php/upload/image/20180331/1522471614499949.png",
        "title": "1522471614499949.png",
        "original": "scrawl.png",
        "type": ".png",
        "size": 5492
      }
     */
    async uploadscrawl() {
      const ctx = this.ctx;
      //console.log(ctx.request.body);
      if( !ctx.request.body.upfile ){
        ctx.body = {
          "state": 'FAIL',
          "error": 'scrawl is empty'
        };
        return;
      }
      let fileDir = ctx.query.path || 'dev';
      let upfile = ctx.request.body.upfile;
      let dataBuffer = new Buffer(upfile, 'base64');
      let suffix = '.png';
      let fname = 'scrawl_' + uuid().replace(/-/g, '');
      let filePath = `${fileDir}/${fname}${suffix}`;
      var result = await app.oss.put(filePath, dataBuffer, {mime: 'application/x-png'});
      console.log('oss upload success');
      //console.log(result);
      let response = {
        "state": "SUCCESS",
        "url": result.url,
        "title": fname + suffix,
        "original": 'scrawl.png',
        "type": suffix,
        "size": 0
      }
      ctx.body = response;
    }

    /**
     * 图片列表
     * 参数： query：
     *  start:60
        size:20
     * 返回示例：
     * {
        "state": "SUCCESS",
        "list": [
          {
            "url": "/neditor/php/upload/image/20171220/1513741091277469.jpg",
            "mtime": 1513741091
          },
          {
            "url": "/neditor/php/upload/image/20171220/1513767967580685.png",
            "mtime": 1513767967
          },
        ],
        "start": "0",
        "total": 2061
      }
     */
    async listimage() {
      const ctx = this.ctx;
      console.log(ctx.query);
      const size = ctx.query.size || 20;
      const start = ctx.query.size || 0;
      try {
        let list = await app.oss.list({
          'prefix': 'dev/',
          'max-keys': size
        });
        console.log(list);
        let result = {
          "state": "SUCCESS",
          "list": _.map(list.objects,function(item){
            return {
              "url": item.url,
              "mtime": parseInt( (new Date(item.lastModified)).getTime() / 1000 ) 
            }
          }),
          "start": start,
          "total": 20
        }
        ctx.body = result;
      } catch (error) {
        console.log(error);
        ctx.body = {
          "state": 'FAIL',
          "error": error.message
        };
        return;
      }
    }

    /**
     * 列出文件
     * 参数： query：
     *  start:60
        size:20
     * 返回示例：
     * {
        "state": "SUCCESS",
        "list": [
          {
            "url": "/neditor/php/upload/image/20171220/1513741091277469.jpg",
            "mtime": 1513741091
          },
          {
            "url": "/neditor/php/upload/image/20171220/1513767967580685.png",
            "mtime": 1513767967
          },
        ],
        "start": "0",
        "total": 2061
      }
     */
    async listfile() {
      const ctx = this.ctx;
      console.log(ctx.query);
      const size = ctx.query.size || 20;
      const start = ctx.query.size || 0;
      try {
        let list = await app.oss.list({
          'prefix': 'dev/',
          'max-keys': size
        });
        console.log(list);
        let result = {
          "state": "SUCCESS",
          "list": _.map(list.objects,function(item){
            return {
              "url": item.url,
              "mtime": parseInt( (new Date(item.lastModified)).getTime() / 1000 ) 
            }
          }),
          "start": start,
          "total": 20
        }
        ctx.body = result;
      } catch (error) {
        console.log(error);
        ctx.body = {
          "state": 'FAIL',
          "error": error.message
        };
        return;
      }
    }

    /**
     * 上传视频
     * 返回示例：
     * {
      "state": "SUCCESS",
      "url": "/neditor/php/upload/video/20180331/1522472062768407.mp4",
      "title": "1522472062768407.mp4",
      "original": "big_buck_bunny.mp4",
      "type": ".mp4",
      "size": 5510872
    }
     */
    async uploadvideo() {
      const ctx = this.ctx;
      const parts = ctx.multipart();
      let part;
      let fileDir = ctx.query.path || 'dev';
      let size = 0;
      while ((part = await parts()) != null) {
        if (part.length) {
          //arrays are busboy fields
          console.log('field: ' + part[0]);
          console.log('value: ' + part[1]);
          console.log('valueTruncated: ' + part[2]);
          console.log('fieldnameTruncated: ' + part[3]);
          if(part[0] === 'size'){
            size = part[1];
          }
        } else {
          if (!part.filename) {
            // user click `upload` before choose a file,
            // `part` will be file stream, but `part.filename` is empty
            // must handler this, such as log error.
            ctx.body = {
              "state": 'FAIL',
              "error": 'filename is required'
            };
            return;
          }
          // otherwise, it's a stream
          console.log('field: ' + part.fieldname);
          console.log('filename: ' + part.filename);
          console.log('encoding: ' + part.encoding);
          console.log('mime: ' + part.mime);
          let result;
          try {
            // 获取文件后缀
            let suffix = path.extname(part.filename) || '';
            let fname = uuid().replace(/-/g, '');
            let filePath = `${fileDir}/${fname}${suffix}`;
            result = await app.oss.put(filePath, part, { timeout: 60 * 60 * 1000 });
            console.log('oss upload success');
            

            // let response = {
            //   "success": true,
            //   "msg": "",
            //   "file_path": result.url.replace('bto-dev.oss-cn-hangzhou.aliyuncs.com','files.bto-dev.utoper.com') + fileSize
            // }
            let response = {
              "state": "SUCCESS",
              "url": result.url,
              "title": fname + suffix,
              "original": part.filename,
              "type": suffix,
              "size": size
            }
            ctx.body = response;
          } catch (err) {
            // 必须将上传的文件流消费掉，要不然浏览器响应会卡死
            await sendToWormhole(part);
            console.log('oss upload failed');
            console.log(err);
            //throw err;
            ctx.body = {
              "state": 'FAIL',
              "error": err.message
            };
          }
          
          //console.log(result);
        }
      }
    }

    /**
     * 上传附件
     * 返回示例：
     * {
      "state": "SUCCESS",
      "url": "/neditor/php/upload/file/20180331/1522472172681053.txt",
      "title": "1522472172681053.txt",
      "original": "前端学习.txt",
      "type": ".txt",
      "size": 377
    }
     */
    async uploadfile() {
      const ctx = this.ctx;
      const parts = ctx.multipart();
      let part;
      let fileDir = ctx.query.path || 'dev';
      let size = 0;
      while ((part = await parts()) != null) {
        if (part.length) {
          //arrays are busboy fields
          console.log('field: ' + part[0]);
          console.log('value: ' + part[1]);
          console.log('valueTruncated: ' + part[2]);
          console.log('fieldnameTruncated: ' + part[3]);
          if(part[0] === 'size'){
            size = part[1];
          }
        } else {
          if (!part.filename) {
            // user click `upload` before choose a file,
            // `part` will be file stream, but `part.filename` is empty
            // must handler this, such as log error.
            ctx.body = {
              "state": 'FAIL',
              "error": 'filename is required'
            };
            return;
          }
          // otherwise, it's a stream
          console.log('field: ' + part.fieldname);
          console.log('filename: ' + part.filename);
          console.log('encoding: ' + part.encoding);
          console.log('mime: ' + part.mime);
          let result;
          try {
            // 获取文件后缀
            let suffix = path.extname(part.filename) || '';
            let fname = uuid().replace(/-/g, '');
            let filePath = `${fileDir}/${fname}${suffix}`;
            result = await app.oss.put(filePath, part, { timeout: 60 * 60 * 1000 });
            console.log('oss upload success');
            

            // let response = {
            //   "success": true,
            //   "msg": "",
            //   "file_path": result.url.replace('bto-dev.oss-cn-hangzhou.aliyuncs.com','files.bto-dev.utoper.com') + fileSize
            // }
            let response = {
              "state": "SUCCESS",
              "url": result.url,
              "title": fname + suffix,
              "original": part.filename,
              "type": suffix,
              "size": size
            }
            ctx.body = response;
          } catch (err) {
            // 必须将上传的文件流消费掉，要不然浏览器响应会卡死
            await sendToWormhole(part);
            console.log('oss upload failed');
            console.log(err);
            //throw err;
            ctx.body = {
              "state": 'FAIL',
              "error": err.message
            };
          }
          
          //console.log(result);
        }
      }
    }

    /**
     * 抓取远程图片
     * 返回示例：
     * {
      "state": "SUCCESS",
      
    }
     */
    async catchimage() {
      const ctx = this.ctx;
      ctx.body = 'hi'
    }
    
  }

  return NeditorController;
};
