const express = require('express')
const router = express.Router()
const fs = require('fs')
const os = require('os')
const path = require('path')
const multer = require('multer')
const upload = multer({dest:'./temp/'})
const readline = require('readline')
const superAgent = require('superagent')
const url = 'http://info.squeener.com/api/queries'


function resolve(dir){
  return path.join(__dirname,dir)
}

router.get('/',(req,res,next) => {
  res.render('singleRelated/single')
})


router.post('/',upload.single('relatedFiles'),(req,res,next) => {
  let wordsList = []
  let queryList = []
  let filterList = undefined
  let readTimes = 0;
  let totalTimes = 0;

  const file = req.file
  const readPath = file.path
  const readStream = fs.createReadStream(readPath)
  const type = file.originalname.slice(file.originalname.indexOf('.')+1,file.originalname.length) // 获取当前file文件类型
  const fileName = file.originalname.slice(0,file.originalname.indexOf('.'))  // 文件名设置为 .js/.csv之前的名
  const writePath = resolve(`../outputFiles/related/${file.originalname}`)
  const writeStream = fs.createWriteStream(writePath) 

  const oldPath = file.path
  let newPath = path.join(__dirname,'../temp/',file.originalname)
  if(!fs.existsSync(newPath)) {
    fs.renameSync(oldPath,newPath) // 修改文件名
  }

  let keys = require(newPath)
  wordsList = keys.keys
  totalTimes = wordsList.length

  wordsList.forEach(item => {
    superAgent.get(url+'?keyword='+item)
        .then(response => {
          readTimes++
          console.log(readTimes,totalTimes)
          if(response.default) {
            let list = response.default.rankedList[0].rankedKeyword
            totalTimes += list.length
            list.forEach(item => {
              queryList.push(item.query)
            })
          }
          if(readTimes === totalTimes) {
            console.log("文件写完 准备输出")
            filterList = queryList.filter((ele,index,self) => self.indexOf(ele) === index) // 数组去重
            writeStream.write('exports.keys='+JSON.stringify(filterList,'','\t'))
            res.end()
          }

        })
        .catch(e => {
          readTimes++
          console.log(e)
          console.log(readTimes,totalTimes)
          if(readTimes === totalTimes) {
            console.log("文件写完 准备输出")
            filterList = queryList.filter((ele,index,self) => self.indexOf(ele) === index) // 数组去重
            writeStream.write('exports.keys='+JSON.stringify(filterList,'','\t'))
            res.end()
          }
        })
  })

})


module.exports = router