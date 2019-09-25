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
  files.forEach(file => {
    
    let txtList = undefined
    let transList = undefined

    let originalname = file.originalname
    const readPath = file.path
    const readStream = fs.createReadStream(readPath)
    const writePath = resolve(`../files/format/format~${originalname}`)
    const writeStream = fs.createWriteStream(writePath)

    txtList = fs.readFileSync(readPath)  // 读文件
    txtList = iconv.decode(txtList,'gbk')  // 解决中文乱码问题
    txtList = txtList.toString().split('\n')  // 转数组

    txtList = txtList.map(item => {
      return item.replace(/[^\u4e00-\u9fa5|,]+/,'').replace(',','')
    })

    txtList.forEach(item => {
      writeStream.write(item)
    })
  })

  res.send('ok')

  
})


module.exports = router