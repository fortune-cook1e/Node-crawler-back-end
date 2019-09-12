const express = require('express')
const app = express()

const utils = require('./utils/index')

let dailyTrendsList = undefined
let string = undefined
utils.getDailyTrends().then(res => {
  dailyTrendsList = JSON.parse(res)
  console.log(typeof dailyTrendsList)
}).catch(e => {
  console.log(e)
})


app.get('/',(req,res,next) => {
  string = dailyTrendsList.default.trendingSearchesDays[0].trendingSearches
  string.forEach((item,index) => {
    if(index === 0) {
      res.send(JSON.stringify(item))
    }
  })
  // res.send(string)
})

app.listen(3000,() => {
  console.log('port 3000')
})