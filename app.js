const express = require('express')
const app = express()


// const dailyTrends = require('./modules/dailyTrends')
// const fileRelatedQueries = require('./modules/fileRelatedQueries')
const relatedQueries = require('./modules/relatedQueries')


// app.use('/daily',dailyTrends.router)
// app.use('/fileRelated',fileRelatedQueries.router)
app.use('/related',relatedQueries.router)

app.listen(3000,() => {
  console.log('port 3000')
})