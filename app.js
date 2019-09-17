const express = require('express')
const app = express()
const ejs = require('ejs')
const bodyParser = require('body-parser')  // 处理post请求
const path = require('path')




app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


const dailyTrends = require('./routes/dailyTrends')
// const fileRelatedQueries = require('./routes/fileRelatedQueries')
// const relatedQueries = require('./routes/relatedQueries')


app.use('/daily',dailyTrends.router)
// app.use('/fileRelated',fileRelatedQueries.router)
// app.use('/related',relatedQueries.router)




app.set('views',path.join(__dirname,'views'))
app.engine('.html',ejs.__express)
app.set('view engine','html')





app.listen(3000,() => {
  console.log('port 3000')
})