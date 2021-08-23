const express = require('express')
const expressLayouts = require('express-ejs-layouts')

// run connection mongoose
require('./utils/db')

//model
const Contact = require('./model/contact')

const app = express()
const port = 3000

//validation
const { body, validationResult, check } = require('express-validator')

const methodOverride = require('method-override')

//setup methodOverride
app.use(methodOverride('_method'))

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

//form add contact
app.get('/contact/add', (req, res) => {
    res.render('add-contact', {
        title: 'Add Contact Form'
    })
})

//add contact data
app.post('/contact', [
    check('email', 'Email is invalid').isEmail(),
    check('phoneNumber', "Phone Number is Invalid").isMobilePhone('id-ID'),
    body('phoneNumber').custom(async (value) => {
        const duplicate = await Contact.findOne({phoneNumber: value})
        if (duplicate) {
            throw new Error('Phone Number is exist')
        }
        return true
    })
], (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        res.render('add-contact', {
            title: 'Form Data Contact',
            errors: errors.array()
        })
    } else {
        Contact.insertMany(req.body, (err, result) => {
            req.flash('msg', 'Contact is succesfully created!')
            res.redirect('/contact')
        })
     
    }
})

//delete contact
/* app.get('/contact/delete/:phoneNumber', async (req, res) => {
    const contact = await Contact.findOne({phoneNumber: req.params.phoneNumber})
    if (!contact) {
        res.status(404)
        res.send('<h1>404</h1>')
    } else {
        Contact.deleteOne({_id: contact._id}).then((result) =>{
            req.flash('msg', 'Contact is succesfully deleted!')
            res.redirect('/contact')
        })
    }
}) */

app.delete('/contact', (req, res) => {
    Contact.deleteOne({phoneNumber: req.body.phoneNumber}).then((result) =>{
        req.flash('msg', 'Contact is succesfully deleted!')
        res.redirect('/contact')
    })
})

//form edit contact
app.get('/contact/edit/:phoneNumber', async (req, res) => {
    const contact = await Contact.findOne({phoneNumber: req.params.phoneNumber})
    res.render('edit-contact', {
        title: 'Edit Contact Form',
        contact
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

//edit contact
app.put('/contact',  [
    check('email', 'Email is invalid').isEmail(),
    check('phoneNumber', "Phone Number is Invalid").isMobilePhone('id-ID'),
    body('phoneNumber').custom(async (value, { req }) => {
        const duplicate = await Contact.findOne({ name: value})
        if (value !== req.body.oldPhoneNumber && duplicate) {
            throw new Error('Phone Number is exist')
        }
        return true
    })
],(req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        res.render('edit-contact', {
            title: 'Form Edit Data Contact',
            errors: errors.array(),
            contact: req.body
        })
    } else {
        Contact.updateOne(
            {_id: req.body._id}, 
            {
                $set: {
                    name: req.body.name,
                    email: req.body.email,
                    phoneNumber: req.body.phoneNumber
                }
            }
        ).then((result)=>{
            req.flash('msg', 'Contact is succesfully updated!')
            res.redirect('/contact')
        })
        
    }
})