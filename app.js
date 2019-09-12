const express = require('express')
const app = express()

const dailyTrends = require('./modules/dailyTrends')



app.listen(3000,() => {
  console.log('port 3000')
})