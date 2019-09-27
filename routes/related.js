const express = require('express')
const router = express.Router()
const multer = require('multer')
const upload = multer({dest:'./temp/'})
const fs = require('fs')
const os = require('os')
const path = require('path')
const readline = require('readline')
const superAgent = require('superagent')
const googleTrends = require('google-trends-api')

function resolve(dir) {
  return path.join(__dirname,dir)
}

const url = 'http://info.squeener.com/api/queries'

router.get('/',(req,res,next) => {
  res.render('related/related')
})


router.post('/',upload.array('uploadFile'),(req,res,next) => {

  const outputFileType = req.body.fileType  // 输出文件类型

  const files = req.files  // 上传文件
  const filesLength = files.length  // 文件总数
  let fileFlag = 0  // 用于检验全部文件是否读完
  console.log('开始获取')
  
  files.forEach(file => {

    let fileList = []  
    let queryList = []
    let filterList = undefined

    const readPath = file.path  // 文件上传路径
    const readStream = fs.createReadStream(readPath)
    const originalname = file.originalname
    const fileName = originalname.slice(0,originalname.indexOf('.'))
    
    const type = originalname.slice(originalname.indexOf('.')+1,originalname.length) // 上传文件类型

    let oldPath = file.path
    let newPath = resolve(`../temp/${file.originalname}`)
    if(!fs.existsSync(newPath)) {
      fs.renameSync(oldPath,newPath) // 修改文件名
    }

    switch(type) {
      case 'js' : {
        let keys = require(newPath)
        fileList = keys.keys
        getRelated(fileList,fileName)
        break;
      }
      case 'csv' : {
       const rl = readline.createInterface({
         input:readStream
       }) 
       rl.on('line',line => {
         fileList.push(line)
       })
       rl.on('close',line => {
         console.log(fileName+"读取完，开始获取related")
         getRelated(fileList,fileName)
       })
       break;
      }
    }

    /**
     * @description 获取relatedQueries
     * @param {*} fileList 词汇list
     * @param {*} name 文件名
     */
    function getRelated(fileList,name) {
      let readTimes = 0 
      let totalTimes = fileList.length // 词汇总量
      
      const writePath = resolve(`../files/related/${name}~related.${outputFileType}`)
      const writeStream = fs.createWriteStream(writePath)


      // 遍历数组获取related
      fileList.forEach(item => {
        // superAgent.get(url+'?keyword='+item)
          googleTrends.relatedQueries({keyword:item})
              .then(response => {
                // readTimes++ // 读完一个单词就 readTimes ++ 直到与 totalTimes相同
                // console.log(readTimes,totalTimes)
                // response = JSON.parse(response)  // 如果用的是 google 则去掉 .text
                // if(response.default) {
                //   let list = response.default.rankedList[0].rankedKeyword
                //   list.forEach(item => {
                //     queryList.push(item.query)
                //   })
                // }
                try {
                  readTimes++ // 读完一个单词就 readTimes ++ 直到与 totalTimes相同
                console.log(readTimes,totalTimes)
                response = JSON.parse(response)  // 如果用的是 google 则去掉 .text
                if(response.default) {
                  let list = response.default.rankedList[0].rankedKeyword
                  list.forEach(item => {
                    queryList.push(item.query)
                  })
                }

                } catch(e) {
                  console.log(e)
                }
                // console.log(readTimes,totalTimes)
                
                // 如果 readTimes === totalTimes ，则一个单词读完
                if(readTimes === totalTimes) {
                  fileFlag++ // 如果一个文件读完 fileFlag++，直到与 filesLength相同
                  console.log(name+' 文件读完,fileFlag'+fileFlag,filesLength,'开始输出文件')
                  filterList = queryList.filter((ele,index,self) => self.indexOf(ele) === index) // 数组去重
                  switch(outputFileType) {
                    case 'js' : {
                      writeStream.write('exports.keys='+JSON.stringify(filterList,'','\t'))
                      break;
                    }
                    case 'csv': {
                      console.log(filterList)
                      filterList.forEach(item => {
                        writeStream.write(item + os.EOL)
                      })
                      break;
                    }
                    default : {
                      filterList.forEach(item => {
                        writeStream.write(item + os.EOL)
                      })
                    }
                  }
                  if(fileFlag === filesLength) {
                    res.send('ok')
                  }
                }

              }).catch(e => {
                readTimes++
                console.log(readTimes,totalTimes)
                console.log(e)
                // 如果 readTimes === totalTimes ，则一个单词读完
                if(readTimes === totalTimes) {
                  fileFlag++ // 如果一个文件读完 fileFlag++，直到与 filesLength相同
                  console.log(name+' 文件读完,fileFlag'+fileFlag,filesLength,'开始输出文件')
                  filterList = queryList.filter((ele,index,self) => self.indexOf(ele) === index) // 数组去重
                  switch(outputFileType) {
                    case 'js' : {
                      writeStream.write('exports.keys='+JSON.stringify(filterList,'','\t'))
                      break;
                    }
                    case 'csv': {
                      console.log(filterList)
                      filterList.forEach(item => {
                        writeStream.write(item + os.EOL)
                      })
                      break;
                    }
                    default : {
                      filterList.forEach(item => {
                        writeStream.write(item + os.EOL)
                      })
                    }
                  }
                  if(fileFlag === filesLength) {
                    res.send('ok')
                  }
                }
              })
      })      

    }

  })
  
})



module.exports = router