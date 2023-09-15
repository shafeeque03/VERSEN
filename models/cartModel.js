const mongoose = require('mongoose')

const cartSchema = new mongoose.Schema({

    user:{
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User',
        required : true
    },
    isWallet : {
        type: Boolean,
        default : false
    },

    products:[{
        productId : {
            type : mongoose.Schema.Types.ObjectId,
            ref : 'product',
            required : true
        },

        quantity : {
            type : Number,
            default : 1
        },

        price : {
            type : Number,
            required : true
        },

        totalPrice : {
            type : Number,
            required : true
        },
        PID : {
            type : String,
            required: true
        }
    }]
})

module.exports = mongoose.model('cart', cartSchema)