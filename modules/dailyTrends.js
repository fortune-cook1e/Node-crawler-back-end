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

const utils = require('../utils/index')
const dailyTrendsList = []  // 数组对象存储 
const dailyTrendsObj = {} // json对象存储
const dailyRelatedList = []  // 数组对象存储
const url = 'http://info.squeener.com/api/queries'


const outputDaily = utils.pathResolve('../outputFiles/daily/8.1~8.31.csv')  // 可修改
const dailyWriteStream = fs.createWriteStream(outputDaily)

const outputRelated = utils.pathResolve('../outputFiles/related/8.1~8.31-related.csv') // 可修改
const relatedWriteStream = fs.createWriteStream(outputRelated)



router.get('/',(req,res,next) => {
  let readTimes = 0
  let successTimes = 0
  let failureTimes = 0
  let totalTimes = undefined
  let totalLength = undefined


  // 根据日期修改来获取对应 query
  utils.getRangeDate('2019-08-01','2019-08-31')
    .then(dateArray => {
        dateArray.forEach(date => {
          utils.getDailyTrends(date,'US')
          .then(response => {
            response = JSON.parse(response)
            const searchDays = response.default.trendingSearchesDays
            totalLength += searchDays[0].trendingSearches.length
            
    
            // 遍历日期
            searchDays.forEach((day,index,self) => {
              day.trendingSearches.forEach((searches,index,self) => {
    
                dailyTrendsList.push(searches.title.query)
                dailyWriteStream.write(searches.title.query + os.EOL)
                
                const relatedQueries = searches.relatedQueries
                totalLength += relatedQueries.length
    
                relatedQueries.forEach((query,index,self) => {
                  dailyTrendsList.push(query.query)
                  dailyWriteStream.write(query.query + os.EOL)
                })
              })
            })
           
            
            // 获取daily相关词
            totalTimes = dailyTrendsList.length
            console.log('一共有:'+totalTimes+'个item')
            dailyTrendsList.forEach(item => {
              superAgent.get(url+'?keyword='+item)
                .then(res => {
                  readTimes++
                  successTimes++
                  console.log('read:'+readTimes)
                  console.log('total:'+totalTimes)
                  const response = JSON.parse(res.text)
                  if(response.default) {
                    let list = response.default.rankedList[0].rankedKeyword
                    list.forEach(item => {
                      // console.log(item.query)
                      dailyRelatedList.push(item.query)
                      relatedWriteStream.write(item.query + os.EOL)
                    })
                  }
                  //检测是否读完
                  // if(readTimes === totalTimes) {
                  //   console.log('文件获取数据完毕')
                  //   console.log('成功条目数为:'+successTimes)
                  //   console.log('失败条目总数为:'+failureTimes)
                  // }
                }).catch(e => {
                  readTimes++
                  failureTimes++
                  console.log('read:'+readTimes)
                  console.log('total:'+totalTimes)
                  // if(readTimes === totalTimes) {
                  //   console.log('文件获取数据完毕')
                  //   console.log('成功条目数为:'+successTimes)
                  //   console.log('失败条目总数为:'+failureTimes)
                  // }
                })
            })
              
              // res.send(response)
          }).catch(e => {
            console.log(e)
            console.log('获取当前日期趋势词报错')
          })
        })

    }).catch(e => {
      console.log('日期函数报错')
    })
})





module.exports = {
  router:router,
  dailyTrendsList:dailyTrendsList
}




