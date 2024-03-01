const express = require('express')
const cors = require('cors')
require('dotenv').config()
const bodyParser = require('body-parser')
const { logger } = require('./src/middleware/winston.middleware')
const { dbConnection } = require('./src/config/db.config')
const port = process.env.PORT
const app=express()
app.use(bodyParser.json())
app.get("/",(req,res)=>{
    res.send("API is running...");
})


app.use('/api/course', require('./src/router/course'))
app.use('/api/user', require('./src/router/user'))


app.listen(port, async () => {
    logger.info('server listening on port', port)
    await dbConnection()
  })
