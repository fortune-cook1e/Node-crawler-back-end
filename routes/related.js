const express = require('express')
const router = express.Router()
const superAgent = require('superagent')
const fs = require('fs')
const os = require('os')
const path = require('path')
const readline = require('readline')
const multer = require('multer')
const upload = multer({dest:'./temp/'})


const url = 'http://info.squeener.com/api/queries'

let fileList = []
let queryList = []
let readTimes = 0
let successTimes = 0
let failureTimes = 0
let totalTimes = 0

function pathResolve(dir) {
  return path.join(__dirname,dir)
}


router.get('/',(req,res,next) => {
  res.render('related/related')
})

/** 
 * @description 上传多个文件 来获取相关词
 * @description 可选择输出文件的格式 暂定为 csv、js
*/

router.post('/',upload.array('relatedFiles'),(req,res,next) => {
  
    const outputFileType = req.body.fileType  // 输入文件类型
    req.files.forEach((file,index,self) => {

      const fileLength = self.length  // 获取文件总数
      const readPath = file.path   // 上传文件路径
      const readStream = fs.createReadStream(readPath)
      const type = file.originalname.slice(file.originalname.indexOf('.')+1,file.originalname.length) // 获取当前file文件类型
      const fileName = file.originalname.slice(0,file.originalname.indexOf('.'))  // 文件名设置为 .js/.csv之前的名
      
      const writePath = pathResolve(`../outputFiles/related/${fileName}.${outputFileType}`)
      const writeStream = fs.createWriteStream(writePath)

      let oldPath = file.path
      let newPath = path.join(__dirname,'../temp/',file.originalname)
      fs.renameSync(oldPath,newPath) // 修改文件名

      switch(type) {
        case 'js' :{
          let keys = require(newPath)
          fileList = keys.keys
          break;
        }
        case 'csv' : {
          const rl = readline.createInterface({
            input:readStream
          })
          rl.on('line',line => {
            fileList.push(line)
          })
          rl.on('close',line => {
            console.log('文件读取完毕，开始获取related')
          })
          break;
        }
        default:{
          let keys = require(newPath)
          fileList = keys.keys
          break;
        }
      }
      
      fileList.forEach((item,i,arr) => {
        superAgent.get(url+'?keyword='+item)
          .then(response => {
             response = JSON.parse(response.text)
            if(response.default) {
              let list = response.default.rankedList[0].rankedKeyword
              totalTimes += list.length
              list.forEach(item => {
                readTimes++
                successTimes++
                queryList.push(item.query)
              })
            }
            if(readTimes === totalTimes) {
              console.log(file.originalname+'读完')
              switch(fileType) {
                case 'js' :{
                  queryList.forEach(item => {
                    writeStream.write(JSON.stringify(item) + os.EOL)  // 输出的js文件一定要加入 exports.keys = {} 前缀
                  })
                  break;
                }
                case 'csv': {
                  queryList.forEach(item => {
                    writeStream.write(item + os.EOL)
                  })
                  break;
                }
                default: {
                  queryList.forEach(item => {
                    writeStream.write(item + os.EOL)
                  })
                }
              }
            }
          }).catch(e => {
            readTimes++
            failureTimes++
            if(readTimes === totalTimes) {
              switch(fileType) {
                case 'js' :{
                  queryList.forEach(item => {
                    writeStream.write(JSON.stringify(item) + os.EOL)  // 输出的js文件一定要加入 exports.keys = {} 前缀
                  })
                  break;
                }
                case 'csv': {
                  queryList.forEach(item => {
                    writeStream.write(item + os.EOL)
                  })
                  break;
                }
                default: {
                  queryList.forEach(item => {
                    writeStream.write(item + os.EOL)
                  })
                }
              }
            }
          })
      })

    })
})





module.exports = {
  router:router
}