const superAgent = require('superagent')
const express = require('express')
const app = express()
const googleTrends = require('google-trends-api')
const url = 'http://info.squeener.com/api/queries'
app.get('/',(req,res,next) => {
  googleTrends.dailyTrends({
    trendDate: new Date('2019-09-16'),
    geo: 'US',
  }, function(err, results) {
    if (err) {
      console.log(err);
    }else{
      res.send(JSON.parse(results))
    }
  });
})

app.listen(5000)
