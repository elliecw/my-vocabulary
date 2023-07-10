const express = require('express')
const router = express.Router()

const db = require('../../models')
const Word = db.Word

router.post('/list', (req, res) => {
  // UserId to be updated
  const UserId = req.user.id
  const name = req.body.name
  const fl = req.body.fl
  const def = req.body.def
  
  return Word.create({ name, fl, def, UserId }).then((word) => {
    res.render('list', { name: word.name, fl: word.fl, def: word.def, UserId })
  })
})

module.exports = router