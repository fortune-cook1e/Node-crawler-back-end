/**
 * @description 此模块用于读取 googleTrends 关键词相关词
 * @description 需要借助外来文件读取
 */


const fs = require('fs')
const os = require('os')
const utils = require('../utils/index')
const readline = require('readline')
const express = require('express')
const router = express.Router()
const superAgent = require('superagent')



const keysList = []
const queryList = []

let readTimes = 0
let successTimes = 0
let failureTimes = 0
let totalTimes = 0

const keysReadPath = utils.pathResolve('../keys/daily.csv') // 待读取的文件，可修改
const keysReadStream = fs.createReadStream(keysReadPath)

const keysWritePath = utils.pathResolve('../outputFiles/related/keys.csv')  // 输入文件 可修改
const keysWriteStream = fs.createWriteStream(keysWritePath)


const url = 'http://info.squeener.com/api/queries'

router.get('/',(req,res,next) => {


const rl = readline.createInterface({
  input:keysReadStream
})

  rl.on('line',line => {
    keysList.push(line)
  })
  
  rl.on('close',line => {

    totalTimes += keysList.length
    keysList.forEach(item => {
      superAgent.get(url+'?keyword='+item)
        .then(res => {
          readTimes++
          successTimes++
          const response = JSON.parse(res.text)
          if(response.default) {
            let list = response.default.rankedList[0].rankedKeyword
            list.forEach(item => {
              console.log(item.query)
              queryList.push(item.query)
              keysWriteStream.write(item.query + os.EOL)
            })
          }
          //检测是否读完
          if(readTimes === totalTimes) {
            console.log('文件获取数据完毕')
            console.log('成功条目数为:'+successTimes)
            console.log('失败条目总数为:'+failureTimes)
          }
        }).catch(e => {
          readTimes++
          failureTimes++
          if(readTimes === totalTimes) {
            console.log('文件获取数据完毕')
            console.log('成功条目数为:'+successTimes)
            console.log('失败条目总数为:'+failureTimes)
          }
        })
    })
  })
})

module.exports = {
  router:router
}