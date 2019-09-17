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
  console.log(path.join(__dirname))
})


router.post('/',(req,res,next) => {
  let readTimes = 0  // 读取次数
  let successTimes = 0 // 成功次数
  let failureTimes = 0  // 失败次数
  let totalTimes = 0  // 总共需要读取的次数
  let totalLength = 0

  let beginDate = req.body.beginDate  // 开始日期
  let endDate = req.body.endDate  // 结束日期

  const outputDaily = utils.pathResolve(`../outputFiles/daily/${beginDate}~${endDate}.csv`)  // 可修改
  const dailyWriteStream = fs.createWriteStream(outputDaily)


    // 可分2个文件
  // const outputRelated = utils.pathResolve(`../outputFiles/related/${beginDate}~${endDate}-related.csv`) // 可修改
  // const relatedWriteStream = fs.createWriteStream(outputRelated)


  

  // 根据日期修改来获取对应 query
  utils.getRangeDate(beginDate,endDate)
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
            totalTimes += dailyTrendsList.length
            console.log('一共有:'+totalTimes+'个待查询相关关键词的item')
            dailyTrendsList.forEach(item => {
              superAgent.get(url+'?keyword='+item)
                .then(response => {
                  readTimes++
                  successTimes++
                  console.log('read:'+readTimes)
                  console.log('total:'+totalTimes)
                   response = JSON.parse(response.text)
                  if(response.default) {
                    let list = response.default.rankedList[0].rankedKeyword
                    list.forEach(item => {
                      // console.log(item.query)
                      dailyRelatedList.push(item.query)
                      // 修改这个stream 则可以得到2个文件
                      dailyWriteStream.write(item.query + os.EOL)
                    })
                  }
                  //检测是否读完
                  if(readTimes === totalTimes) {
                    console.log('文件获取数据完毕')
                    console.log('成功条目数为:'+successTimes)
                    console.log('失败条目总数为:'+failureTimes)
                    
                    // download 默认下载为最后一个
                    // 所以文件合并
                    const file = utils.pathResolve(`../outputFiles/daily/${beginDate}~${endDate}.csv`)
                    res.download(file)
                  }
                }).catch(e => {
                  readTimes++
                  failureTimes++
                  console.log('read:'+readTimes)
                  console.log('total:'+totalTimes)
                  if(readTimes === totalTimes) {
                    console.log('文件获取数据完毕')
                    console.log('成功条目数为:'+successTimes)
                    console.log('失败条目总数为:'+failureTimes)
                    // download 默认下载为最后一个
                    // 所以文件合并
                    const file = utils.pathResolve(`../outputFiles/daily/${beginDate}~${endDate}.csv`)
                    res.download(file)
                  }
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




