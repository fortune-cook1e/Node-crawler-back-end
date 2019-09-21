const express = require('express')
const router = express.Router()
const multer = require('multer')
const upload = multer({dest:'./temp/'})
var multipart = require('connect-multiparty');  
var multipartMiddleware = multipart(); 



router.get('/',(req,res,next) => {
  res.render('related/related')
})


router.post('/',multipartMiddleware,(req,res,next) => {
  console.log(req.body)
})



module.exports = router