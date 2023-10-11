const mongoose = require('mongoose')

const connectDb = () =>{

    mongoose.connect('mongodb+srv://harkirattws:12345678aA@cluster0.7nwqvsc.mongodb.net/Cluster0?retryWrites=true&w=majority')
    .then(data=>{
        console.log("DB Connected Succes")
    })
    .catch(err=>{
        console.log("error while connecting to db" ,err)
    })

}

module.exports = {connectDb}