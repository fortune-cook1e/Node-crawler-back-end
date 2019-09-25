const express = require('express')
const router = express.Router()
const multer = require('multer')
const upload = multer({dest:'./temp/'})
const fs = require('fs')
const os = require('os')
const readline = require('readline')
const path = require('path')

function resolve(dir) {
  return path.join(__dirname,dir)
}

router.post('/',upload.array('uploadFiles'),(req,res,next) => {

  const files = req.files
  const ouputType = req.body.type
  let fileFlag = 0
  let length = files.length
  
  files.forEach(file => {
    
    fileFlag++   
    let list = undefined
    const readPath = file.path
    const originalname = file.originalname // 文件名 附带格式
    const name = originalname.slice(0,originalname.indexOf('.'))  // 文件名 不附带格式
    const type = originalname.slice(originalname.indexOf('.')+1,originalname.length)  // 获取上传文件的格式
    const writePath = resolve(`../files/convert/${name}~convert.${ouputType}`)
    const writeStream = fs.createWriteStream(writePath)
    
    switch(type) {
      case 'js' : {
        let oldPath = readPath
        let newPath = resolve(`../temp/${name}.js`)
        fs.renameSync(oldPath,newPath)
        let keys = require(newPath)
        list = keys.keys
        break;
      }
      case 'csv' : { 
        let reg = new RegExp("\r\n", "g")
        list = fs.readFileSync(readPath).toString().split(reg)
        break;
      }
    }

    switch(ouputType) {
      case 'js' : {
        writeStream.write('exports.keys = '+JSON.stringify(list,'','\t'),err => {
          if(!err) {}
        })
        if(fileFlag === length) {
          console.log('全部文件转换完')
          res.send('ok')
        }
        break;
      }
      case 'csv' : {
        list.forEach(item => {
          writeStream.write(item + os.EOL)
        })
        if(fileFlag === length) {
          console.log('全部文件转换完')
          res.send('ok')
        }
        break;
      }
    }

  })


})

module.exports = router