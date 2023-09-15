const mongoose = require('mongoose')
 const offerSchema = new mongoose.Schema({

    name:{
        type: String,
        require: true
    },

    startingDate:{
        type: Date,
        require: true
    },

    expiryDate:{
        type: Date,
        require: true
    },

    percentage:{
        type:Number,
        require: true
    },

    status:{
        type: Boolean,
        default: true
    }

 })

 module.exports = mongoose.model('offer', offerSchema)