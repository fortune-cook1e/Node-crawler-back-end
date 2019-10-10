const googleTrends = require('google-trends-api')
const path = require('path')
const superAgent = require('superagent')


const url = 'http://info.squeener.com/api/queries'


/**
 * @description 获取相关关键词
 * @param {*} list 待遍历的关键词
 * @returns
 */
function getRelatedQueries(list) {
  return new Promise((resolve,reject) => {
    list.forEach(item => {
      superAgent.get(url+'?keyword='+item)
        .then(res => {
          resolve(res)
        }).catch(e => {
          reject(e)
        })
      // googleTrends.relatedQueries({keyword:item})
      //   .then(res => {
      //     resolve(res)
      //   }).catch(e => {
      //     reject(e)
      //   })
    })
  })
}

Date.prototype.format = function(){
  let s = ''
  let month = (this.getMonth()+1) >= 10 ? (this.getMonth() + 1):('0'+(this.getMonth()+1))
  let day = this.getDate() >= 10 ? this.getDate() : ('0'+this.getDate())
  s += this.getFullYear() + '-'
  s += month +'-'
  s += day
  return (s)
}

/**
 *
 * @description 返回2个日期之间的所有日期
 * @param {*} begin 开始日期
 * @param {*} end 结束日期
 * @returns
 */
function getRangeDate(begin,end){
  return new Promise((resolve,reject) => {
    try {
      let arr = []
      console.log(begin,end)
      let ab = begin.split('-')
      let ae = end.split('-')
    
      let db = new Date()
    
      db.setUTCFullYear(ab[0],ab[1]-1,ab[2])
    
      let de = new Date()
      de.setUTCFullYear(ae[0],ae[1]-1,ae[2])
    
      let unixDb = db.getTime() - 24 * 60 * 60 * 1000
      let unixDe = de.getTime() - 24 * 60 * 60 * 1000
      for(let i =  unixDb ; i <= unixDe;) {
        i = i + 24 * 60 * 60 * 1000
        arr.push((new Date(parseInt(i))).format())
      }
      resolve(arr)
    } catch(e) {
      reject(e)
    }
  })
}


/**
 * @description 输出文件
 * @param {*} outputFileType 导出类型
 * @param {*} list          待导出的数据
 * @param {*} writeStream   写入流
 * @param {*} res           res（必须为响应response对象）
 */
function outputFile(outputFileType,list,writeStream,res) {
  if(outputFileType === undefined) return
  switch(outputFileType) {
    case 'csv':{
      list.forEach(item => {
        writeStream.write(item)
      })
      res.send('ok')
      break;
    }
    case 'js' : {
      writeStream.write('exports.keys = ' + JSON.stringify(list,'','\t'))
      res.send('ok')
      break;
    }
    default : {
      list.forEach(item => {
        writeStream.write(item)
      })
      res.send('ok')
    }
  }
}

/**
 * @description 生成一个格式化时间
 * @returns 返回时间字符串
 */
function formatTime() {
  let date = new Date()
  let timeStr = undefined

  let year = date.getFullYear()
  let month = date.getMonth() + 1
  let day = date.getDate()
  let hour = date.getHours()
  let minute = date.getMinutes()
  let second = date.getSeconds()

  timeStr = `${year}~${month}~${day}~${hour}~${minute}~${second}`
  return timeStr
}




module.exports = {
  getRelatedQueries,
  getRangeDate,
  outputFile,
  formatTime
}