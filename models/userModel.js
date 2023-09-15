const mongoose = require('mongoose')

const  userSchema = new mongoose.Schema({

    name : {
        type : String,
        required : true
    },

    email : {
        type : String,
        required : true
    },
    
    phone : {
        type : Number,
        required : true
    },

    password : {
        type : String,
        required : true
    },

    is_admin : {
        type : Number,
        default : 0
    },

    is_blocked : {
        type : Number,
        default : 0
    },

    is_verified : {
        type : Number,
        default : 0
    },

    wallet : {
        type : Number,
        default: 0
    },

    referCode : {
        type : String
    }

})

module.exports = mongoose.model('User' , userSchema)