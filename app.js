const express = require('express')
const app = express()

//EJS - Template View Engine
app.set('view engine', 'ejs')
app.use(express.static("views"))

// body-parser - read HTTP POST data from Form Input.
var bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({
    extended: true
}))
app.use(bodyParser.json())

// Form Validation
const expressValidator = require('express-validator')
app.use(expressValidator())

// Express-Flash - Show Success or Error Message & Need Express-Session.
const flash = require('express-flash')
const session = require('express-session');
const cookieParser = require('cookie-parser');

//Set LifeTIme for 2 Hours
const TWO_HOURS = 1000 * 60 * 60 * 2
const {
    NODE_ENV = 'development',
        SESS_NAME = 'sid',
        SESS_LIFETIME = TWO_HOURS
} = process.env

const IN_PROD = NODE_ENV === 'production'

app.use(cookieParser('keyboard cat'))
app.use(session({
    name: SESS_NAME,
    resave: false,
    saveUninitialized: false,
    secret: 'keyboard cat',
    cookie: {
        maxAge: SESS_LIFETIME,
        sameSite: true,
        secure: IN_PROD
    }
}))
app.use(flash())

// Method-Override
const methodOverride = require('method-override')
// Custom logic for overriding method
app.use(methodOverride(function (req, res) {
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
        var method = req.body._method
        delete req.body._method
        return method
    }
}))

// Routing
const indexView = require('./routes/index')
const panelView = require('./routes/panel')
const guruView = require('./routes/guru')
const siswaView = require('./routes/siswa')
app.use('/', indexView)
app.use('/panel', panelView)
app.use('/guru', guruView)
app.use('/siswa', siswaView)

app.listen(3000, () => {
    console.log('Server running at port 3000: http://127.0.0.1:3000')
})