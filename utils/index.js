const googleTrends = require('google-trends-api')

const dailyTrendsList = []

function getDailyTrends() {
  return new Promise((resolve,reject) => {
    googleTrends.dailyTrends({
      trendDate:new Date('2019-09-10'),
      geo:'US'
    },(err,results) => {
      if(err) {
        reject(err)
      } else {
        resolve(results)
      }
    })
  })
}

module.exports = {
  getDailyTrends:getDailyTrends
}