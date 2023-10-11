const express = require('express')
const cors = require('cors')
const app = express()
const env = require('dotenv')
const bodyParser = require("body-parser")
const swaggerJsdoc = require("swagger-jsdoc")
const swaggerUi = require("swagger-ui-express");
env.config()

app.use(express.json({}))
app.use(cors({origin:"*"}))

const { connectDb } = require('./db_connect')

connectDb()


const userRoute =  require('./Routes/userRoutes')
app.use("/",userRoute)

//swagger 
const options = {
    definition: {
      openapi: "3.1.0",
      info: {
        title: "USER AUTHENTICATION API",
        version: "0.1.0",
        description:
          "This is a Express API for user authentication",
        contact: {
          name: "Harkirat",
          email: "harkirat.tws@gmail.com",
        },
      },
      servers: [
        {
          url: "https://authapi-7o27.onrender.com",
        },
        {
          url: "http://localhost:8080",
        },
      ],
    },
    apis: ["./Routes/*.js"],
  };
  
  const specs = swaggerJsdoc(options);
  app.use(
    "/docs",
    swaggerUi.serve,
    swaggerUi.setup(specs )
  );


app.listen(8080,()=>{
    console.log("App is running on http://localhost:8080")
})