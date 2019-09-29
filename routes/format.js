const express = require('express')
const router = express.Router()
const path = require('path')
const readline = require('readline')
const fs = require('fs')
const os = require('os')
const multer = require('multer')
const upload = multer({dest:'./temp/'})
const iconv = require('iconv-lite')



function resolve(dir) {
  return path.join(__dirname,dir)
}


router.post('/',upload.array('uploadFiles'),(req,res,next) => {
  
  const files = req.files
  const formatType = req.body.formatType

  files.forEach(file => {
    
    let txtList = undefined
    let originalname = file.originalname
    const readPath = file.path
    const writePath = resolve(`../files/format/format~${formatType}~${originalname}`)
    const writeStream = fs.createWriteStream(writePath)
    txtList = fs.readFileSync(readPath)  // 读文件
    if(formatType === 'sougou') {
      txtList = iconv.decode(txtList,'gbk')  // 解决中文乱码问题
    }
    txtList = txtList.toString().split('\n')  // 转数组


    switch(formatType) {
      case 'sougou': {
        txtList = txtList.map(item => {
          return item.replace(/[^\u4e00-\u9fa5|,]+/,'').replace(',','') // 将非中文字段转换为空
        }) 
    
        txtList.forEach(item => {
          writeStream.write(item)
        })
        break;
      }
      case 'amazon':{
        console.log(txtList)
        txtList = txtList.map(item => {
          return item.split(/\t/)[0].replace(/[\u4e00-\u9fa5]/g,'')
        })
        txtList.forEach(item => {
          writeStream.write(item + os.EOL)
        })
        break;
      }
      case 'scientific' : {
        txtList.splice(0,1) // 删除第一项
        txtList = txtList.map(item => {
          return item.split(',')[1]
        })
        txtList.forEach(item => {
          writeStream.write(item + os.EOL)
        })
        break;
      }
    }

  })
  res.send('ok')

})


module.exports = router