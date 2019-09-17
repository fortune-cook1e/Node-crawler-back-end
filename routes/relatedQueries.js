const express = require('express')
const router = express.Router()
const superAgent = require('superagent')
const fs = require('fs')
const os = require('os')
const utils = require('../utils/index')

const inKeys = require('../keys/inkeys')
const usKeys = require('../keys/uskeys')

const relatedPath = utils.pathResolve('../outputFiles/related/usCsv.csv')   // 可修改
const relatedWriteStream = fs.createWriteStream(relatedPath)

const url = 'http://info.squeener.com/api/queries'

const keysList = usKeys.keys
let queryList = []

let readTimes = 0
let successTimes = 0
let failureTimes = 0
let total = 0

router.get('/',(req,res,next) => {

  total += keysList.length
  keysList.forEach(key => {
    superAgent.get(url+'?keyword='+key)
      .then(res => {
          readTimes++
          successTimes++
          console.log('成功key:'+key)
          console.log('read:'+readTimes)
          console.log('total:'+total)
          const response = JSON.parse(res.text)
          if(response.default) {
            let list = response.default.rankedList[0].rankedKeyword
            list.forEach(item => {
              queryList.push(item.query)
              relatedWriteStream.write(item.query + os.EOL)
            })
          }
          //检测是否读完
          if(readTimes === total) {
            console.log('文件获取数据完毕')
            console.log('成功条目数为:'+successTimes)
            console.log('失败条目总数为:'+failureTimes)
          }
      }).catch(e => {
        readTimes++
        failureTimes++
        console.log('失败key:'+key)
        console.log('read:'+readTimes)
        console.log('total:'+total)
        if(readTimes === total) {
          console.log('文件获取数据完毕')
          console.log('成功条目数为:'+successTimes)
          console.log('失败条目总数为:'+failureTimes)
        }
      })
  })
  res.send(123)
})


module.exports = {
  router:router
}