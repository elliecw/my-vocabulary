const express = require('express')
const session = require('express-session')
const usePassport = require('./config/passport')
const passport = require('passport')
const exphbs = require('express-handlebars')
const methodOverride = require('method-override')
const bcrypt = require('bcryptjs')
const axios = require('axios')
console.log(axios.isCancel('something'))
const app = express()
const PORT = 3000
const db = require('./models')
const Todo = db.Todo
const User = db.User

app.engine('hbs', exphbs.engine({ defaultLayout: 'main', extname: '.hbs' }))
app.set('view engine', 'hbs')

app.use(session({
  secret: 'ThisIsMySecret',
  resave: false,
  saveUninitialized: true
}))

app.use(express.urlencoded({ extended: true }))
app.use(methodOverride('_method'))

// 呼叫 Passport 函式並傳入 app，這條要寫在路由之前
usePassport(app)

// app.get('/', (req, res) => {
//   res.render('index')
// })

app.get('/', (req, res) => {
  return Word.findAll({
    raw: true,
    nest: true
  })
    .then((words) => { return res.render('index', { words: words }) })
    .catch((error) => { return res.status(422).json(error) })
})

app.post('/search', (req, res) => {
  axios.get(`https://www.dictionaryapi.com/api/v3/references/learners/json/${req.body.search}?key=007f4dd9-fc97-4813-982a-a0af85861fb0`)
    .then((result) => {
      const vocabularyId = result.data[0].meta.id.split(":")[0] // [ 'drizzle', '1' ]
      const vocabularyFl = result.data[0].meta['app-shortdef'].fl
      const vocabularyDef = result.data[0].shortdef
      console.log(vocabularyId, vocabularyFl, vocabularyDef)
      return res.render('search', { vocabularyId, vocabularyFl, vocabularyDef })
    })
})

app.post('/list', (req, res) => {
  res.render('list')
})

app.get('/users/login', (req, res) => {
  res.render('login')
})

app.post('/users/login', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/users/login'
}))

app.get('/users/register', (req, res) => {
  res.render('register')
})

app.post('/users/register', (req, res) => {
  const { name, email, password, confirmPassword } = req.body
  User.findOne({ where: { email } }).then(user => {
    if (user) {
      console.log('User already exists')
      return res.render('register', {
        name,
        email,
        password,
        confirmPassword
      })
    }
    return bcrypt
      .genSalt(10)
      .then(salt => bcrypt.hash(password, salt))
      .then(hash => User.create({
        name,
        email,
        password: hash
      }))
      .then(() => res.redirect('/'))
      .catch(err => console.log(err))
  })
})

app.get('/users/logout', (req, res) => {
  req.logout()
  res.redirect('/users/login')
})

app.listen(PORT, () => {
  console.log(`App is running on http://localhost:${PORT}`)
})