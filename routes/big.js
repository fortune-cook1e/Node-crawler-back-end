const express = require('express')
const router = express.Router()
const fs = require('fs')
const os = require('os')
const path = require('path')
const multer = require('multer')
const upload = multer({dest:'./temp/'})
const readline = require('readline')
const superAgent = require('superagent')
const google = require('google-trends-api')
const url = 'http://info.squeener.com/api/queries'

const keys = require('../keys/inkeys')

let wordsList = keys.keys
let readTimes = 0
let totalTimes = wordsList.length
let queryList = []
let filterList = undefined
function resolve(dir) {
  return path.join(__dirname,'../outputFiles/related/','big.js')
}



router.get('/',(req,res,next) => {
  const writePath = resolve()
  const writeStream = fs.createWriteStream(writePath)
  console.log('开始啦')
  // wordsList.forEach(item => {
  //   google.relatedQueries({keyword:item})
  //     .then(response => {
  //       readTimes++
  //       console.log(item)
  //       console.log(readTimes,totalTimes)
  //       if(response.default) {
  //         let list = response.default.rankedList[0].rankedKeyword
  //         list.forEach(item => {
  //           queryList.push(item.query)
  //         })
  //       }
  //       if(readTimes === totalTimes) {
  //         console.log("文件写完 准备输出")
  //         filterList = queryList.filter((ele,index,self) => self.indexOf(ele) === index) // 数组去重
  //         writeStream.write('exports.keys='+JSON.stringify(filterList,'','\t'))
  //       }
  //     }).catch(e => {
  //       readTimes++
  //       console.log('失败:'+item)
  //       console.log(readTimes,totalTimes)
  //       if(readTimes === totalTimes) {
  //         console.log("文件写完 准备输出")
  //         filterList = queryList.filter((ele,index,self) => self.indexOf(ele) === index) // 数组去重
  //         writeStream.write('exports.keys='+JSON.stringify(filterList,'','\t'))
  //       }
  //     })
  // })



  wordsList.forEach(item => {
    superAgent.get(url+'?keyword='+item)
      .then(response => {
        readTimes++
        console.log(item)
        console.log(readTimes,totalTimes)
        if(response.default) {
          let list = response.default.rankedList[0].rankedKeyword
          list.forEach(item => {
            queryList.push(item.query)
          })
        }
        if(readTimes === totalTimes) {
          console.log("文件写完 准备输出")
          filterList = queryList.filter((ele,index,self) => self.indexOf(ele) === index) // 数组去重
          writeStream.write('exports.keys='+JSON.stringify(filterList,'','\t'))
        }
      }).catch(e => {
        readTimes++
        console.log('失败:'+item)
        console.log(readTimes,totalTimes)
        if(readTimes === totalTimes) {
          console.log("文件写完 准备输出")
          filterList = queryList.filter((ele,index,self) => self.indexOf(ele) === index) // 数组去重
          writeStream.write('exports.keys='+JSON.stringify(filterList,'','\t'))
        }
      })
  })
})


module.exports = router