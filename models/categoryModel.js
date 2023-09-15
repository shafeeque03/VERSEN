const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },

    is_delete:{
        type:Number,
        default:0
    },
    
    isOffer:{
        type: Boolean,
        default: false
    },
})

module.exports = mongoose.model('category', categorySchema) 