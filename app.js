const express = require('express')
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
app.use(express.urlencoded({ extended: true }))
app.use(methodOverride('_method'))

app.get('/', (req, res) => {
  res.render('index')
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

app.post('/users/login', (req, res) => {
  res.send('login')
})

app.get('/users/register', (req, res) => {
  res.render('register')
})

app.post('/users/register', (req, res) => {
  const { name, email, password, confirmPassword } = req.body
  User.create({ name, email, password })
    .then(user => res.redirect('/'))
})

app.get('/users/logout', (req, res) => {
  res.send('logout')
})
app.listen(PORT, () => {
  console.log(`App is running on http://localhost:${PORT}`)
})