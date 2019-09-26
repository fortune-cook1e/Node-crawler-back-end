# Node-crawler-back-end

爬取Google Trends 数据，前端项目为 [**Vue-crawler-front-end**](https://github.com/gl767077147/Vue-crawler-front-end)

## Getting Started

```javascrit
yarn or npm install
```

## Dependencies

```json
"body-parser": "^1.19.0",  // 处理post请求
"dayjs": "^1.8.16",       // 格式化日期
"ejs": "^2.7.1",          // 支持.html模板
"express": "^4.17.1",     // node框架
"google-trends-api": "^4.9.0",  // 爬取数据的api
"iconv-lite": "^0.5.0",			// 解决中文乱码
"multer": "^1.4.2",       // 处理上传文件
"superagent": "^5.1.0"   // 请求
```
## Modules

### Daily

选择一段日期和国家，获取对应的 `Daily Trends`，输出的文件在 (Node项目) `files daily`

### Convert

将 `csv/js`格式文件转换为 `csv/js`格式文件，输出至 `files convert`

### Related

上传文件获取对应的`relatedQueries` ，输出至`related`

### Combine

合并多个csv/js格式文件，输出至`combine`

### Format

格式化搜狗词库，输出至`format`