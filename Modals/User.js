const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({

    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        default:null
    },
    resetToken:{
        type:String,
        default:null
    },
    expiry:{
        type:Date,
        default:null
    }
    ,
    verifyToken:{
        type:String,
        default:null
    },
    verifyExpiry:{
        type:Date,
        default:null
    },
    verified:{
        type:Boolean,
        default:false
    }

})

const User = mongoose.model('user',userSchema);

module.exports = User