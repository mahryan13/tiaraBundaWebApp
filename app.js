const express = require('express')
const app = express()

//EJS - Template View Engine
app.set('view engine', 'ejs')
app.use(express.static("views"))

// Routing
const indexView = require('./routes/index')
const panelView = require('./routes/panel')
app.use('/', indexView)
app.use('/panel', panelView)

app.listen(3000, () => {
    console.log('Server running at port 3000: http://127.0.0.1:3000')
})