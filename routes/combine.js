const express = require('express')
const router = express.Router()
const readline = require('readline')
const fs = require('fs')
const path =  require('path')
const multer = require('multer')
const upload = multer({dest:'./temp/'})
const os = require('os')
const { formatTime,getClientIp } = require('../utils')

function resolve(dir) {
  return path.join(__dirname,dir)
}

router.post('/',upload.array('uploadFile'),(req,res,next) => {

  let ip = getClientIp(req)
  console.log(ip)

  const files = req.files
  const outputType = req.body.fileType

  let csvList = []
  let jsList = []

  let totalList = []
  let filterList = undefined  // 去重数组

  let name = undefined  // 输出文件名
  let time = formatTime()  // 输出时间 作输出名用
  

  files.forEach((file,index) => {
    if(index === 0) {
      name = file.originalname.slice(0,7)
    }
    const originalname = file.originalname
    console.log(originalname)
    const readPath = file.path
    const readStream = fs.createReadStream(readPath)
    const type = originalname.slice(originalname.indexOf('.')+1,originalname.length)

    switch(type) {
      case 'js':{
        let oldPath = file.path
        let newPath = resolve(`../temp/${file.originalname}`)
        fs.renameSync(oldPath,newPath) // 修改文件名
        let keys = require(newPath)
        jsList = jsList.concat(keys.keys)
        break;
      }
      case 'csv' : {
        let reg = new RegExp("\r\n", "g")
        let formatArray = fs.readFileSync(readPath).toString().split(reg)  // csv转数组
        csvList = csvList.concat(formatArray)
        break;
      }
      default:{
        let reg = new RegExp("\r\n", "g")
        let formatArray = fs.readFileSync(readPath).toString().split(reg)  // csv转数组
        csvList = csvList.concat(formatArray)
        break;
      }
    }

  })

  const writePath = resolve(`../files/combine/${time}.${outputType}`)
  const writeStream = fs.createWriteStream(writePath)

  
  totalList = totalList.concat(csvList,jsList)
  const reg = new RegExp(/^[a-zA-Z0-9_-\s\.\+\$\(\)\[\]\:\@\/\'\?\%\,\&]*$/)
  filterList = totalList.filter((item,index,array) => reg.test(item) && array.indexOf(item) === index)

  switch(outputType) {
    case 'js':{
      writeStream.write('exports.keys='+JSON.stringify(filterList,'','\t'),err => {
        if(!err) {
          res.send('ok')
        }
      })
      break;
    }
    case 'csv' : {
      filterList.forEach(item => {
        writeStream.write(item + os.EOL)
      })
      res.send('ok')
      break;
    }
    default:{}
  }
})


module.exports = router