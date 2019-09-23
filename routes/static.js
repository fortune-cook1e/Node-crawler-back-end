const googleTrends = require('google-trends-api')
const fs = require('fs')
const os = require('os')
const path = require('path')
const readline = require('readline')
const superAgent = require('superagent')
const express = require('express')
const router = express.Router()
const net = require("net")

function resolve(dir) {
  return path.join(__dirname,dir)
}

const url = 'http://info.squeener.com/api/queries'

router.get('/',(req,res,next) => {
  res.render('static/static')
})

router.post('/',(req,res,next) => {

  const read = resolve('../files/csvs/inkeys.csv')
  const write = resolve('../files/static/inkeys.js')
  
  const readStream = fs.createReadStream(read)
  const writeStream = fs.createWriteStream(write)
  
  const rl = readline.createInterface({
    input:readStream,
  })
  
  const dicArray = []
  const queryList = []
  
  rl.on('line',line => {
    dicArray.push(line)
  })
  
  rl.on('close',line => {
    const length = dicArray.length
    let times = 0
    dicArray.forEach(dic => {
      // superAgent.get(url+'?keyword='+item)
      googleTrends.relatedQueries({keyword:dic})
      .then(response => {
        times++
        response = JSON.parse(response.text)
        if(response.default) {
          let list = response.default.rankedList[0].rankedKeyword
          list.forEach(item => {
            //  queryObj[item.query] = item.query
             queryList.push(item.query)
            })
        }
        console.log('成功:'+times,length)
        if(times === length) {
          console.log('写完')
          writeStream.write('exports.keys='+JSON.stringify(queryList,'','\t'),err =>{
            if(!err) console.log('文件写完')
          })
        }
      }).catch(e => {
          times++
          console.log('失败:'+times,length)
          console.log(e)
          if(times === length) {
            console.log('写完')
            writeStream.write('exports.keys='+JSON.stringify(queryList,'','\t'),err =>{
              if(!err) console.log('文件写完')
            })
          }
      })
    })
  })
})




module.exports = router