const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({

    name:{
        type: String,
        require: true
    },

    price:{
        type: Number,
        require: true
    },

    description:{
        type: String,
        require: true
    },

    image:{
        type: Array,
        require: true
    },

    category:{
        type: String,
        require: true
    },

    stock:{
        type: Number,
        require: true
    },

    is_delete:{
        type: Number,
        default: 0
    },

    isWishlist:{
        type: Boolean,
        default: false
    },

    isOffer:{
        type: Boolean,
        default: false
    },

    oldPrice:{
        type: Number
    }

})

module.exports = mongoose.model('product', productSchema)