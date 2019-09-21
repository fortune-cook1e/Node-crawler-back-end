const googleTrends = require('google-trends-api')
const fs = require('fs')
const os = require('os')
const path = require('path')
const readline = require('readline')
const superAgent = require('superagent')

function resolve(dir) {
  return path.join(__dirname,dir)
}
const url = 'http://info.squeener.com/api/queries'
const read = resolve('./uskeys.csv')
const write1 = resolve('./uskeys.js')

const readStream = fs.createReadStream(read)
const writeStream1 = fs.createWriteStream(write1)
// const writeStream2 = fs.createWriteStream(write2)

const rl = readline.createInterface({
  input:readStream,
})

const dicArray = []
const queryList = []

rl.on('line',line => {
  dicArray.push(line)
  // writeStream1.write(line + os.EOL)
})

rl.on('close',line => {
  const length = dicArray.length
  let times = 0
  dicArray.forEach(dic => {
    superAgent.get(url+'?keyword='+dic)
    .then(res => {
      times++
      const response = JSON.parse(res.text)
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
        writeStream1.write('exports.keys='+JSON.stringify(queryList,'','\t'),err =>{
          if(!err) console.log('文件写完')
        })
      }
    }).catch(e => {
        times++
        console.log('失败:'+times,length)
        console.log(e)

        if(times === length) {
          console.log('写完')
          writeStream1.write('exports.keys='+JSON.stringify(queryList,'','\t'),err =>{
            if(!err) console.log('文件写完')
          })
        }
    })
  })
})


