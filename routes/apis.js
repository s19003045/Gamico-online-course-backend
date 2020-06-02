// import router module
const express = require('express')
const router = express.Router()

router.get('/', (req, res) => {
  return res.json('this is apis')
})

module.exports = router