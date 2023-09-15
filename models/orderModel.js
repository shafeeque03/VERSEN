const {ObjectId} = require('mongodb')
const mongoose = require('mongoose')

const orderSchema = new mongoose.Schema({

    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    OID:{
        type: String,
        required: true
    },
    userName:{
        type: String,
        required: true
    },
    totalAmount:{
        type: Number,
        required: true
    },
    status:{
        type: String,
        required: true
    },
    date:{
        type: Date,
        required: true
    },
    payment:{
        type: String,
        required: true
    },
    expectedDelivery:{
        type: Date,
        required: true
    },
    paymentId:{
        type: String
    },
    address:{
        type: String,
        
    },

    products: [{
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'product',
            required: true
        },

        quantity: {
            type: Number,
            required: true
        },

        price: {
            type: Number,
            required: true
        },

        totalPrice: {
            type: Number,
            required: true
        },

        status : {
            type : String,
            default : 'processing'
        },
    }]

})
    
module.exports = mongoose.model('order',orderSchema)