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

const utils = require('../utils/index')
const dailyTrendsList = []


utils.getDailyTrends()
      .then(res => {
        res = JSON.parse(res)
        console.log(res.default)
      })


      module.exports = dailyTrendsList




