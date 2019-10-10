const express = require('express')
const app = express()
const ejs = require('ejs')
const bodyParser = require('body-parser')  // 处理post请求
const path = require('path')
const router = require('./routes/')





app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


// 允许跨域
app.all('*',function(req,res,next) {
  res.header('Access-Control-Allow-Origin','*')
  res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild');
  res.header('Access-Control-Allow-Methods','PUT,POST,GET,DELETE,OPTIONS')
  if(req.method == 'OPTIONS') {
    res.sendStatus(200)
  } else {
    next()
  }
})

app.use('/daily',router.daily)    // 按照日期获取实时趋势
app.use('/convert',router.convert)  // csv、js格式文件互转
app.use('/combine',router.combine)   // 合并csv或js格式文件
app.use('/related',router.related)  // 获取relatedQueries
app.use('/format',router.format)    // 格式化搜狗词库
app.use('/static',router.static)   // 手动修改路径来获取relatedQueries  针对数据量多的文件




app.get('/',(req,res,next) => {
  res.redirect('/daily')
})


app.set('views',path.join(__dirname,'views'))
app.engine('.html',ejs.__express)
app.set('view engine','html')





app.listen(3000,() => {
  console.log('port 3000')
})