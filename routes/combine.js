const express = require('express')
const router = express.Router()
const readline = require('readline')
const fs = require('fs')
const path =  require('path')
const multer = require('multer')
const upload = multer({dest:'./temp/'})
const os = require('os')

function resolve(dir) {
  return path.join(__dirname,dir)
}

router.post('/',upload.array('uploadFile'),(req,res,next) => {
  const files = req.files
  const outputType = req.body.fileType

  let csvList = []
  let jsList = []

  let totalList = []

  let name = undefined  // 输出文件名
  

  files.forEach((file,index) => {
    if(index === 0) {
      name = file.originalname.slice(0,5)
    }
    const originalname = file.originalname
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
        let formatArray = fs.readFileSync(readPath).toString().split('\n')  // csv转数组
        csvList = csvList.concat(formatArray)
        break;
      }
      default:{}
    }

  })

  const writePath = resolve(`../files/combine/${name}.combine.${outputType}`)
  const writeStream = fs.createWriteStream(writePath)
  totalList = totalList.concat(csvList,jsList)

  switch(outputType) {
    case 'js':{
      writeStream.write('exports.keys='+JSON.stringify(totalList,'','\t'),err => {
        if(!err) {
          res.send('ok')
        }
      })
      break;
    }
    case 'csv' : {
      totalList.forEach(item => {
        writeStream.write(item)
      })
      res.send('ok')
      break;
    }
    default:{}
  }
})


module.exports = router