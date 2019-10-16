/*
 * @Author: GaoLiang 
 * @Date: 2019-10-16 10:09:50 
 * @Last Modified by: GaoLiang
 * @Last Modified time: 2019-10-16 11:40:47
 */


const express = require('express')
const router = express.Router()
const XLSX = require('xlsx')
const { openDownloadDialog,sheet2blob } = require('../utils/export')


router.get('/',(req,res,next) => {
  res.render('export/index.html')
})

router.post('/',(req,res,next) => {
  let arrayData  = [
    ['name', 'age'],
    ['zhangsan', 20],
    ['lisi', 21],
    ['wangwu', 22],
    ['zhaoliu', 23],
    ['sunqi', 24],
  ];
  
  
  // 将数据转成workSheet
let arrayWorkSheet = XLSX.utils.aoa_to_sheet(arrayData);
// console.log(arrayWorkSheet);
// console.log(jsonWorkSheet);
// 构造workBook
let workBook = {
  SheetNames: ['arrayWorkSheet'],
  Sheets: {
    'arrayWorkSheet': arrayWorkSheet,
  }
};
// 将workBook写入文件
XLSX.writeFile(workBook, "./aa.xlsx");
  res.send('ok')
})


module.exports = router
 