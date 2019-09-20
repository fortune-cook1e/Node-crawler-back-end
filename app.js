const express = require('express')
const app = express()
const ejs = require('ejs')
const bodyParser = require('body-parser')  // 处理post请求
const path = require('path')





app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


const daily = require('./routes/daily')
const convert = require('./routes/convert')
// const related = require('./routes/related')
const related2 = require('./routes/related2')


app.use('/daily',daily.router)  // 爬取一段日期内数据
app.use('/convert',convert.router)  // 转换csv格式为js文件
// app.use('/related',related.router) // 获取相关词
app.use('/related2',related2.router)

app.get('/',(req,res,next) => {
  res.redirect('/daily')
})


app.set('views',path.join(__dirname,'views'))
app.engine('.html',ejs.__express)
app.set('view engine','html')





app.listen(3000,() => {
  console.log('port 3000')
})