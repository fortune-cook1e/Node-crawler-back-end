const googleTrends = require('google-trends-api')
const path = require('path')
const superAgent = require('superagent')


const url = 'http://info.squeener.com/api/queries'

/**
 * @description 获取对应日期的Trends
 * @param {*} time 时间
 * @param {*} country 国家
 * @returns 
 */
function getDailyTrends(time,country) {
  return new Promise((resolve,reject) => {
    googleTrends.dailyTrends({
      trendDate:time || undefined,  // 格式为 new Date('2019-09-10)
      geo:country || undefined   // 国家名
    },(err,results) => {
      if(err) {
        reject(err)
      } else {
        resolve(results)
      }
    })
  })
}

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

function pathResolve(dir) {
  return path.join(__dirname,dir)
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

async function _fetch(url) {
  const options = {
    method:'POST',
    url:url,
    headers:{
      'Connection': 'keep-alive',
      'Accept-Encoding': '',
      'Accept-Language': 'en-US,en;q=0.8'
    }
  }
  return fetch(options)
}





module.exports = {
  getDailyTrends:getDailyTrends,
  getRelatedQueries:getRelatedQueries,
  pathResolve:pathResolve,
  getRangeDate:getRangeDate
}