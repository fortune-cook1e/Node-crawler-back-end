const translate = require('google-translate-api')
const express = require('express')
const router = express.Router()
const path = require('path')
const readline = require('readline')
const fs = require('fs')
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
    const writePath = resolve(`../files/translate/${originalname}.csv`)

    txtList = fs.readFileSync(readPath)  // 读文件
    txtList = iconv.decode(txtList,'gbk')  // 解决中文乱码问题
    txtList = txtList.toString().split('\n')  // 转数组

    txtList = txtList.map(item => {
      return item.replace(/[^\u4e00-\u9fa5|,]+/,'').replace(',','')
    })

    translate('Ik spreek Engels', {to: 'en'}).then(res => {
      console.log(res.text);
      //=> I speak English
      console.log(res.from.language.iso);
      //=> nl
  }).catch(err => {
      console.error(err);
  });
    let readTimes = 0
    let totalTimes = txtList.length
  //  txtList.forEach(word => {
  //    translate(word,{to:'en'})
  //     .then(res => {
  //       console.log(res)
  //       readTimes++
  //       console.log(readTimes,totalTimes)
  //       transList.push(res.text)
  //       if(readTimes === totalTimes) {
  //         console.log(文件读完)
  //         res.send(JSON.stringify(transList))
  //       }
  //     }).catch(e => {
  //       readTimes++
  //       console.log(e)
  //       console.log(readTimes,totalTimes)
  //       if(readTimes === totalTimes) {
  //         console.log(文件读完)
  //         res.send(JSON.stringify(transList))
  //       }
  //     })
  //  })


  })

  
})


module.exports = router