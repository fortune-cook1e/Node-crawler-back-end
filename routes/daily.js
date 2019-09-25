 /**
  * dailyTrendsApi 返回的数据结构如下
  * {
      default : [Object]{
        trendingSearchesDays : [Array]   
          [0] : [Object]{
            date : String
            formattedDate: String
            trendingSearches : [Array]{
              [0] : [Object] //First trending result
            }
          [1] : [Object]{
            date : String
            formattedDate: String
            trendingSearches : [Array]{
              [0] : [Object] //first trending result
              ...
              [19] : [Object] //20th trending result
            }
          }
        }
        endDateForNextRequest : String,
        rssFeedPageUrl : String,
      }
      }
  * 
  */

/**
 * @description 获取google daily trends
 * @description  有效数据 -> default.trendingSearchesDays[0].trendingSearches.title.query    trendingSearches.relatedQueries[0].query
 * @description trendingSearchesDays、relatedQueries为数组需要进行遍历，
 */

const express = require('express')
const router = express.Router()
const fs = require('fs')
const os = require('os')
const googleTrends = require('google-trends-api')

const utils = require('../utils/index')





router.get('/',(req,res,next) => {
  res.render('daily/daily')
})


router.post('/',(req,res,next) => {
  let readTimes = 0  // 读取次数
  let totalTimes = 0  // 总共需要读取的次数
  let flag = 0 // 检测是否所有日期读完
  const list = []  // 数组对象存储 
  let filterList = undefined


  req.body.date = req.body.date.map(time => {
    return time.slice(0,time.indexOf('T'))
  })
  let beginDate = req.body.date[0]
  let endDate = req.body.date[1]
  let fileType = req.body.fileType
  const country = req.body.country

  const outputDaily = utils.pathResolve(`../files/daily/${beginDate}~${endDate}~${country}.${fileType}`)  // 可修改
  const dailyWriteStream = fs.createWriteStream(outputDaily)


  // googleTrends.dailyTrends({
  //   trendDate: new Date('2019-07-01'),
  //   geo: 'US',
  // }, function(err, results) {
  //   if (err) {
  //     console.log(err);
  //   }else{
  //     console.log(results);
  //   }
  // });


    // 可分2个文件
  // const outputRelated = utils.pathResolve(`../outputFiles/related/${beginDate}~${endDate}-related.csv`) // 可修改
  // const relatedWriteStream = fs.createWriteStream(outputRelated)
utils.getRangeDate(beginDate,endDate)
      .then(dateList => {
        dateList.forEach(date => {
          googleTrends.dailyTrends({
            trendDate:new Date(date),
            geo: country,
          },(err,response) => {
            if(err) {
              console.log(err)
              console.log('dailyTrends 报错')
            } else {

              response = JSON.parse(response)
              if(response.default.trendingSearchesDays[0]) {
                if(response.default.trendingSearchesDays[0].trendingSearches){
                  const { trendingSearchesDays } = response.default
                  const { trendingSearches } = trendingSearchesDays[0]
                  totalTimes += trendingSearches.length  // 基础query长度
                  trendingSearches.forEach(search => {
                    readTimes++
                    list.push(search.title.query)
                    const { relatedQueries } = search
                    totalTimes += relatedQueries.length // relatedQueries长度
                    relatedQueries.forEach(query => {
                      readTimes++
                      list.push(query.query)
                    })
                  })
                }
              }
              
              if(readTimes === totalTimes) {
                flag++ // 加入flag 是为了检测 所有日期是否读完；添加完一个日期的所有数据 则flag++
                console.log(date+'读完,开始去重'+flag)
                if(flag === dateList.length) {
                  filterList = list.filter((ele,index,self) => self.indexOf(ele) === index) // 数组去重
                  switch(fileType) {
                    case 'csv' : 
                      filterList.forEach(item => {
                        dailyWriteStream.write(item + os.EOL)
                        readyWriteStream.write(item + os.EOL)
                      })
                      console.log(32132131)
                      res.send('ok')
                      break;
                    case 'js':{
                      dailyWriteStream.write('exports.keys='+JSON.stringify(filterList,'','\t'))
                      res.send('ok')
                      break;
                     }
                    }
                  }
                }
            }
          })
        })
      }).catch(e => {
        console.log(e)
        console.log('日期函数报错')
      })
    })

module.exports = router
      
  












