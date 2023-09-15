const Coupon = require("../models/couponModel")

const loadCoupon = async(req,res)=>{
    try {

        const coupons = await Coupon.find()

        res.render('coupons',{coupons})
        
    } catch (error) {
        console.log(error.message)
    }
}

const loadAddCoupon = async(req,res)=>{
    try {

        res.render('addCoupon')
        
    } catch (error) {
        console.log(error.message)
    }
}

const postAddCoupon = async(req,res)=>{
    try {

        const { startingDate, expiryDate, percentage, minimum } = req.body
        const code = req.body.name.toUpperCase()

        const exist = await Coupon.findOne({code:code})

        if(exist){
            res.redirect('/admin/coupons')
        }else{
            const coupon = new Coupon({
                code:code,
                startDate:startingDate,
                expireDate:expiryDate,
                discountPercentage:percentage,
                minimum:minimum
            })
            await coupon.save()
            res.redirect('/admin/coupons')
        }

        
    } catch (error) {
        console.log(error.message)
    }
}

const postCoupon = async(req,res)=>{
    try {

        const code = req.body.coupon
        const user = req.session.user_id
        const coupon = await Coupon.findOne({code:code})
        const total = req.query.Total

        if(coupon){
            const minimum = coupon.minimum
            if(total>=minimum){
            const discount = coupon.discountPercentage
            console.log(discount)
            res.redirect(`/checkout?discount=${discount}&&Total=${total}&&code=${code}`)
        }else{
            const minimum = coupon.minimum
            const message = "Order value is not enough"
            res.redirect(`/checkout?Total=${total}&&Message=${message}`)
        }
        }else{
            const message = "Coupon is not available"
            res.redirect(`/checkout?Total=${total}&&Message=${message}`)
        }
        
    } catch (error) {
        console.log(error.message)
    }
}

const removeCoupon = async(req,res)=>{
    try {
        const total = req.query.Total
        res.redirect(`/checkout?Total=${total}`)

        
    } catch (error) {
        console.log(error.message)
    }
}

module.exports = {
    loadCoupon,
    loadAddCoupon,
    postAddCoupon,
    postCoupon,
    removeCoupon
}