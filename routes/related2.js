/**
 * @description 此模块用户上传 csv或js格式文件 获取relatedQueries词汇 并且可选择导出格式
 */

const express = require('express')
const router = express.Router()
const path = require('path')
const fs = require('fs')
const os = require('os')
const multer = require('multer')
const upload = multer({dest:'./temp/'})
const readline = require('readline')
const superAgent = require('superagent')
const url = 'http://info.squeener.com/api/queries'



function resolvePath(dir){
  return path.join(__dirname,dir)
}

router.get('/',(req,res,next) => {
  res.render('related2/related2')
})

/**
 * @description 将每个文件的词添加到数组 filesList，然后使用superAgent 遍历每个单词并且获取relatedQueries
 * @description 将relatedQueries 添加到数组 queryList
 */

router.post('/',upload.array('relatedFiles'),(req,res,next) => {
  const outputFileType = req.body.fileType // 输出文件类型
  let filesLength = req.files.length // 获取文件总个数
  let allFlag = 0  // 用于检测全部文件是否读完

  // 处理files
  req.files.forEach((file,index) => {
    let filesList = []  
    let queryList = []
    const readPath = file.path  // 文件上传路径
    const readStream = fs.createReadStream(readPath)
    console.log('第'+index+'个文件')
    const type = file.originalname.slice(file.originalname.indexOf('.')+1,file.originalname.length) // 获取当前file文件类型
    const fileName = file.originalname.slice(0,file.originalname.indexOf('.'))  // 文件名设置为 .js/.csv之前的名
    
    // const writePath = resolvePath(`../outputFiles/related/${fileName}.${outputFileType}`)
    // const writeStream = fs.createWriteStream(writePath)

    let oldPath = file.path
    let newPath = path.join(__dirname,'../temp/',file.originalname)
    if(!fs.existsSync(newPath)) {
      fs.renameSync(oldPath,newPath) // 修改文件名
    }
    
    

    // 判断上传文件类型 处理 filesList
    switch(type) {
      case 'js' :{
        let keys = require(newPath)
        filesList = keys.keys
        getRelated(filesList,fileName)
        console.log('getRelated执行完')
        break;
      }
      case 'csv' : {
        const rl = readline.createInterface({
          input:readStream
        })
        rl.on('line',line => {
          filesList.push(line)
        })
        rl.on('close',line => {
          console.log(file.originalname+'读取完后，开始获取related')
          getRelated(filesList,fileName)
        })
        break;
      }
      // default :{
      //   const rl = readline.createInterface({
      //     input:readStream
      //   })
      //   rl.on('line',line => {
      //     filesList.push(line)
      //   })
      //   rl.on('close',line => {
      //     console.log(file.originalname+'读取完后，开始获取related')
      //     getRelated(filesList,writeStream,file.originalname)
      //   })
      // }
    }

      /**
   * @description 获取相关词
   * @param {*} fileList 待遍历的list
   * @param {*} stream  写入流
   * @param {*} fileName  文件名
   */
  function getRelated(fileList,fileName){
    let readTimes = 0
    let totalTimes = 0
    let fileFlag = 0 // 用于检测一个文件是否读完
    let listLength = fileList.length
    const writePath = resolvePath(`../outputFiles/related/${fileName}.${outputFileType}`)
    const writeStream = fs.createWriteStream(writePath)

    // 遍历集合
    fileList.forEach((item,index,self) => {
      superAgent.get(url+'?keyword='+item)
        .then(response => {
          response = JSON.parse(response.text)
          if(response.default) {
            let list = response.default.rankedList[0].rankedKeyword
            totalTimes += list.length
            list.forEach(item => {
              readTimes++
              console.log('read成功:'+readTimes)
              console.log('total:'+totalTimes)
              queryList.push(item.query)
            })
          }
          
          // 这里是为了得到 当前这个 词汇也就是 item 这一项是否全部添加完
          if(readTimes === totalTimes) {
            fileFlag++ // 如果一个单词读完 则 fileFlag ++ 一直+1 到与 list.length相同 ，相同则开始输出文件
            console.log('fileFlag:'+fileFlag,listLength)
            if(fileFlag === listLength) {
              allFlag++
              console.log('allFlag:'+allFlag,filesLength)
              if(allFlag === filesLength) {console.log('全部文件读完')}
              filterList = queryList.filter((ele,index,self) => self.indexOf(ele) === index) // 数组去重
              console.log(fileName+'的related获取完,')
              switch(outputFileType) {
                case 'js' : {
                  writeStream.write('exports.keys='+JSON.stringify(filterList,'','\t'))
                  break;
                }
                case 'csv': {
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
            }
          }
        }).catch(e => {
            fileFlag++
            console.log('fileFlag:'+fileFlag)
            if(fileFlag === listLength) {
              allFlag++
              if(allFlag === filesLength) {console.log('全部文件读完')}
              filterList = queryList.filter((ele,index,self) => self.indexOf(ele) === index) // 数组去重
              console.log(fileName+'的related获取完,')
              switch(outputFileType) {
                case 'js' : {
                  writeStream.write('exports.keys='+JSON.stringify(filterList,'','\t'))
                  break;
                }
                case 'csv': {
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
            }
        })
    })
  }
  })


})



module.exports = {
  router:router,
}