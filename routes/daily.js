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
const superAgent = require('superagent')
const path = require('path')

const utils = require('../utils/index')
const dailyTrendsList = []  // 数组对象存储 
const dailyTrendsObj = {} // json对象存储
const dailyRelatedList = []  // 数组对象存储
const url = 'http://info.squeener.com/api/queries'




router.get('/',(req,res,next) => {
  res.render('daily/daily')
})


router.post('/',(req,res,next) => {
  let readTimes = 0  // 读取次数
  let successTimes = 0 // 成功次数
  let failureTimes = 0  // 失败次数
  let totalTimes = 0  // 总共需要读取的次数
  let flag = 0 // 检测是否所有日期读完

  let beginDate = req.body.beginDate  // 开始日期
  let endDate = req.body.endDate  // 结束日期
  let fileType = req.body.fileType

  const outputDaily = utils.pathResolve(`../outputFiles/daily/${beginDate}~${endDate}.${fileType}`)  // 可修改
  const dailyWriteStream = fs.createWriteStream(outputDaily)


    // 可分2个文件
  // const outputRelated = utils.pathResolve(`../outputFiles/related/${beginDate}~${endDate}-related.csv`) // 可修改
  // const relatedWriteStream = fs.createWriteStream(outputRelated)


  

  // 根据日期修改来获取对应 query
  utils.getRangeDate(beginDate,endDate)
    .then(dateArray => {
        dateArray.forEach((date,dateIndex) => {
          utils.getDailyTrends(date,'US')
          .then(response => {
            response = JSON.parse(response)
            const searchDays = response.default.trendingSearchesDays
            totalTimes += searchDays[0].trendingSearches.length
            
    
            // 遍历日期
            searchDays.forEach((day,dayIndex,daySelf) => {
              day.trendingSearches.forEach((searches) => {
                readTimes++
                dailyTrendsList.push(searches.title.query)
                
                const relatedQueries = searches.relatedQueries
                totalTimes += relatedQueries.length

    
                relatedQueries.forEach((query) => {
                  readTimes++
                  dailyTrendsList.push(query.query)
                })

                console.log('read:'+readTimes)
                console.log('total:'+totalTimes)
                if(readTimes === totalTimes ) {
                  flag++
                  console.log(date+'读完'+flag)
                  if(flag === dateArray.length) {
                    console.log('全部读完')
                  }
                  switch(fileType) {
                    case 'js' :{
                      dailyTrendsList.forEach(item => {
                        dailyWriteStream.write(JSON.stringify(item) + os.EOL)  // 输出的js文件一定要加入 exports.keys = {} 前缀
                      })
                      break;
                    }
                    case 'csv': {
                      dailyTrendsList.forEach(item => {
                        dailyWriteStream.write(item + os.EOL)
                      })
                      break;
                    }
                    default: {
                      dailyTrendsList.forEach(item => {
                        dailyWriteStream.write(item + os.EOL)
                      })
                    }
                  }
                }
              })
            })
          }).catch(e => {
            console.log(e)
            readTimes++
            console.log('获取当前日期趋势词报错')
          })

        })


    }).catch(e => {
      console.log(e)
      console.log('日期函数报错')
    })
})








module.exports = {
  router:router,
  dailyTrendsList:dailyTrendsList
}




