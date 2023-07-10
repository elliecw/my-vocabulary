const express = require('express')
const session = require('express-session')
const usePassport = require('./config/passport')
const exphbs = require('express-handlebars')
const methodOverride = require('method-override')
const axios = require('axios')
const app = express()
const PORT = 3000
const db = require('./models')
const Word = db.Word
const User = db.User
const routes = require('./routes')

app.engine('hbs', exphbs.engine({ defaultLayout: 'main', extname: '.hbs' }))
app.set('view engine', 'hbs')

app.use(session({
  secret: 'ThisIsMySecret',
  resave: false,
  saveUninitialized: true
}))

app.use(express.urlencoded({ extended: true }))
app.use(methodOverride('_method'))

usePassport(app)

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.isAuthenticated()
  res.locals.user = req.user
  next()
})

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
      // const a = vocabularyDef.join('<br/>').split(',')[0]
      // vocabularyDef.join('\r\n')
      // const de = vocabularyDef.split('\n')
      console.log(vocabularyId, vocabularyFl, vocabularyDef)
      return res.render('search', { vocabularyId, vocabularyFl, vocabularyDef })
    })
})

app.post('/list', (req, res) => {
  // UserId to be updated
  return Word.create({ name: req.body.name, fl: req.body.fl, def: req.body.def, UserId: 1 }).then((word) => {
    res.render('list', { name: word.name, fl: word.fl, def: word.def })
  })
})

app.use(routes)

app.listen(PORT, () => {
  console.log(`App is running on http://localhost:${PORT}`)
})