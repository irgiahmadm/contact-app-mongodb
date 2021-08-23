const express = require('express')
const expressLayouts = require('express-ejs-layouts')

// run connection mongoose
require('./utils/db')

//model
const Contact = require('./model/contact')

const app = express()
const port = 3000

//setup EJS
app.set('view engine', 'ejs')
app.use(expressLayouts)
app.use(express.static('public'))
app.use(express.urlencoded({
    extended: true
}))

//setup main layout
app.set('layout', 'layouts/main-layout')

//setup flash messages
const session = require('express-session')
const cookieParser = require('cookie-parser')
const flash = require('connect-flash')

//flash message config
app.use(cookieParser('secret'))
app.use(session({
    cookie: {
        maxAge: 6000
    },
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}))
app.use(flash())

app.listen(port, () => {
    console.log(`Mongo Contact App | Listening at http://localhost:${port}`)
})

//middleware for index
app.get('/', (req, res) => {
    res.render('index', {
        name: 'irgi',
        title: 'Home'
    })
})

//about page
app.get('/about', (req, res) => {
    res.render('about', {
        title: 'About'
    })
})

//list contact page
app.get('/contact', async (req, res) => {
    const contacts = await Contact.find()
    res.render('contact', {
        title: 'Contact',
        contacts,
        msg: req.flash('msg')
    })
})


//detail contact
app.get('/contact/:phoneNumber', async (req, res) => {

    const contact = await Contact.findOne({phoneNumber: req.params.phoneNumber})
    res.render('detail', {
        title: 'Detail Contact',
        contact,
        phoneNumber: req.params.phoneNumber
    })
})
