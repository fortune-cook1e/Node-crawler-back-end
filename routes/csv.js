const express = require('express')
const router = express.Router()
const readline = require('readline')
const fs = require('fs')
const os = require('os')
const multer = require('multer')
const upload = multer({dest:'./temp/'})
const path = require('path')

function resolve(dir) {
  return path.join(__dirname,dir)
}

router.get('/',(req,res,next) => {
  res.render('csv/csv')
})

router.post('/',upload.single('file'),(req,res,next) => {
  let list = []
  let newList = undefined
  const file = req.file
  const readPath = file.path
  const fileName = file.originalname.slice(0,file.originalname.indexOf('.'))  // 文件名设置为 .js/.csv之前的名
  const readStream = fs.createReadStream(readPath)
  const writePath = resolve(`../files/csvs/${fileName}.csv`)
  const writeStream = fs.createWriteStream(writePath)

  const rl = readline.createInterface({
    input:readStream
  })
  rl.on('line',line => {
    list.push(line)
  })
  rl.on('close',line => {
    newList = list.slice(1,list.length-1)
    newList = newList.map(item => {
      return item.replace(/\"/g,'')
    })
    newList = newList.map(item => {
      return item.replace(/,/g,'')
    })
    newList.forEach(item => {
      writeStream.write(item + os.EOL)
    })
  })

})


module.exports = router


