const express = require('express')
const router = express.Router()

const db = require('../../models')
const Word = db.Word
const User = db.User

router.get('/', (req, res) => {
  User.findByPk(req.user.id)
    .then((user) => {
      if (!user) throw new Error('user not found')

      return Word.findAll({
        raw: true,
        nest: true,
        where: { UserId: req.user.id }
      })
    })
    .then(words => res.render('index', { words }))
    .catch(error => console.error(error))
})

module.exports = router