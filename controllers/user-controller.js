const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const nodemailer=require('nodemailer');
const Category = require('../models/categoryModel')
const Cart = require('../models/cartModel')
const Address = require('../models/addressModel')
const Product = require('../models/productModel')
const Wishlist = require('../models/wishlistModel')
const Order = require('../models/orderModel');
const Coupon = require('../models/couponModel')
const { json } = require('express');

const dotenv=require("dotenv")
const RazorPay = require('razorpay')

dotenv.config()
const instance = new RazorPay({
    key_id : process.env.RAZORPAY_ID_KEY,
    key_secret : process.env.RAZORPAY_SECRET_KEY,
});

var otp;
const sendVerifymail = async (email, otp) => {
    try {
      const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        requireTLS: true,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });
      const mailOption = {
        from: "ptshafeeque999.com",
        to: email,
        subject: "For OTP verification",
        text: `Your OTP is: ${otp}`,
        //html:"<p> Hii  " +name+ "  please enter  " +otp+ "  as your OTP for verification </p>"
        // html:'<p>hi '+name+' ,please click here to<a href="http://localhost:3000/otp " '+email+' >varify</a> for verify and enter the '+otp+ ' </p>'
        // html:
        //   "<p>hi"  +
        //   name + 
        //   ',please click here to<a href="https://localhost/otp">varify</a> and enter the' +
        //   otp + 
        //   " for your verification "  +
        //   email +
        //   "</p>",
      };
  
      transporter.sendMail(mailOption, (error, info) => {
        if (error) {
          console.log(error.message);
        } else {
          console.log(otp+',' +"emai has been send to:", info.response);
        }
      });
    } catch (error) {
      console.log(error.message);
    }
  };

const securePassword = async(password)=>{
    try {

        const passwordHash = await bcrypt.hash(password, 10);
        return passwordHash
        
    } catch (error) {
        console.log(error.message)
    }
}

const insertUser = async(req,res)=>{
    try {

        const email = req.body.email;
        const already = await User.findOne({email:email})

        if(already){
            res.render('register',{message:"This email is already taken"})
        }else{
            function generateReferralCode(length) {
                const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
                let referralCode = '';
              
                for (let i = 0; i < length; i++) {
                  const randomIndex = Math.floor(Math.random() * characters.length);
                  referralCode += characters.charAt(randomIndex);
                }
              
                return referralCode;
              }
              
              // Usage example to generate a 6-character referral code:
              const referralCode = generateReferralCode(6);
              console.log(referralCode);

        
      
        const name = req.body.name
        const pass=req.body.password
        const referCode = req.body.refer
        // console.log(pass);
        const spassword = await securePassword(pass);
        const user = new User({
            name:name,
            email:req.body.email,
            phone:req.body.phone,
            password:spassword,
            is_admin:0,
            referCode:referralCode
            
        });
        
        const userData = await user.save();
        const newUserID = userData._id
        const findUser = await User.findOne({referCode:referCode})
        if(findUser){
        const addMoneyUser = await User.findOneAndUpdate({referCode:referCode},{$inc:{wallet:100}})
        const addMoneyNewUser = await User.findByIdAndUpdate({_id:newUserID},{$inc:{wallet:100}})
        // const addMoneyNewUser
    }


        if(userData){

            
            const otpGenerated = Math.floor(1000+Math.random()*9999);

            otp = otpGenerated;
            console.log(otp);

            sendVerifymail(req.body.email, otpGenerated); 

            res.render('otp_page', {message:"Your registration has been successfull, please verify your mail" , userData})}
        }
    } catch (error) {
        console.log(error.message)
    }
}

const  otpVerifying = async(req,res)=>{
    try {
        const OTP = req.body.otp;
        const id = req.body.id
        const userData = {}
        userData._id = id

        // console.log(id)
        // console.log(OTP);
        if(OTP==otp){
            res.redirect('/login');
            await User.findByIdAndUpdate({ _id : id } , {$set : { is_verified : 1 }});
            
        }else{
            res.render('otp_page',
            {message:"Enter a valid OTP",userData});
        }
        
    } catch (error) {
        
    }
}




//user login method startded

const loadLogin = async (req,res)=>{
    try {

        res.render('login')
        
    } catch (error) {
        console.log(error.message)
    }
}

const loadRegister = async (req,res)=>{
    try {

        res.render('register')
        
    } catch (error) {
        console.log(error.message)
    }
}


const loadHome = async (req , res)=> {
    try {
        
        const product = await Product.find({is_delete:0})
       
        res.render('index',{product})
        
    } catch (error) {
        console.log(error.message);
    }
}

const loadshop = async (req, res) => {
    try {
        const sort = req.query.sort || 'none';
        const filter = req.query.filter || 'All';
        const search = req.query.search || null;
        const page = parseInt(req.query.page) || 1;
        const limit = 6;

        const category = await Category.find({ is_delete: false });
        const searchQuery = search ? { name: { $regex: new RegExp(search, 'i') } } : {};

        const query = {
            is_delete: 0,
            ...searchQuery,
        };

        if (filter && filter !== 'All') {
            query.category = filter;
        }

        let sortOptions = {};

        if (sort === 'Low To High') {
            sortOptions = { price: 1 };
        } else if (sort === 'High To Low') {
            sortOptions = { price: -1 };
        }

        const totalProducts = await Product.countDocuments(query);
        const totalPages = Math.ceil(totalProducts / limit);

        const product = await Product.find(query)
            .limit(limit)
            .skip((page - 1) * limit)
            .sort(sortOptions)
            .exec();

        res.render('shop', {
            categories: category,
            product: product,
            session: req.session.user_id,
            totalPages: totalPages,
            page: page,
            filter,
            search,
            sort,
        });
    } catch (err) {
        console.log(err.message);
    }
};




const loadOtpPage = async(req,res)=>{
    try {

        res.render('otp_page')
        
    } catch (error) {

        console.log(error.message)
        
    }
}

const verifyLogin = async(req,res)=>{
    try {

        const email = req.body.email;
        const password = req.body.password;

        const userData = await User.findOne({email:email});
        // console.log(userData);
        if(userData){
            const passwordMatch = await bcrypt.compare(password,userData.password);
            if(passwordMatch){
                if(userData.is_verified===0){
                    // console.log('pasd');
                    res.render('login',{message:"please verify your mail"})
                }else{
                    req.session.user_id = userData._id;
                    // console.log(req.session.user_id);
                    res.redirect('/')
                }
                // console.log(req.session.user_id)
            }else{
                res.render('login',{message:"Email and password incorrect"});
            }
        }else{
            res.render('login',{message:"Email and password incorrect"});
        }
        
    } catch (error) {
        console.log(error.message)
    }
}

const loadAccount = async(req,res)=>{
    try {
        
        
        const usersData = await User.findOne({_id:req.session.user_id})
            
        // console.log(usersData)
        res.render('account',{users:usersData})
        
    } catch (error) {
        console.log(error.message)
    }
}


const loadAllOrders = async(req,res)=>{
    try {

        const page = parseInt(req.query.page) || 1;
        const limit = 8;
        const userId = req.session.user_id
        const orders = await Order.find({user:userId})
        
        .sort({date : -1})
        .limit(limit)
        .skip((page - 1) * limit)
        .exec();
        
        const totalOrders = await Order.find({user:userId}).countDocuments()

        const totalPages = Math.ceil(totalOrders / limit);

        res.render('allOrders',{orders:orders,
            totalPages: totalPages,
            page: page})
        
    } catch (error) {
        console.log(error.message)
    }
}

const loadAbout = async(req,res)=>{
    try {

        res.render('about')
        
    } catch (error) {
        console.log(error.message)
    }
}

const loadContact = async(req,res)=>{
    try {

        res.render('contact')
        
    } catch (error) {
        console.log(error.message)
    }
}

const userLogout = async(req,res)=>{
    try {

        req.session.destroy();
        res.redirect('/')
        
    } catch (error) {
        console.log(error.message)
    }
}

const p_details = async(req,res)=>{
    try {
        const id = req.query.id
        const product = await Product.findOne({_id:id})
        const wishlist = await Wishlist.findOne({user:req.session.user_id,'products.productId':id})
        // console.log(wishlist)

        res.render('shop-details',{product,wishlist})
        
    } catch (error) {
        console.log(error.message)
    }
}
const loadForgotPass = async(req,res)=>{
    try {
        res.render('forgotPass')

        
    } catch (error) {
        console.log(error.message)
    }
}
const postForgotPass = async(req,res)=>{
    try {

        const email = req.body.email
        const emailExist = await User.findOne({email:email})

        if(emailExist){
            const otpGenerated = Math.floor(1000+Math.random()*9999);
            otp = otpGenerated;
            console.log(otp);

            sendVerifymail(email,otpGenerated)
            // console.log(emailExist)
            res.render('rePassOtp',{emailExist,email})
            
        }else{
            res.render('forgotPass',{message:"User not Exist"})
        }
        
    } catch (error) {
        console.log(error.message)
    }
}

const loadForgotPassOtp = async(req,res)=>{
    try {

        res.render('rePassOtp')
        
    } catch (error) {
        console.log(error.message)
    }
}

const postForgotPassOtp = async (req, res) => {
    try {
        const OTP = req.body.otp;
        const email = req.query.email;

        // Assuming 'otp' is defined and holds the correct OTP value
        if (OTP == otp) {
            res.render('newPassword',{email});
            // console.log(email)
        } else {
            res.render('rePassOtp', { message: "Enter a valid Otp", email });
        }
    } catch (error) {
        console.log(error.message);
    }
};


const loadNewPassword = async(req,res)=>{
    try {
        const email=req.query.email

        res.render('newPassword',{email})
        
    } catch (error) {
        console.log(error.message)
    }
}

const postnewPassword = async(req,res)=>{
    try {
        const email = req.query.email
        console.log(email)
        const newPass = req.body.newPassword
        if(newPass.length>4){
        const passwordHash = await bcrypt.hash(newPass, 10);
            await User.updateOne({email:email},{$set:{password:passwordHash}})
            res.redirect('/login')
        }else{
            res.render('newPassword',{message:"Enter at least 5 characters"})
        }
        
    } catch (error) {
        console.log(error.message)
    }
}

const loadCheckout = async(req,res)=>{
    try {

        const cartData = await Cart.findOne({user:req.session.user_id}).populate('products.productId')
        const cart = await Cart.findOne({user:req.session.user_id})
        const address = await Address.findOne({user:req.session.user_id})
        const user = await User.findOne({_id:req.session.user_id})
        const coupons = await Coupon.find()
        const discount = req.query.discount
        const message = req.query.Message
        const wallet = user.wallet.toFixed()
        const oldTotal = req.query.oldTotal
        const code = req.query.code


        let total = req.query.Total
        
        if(cartData){
            cartData.products.forEach((product)=>{
                total = total
                

            });
            return res.render('checkout',{address,total,coupons,discount,message,wallet,user,cart,oldTotal,code})
            
            
        }else{
            return  res.redirect('/cart')
        }
        // console.log(grandTotal,"hiiiiii")
        // console.log(total)
        
    } catch (error) {
        console.log(error.message)
    }
}

const placeOrder = async(req,res)=>{
    try {

        const bodyaddress = req.body.selectedAddress
        const total = req.body.total
        const payment = req.body.payment
        const wBalance = req.body.wBalance
        console.log("hiii")
        
        let status = payment == 'cod' ? 'placed' : 'pending'

        const userId = req.session.user_id
        const user = await User.findOne({_id:userId})
        const cartData = await Cart.findOne({user:userId})

        const cartProducts = cartData.products

        const orderDate = new Date();
        const delivery = new Date(orderDate.getTime()+(10*24*60*60*1000));
        const deliveryDate = delivery.toLocaleDateString('en-US', {year: 'numeric', month: 'short', day: '2-digit'}).replace(/\//g, '-');

        function generateNum() {
            const min = 1000000;
            const max = 9999999;
            
            const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
            
            return randomNumber;
          }

          const oid = generateNum()

        const order = new Order({
            user : userId,
            address : bodyaddress,
            userName : user.name,
            totalAmount : total,
            status : status,
            date : orderDate,
            payment : payment,
            products : cartProducts,
            OID: oid,
            expectedDelivery : deliveryDate,
            'products.deliveryDate':deliveryDate
            


        })

        const orderdata = await order.save()
        const orderid = orderdata._id
        await Cart.findOneAndUpdate({user:req.session.user_id},{$set:{isWallet:false}})
        if(orderdata.status === 'placed'){
            await Cart.deleteOne({user:req.session.user_id})
            await User.findByIdAndUpdate({_id:req.session.user_id},{$inc:{wallet:-wBalance}})  

            for(let i=0; i< cartProducts.length; i++){
                const productId = cartProducts[i].productId
                const count = cartProducts[i].quantity
                await Product.findByIdAndUpdate({_id:productId},{$inc:{stock: -count}})
            }
            res.json({success : true, params: orderid})
        }else{
            // console.log("hiii");
            const orderId = orderdata._id
            const total = orderdata.totalAmount

            var options = {
                amount: total * 100,
                currency: 'INR',
                receipt: ""+ orderId
            };
            instance.orders.create(options, function (err,order) {
                // console.log(order,"iui")
                
                res.json({order:order});
                
            });
        }
        
    } catch (error) {
        console.log(error.message)
    }
}

const verifypayment = async(req,res)=>{
    try {

        console.log("VerifyPayment is here")
        let userData = await User.findOne({ _id: req.session.user_id})
        const cartData = await Cart.findOne({ user: req.session.user_id})
        const cartProducts = cartData.products

        const details = (req.body);

        const crypto = require('crypto');

        let hmac = crypto.createHmac("sha256", process.env.RAZORPAY_SECRET_KEY)
        hmac.update(details.payment.razorpay_order_id + '|' + details.payment.razorpay_payment_id)
        hmac = hmac.digest('hex')
        if (hmac == details.payment.razorpay_signature) {
            await Order.findByIdAndUpdate(
                { _id: details.order.receipt},
                { $set: { paymentId: details.payment.razorpay_payment_id } }
            )

            for(let i=0 ; i<cartProducts.length ; i++) {
                const productId = cartProducts[i].productId
                const count = cartProducts[i].quantity
                await Product.findByIdAndUpdate({ _id : productId } , { $inc : {stock : -count }})
            }

            await Order.findByIdAndUpdate({ _id: details.order.receipt }, { $set: { status: "placed" } })

            await Cart.deleteOne({ user: userData._id })
            res.json({ success: true , params : details.order.receipt })
        }else{
            await Order.deleteOne({ _id: details.order.receipt});
            res.json({ success: false })
        }

    } catch (error) {
        console.log(error.message)
    }
}

const loadOrderPlaced = async(req,res,next)=>{
    try {

        const id = req.params.id
        const order = await Order.findOne({_id: id}).populate('products.productId')
        res.render('order-placed',{session:req.session.user_id,order:order})
        
    } catch (error) {
        next(error.message)
    }
}


const loadOrderDetails = async(req,res)=>{
    try {

        const orderId = req.query.id
        const orderData = await Order.findOne({ _id: orderId }).populate('products.productId')
        // console.log(orderData);
        res.render('orderDetails', { session: req.session.user_id, order: orderData })
        
    } catch (error) {
        console.log(error.message)
    }
}

const cancelOrder = async(req,res)=>{
    try {

        const param = req.body.param
        const id = req.body.crId
        const total = req.body.totalpr;
        const userId = req.session.user_id
        
        const orderData = await Order.findOne({'products._id':id})
        // console.log(orderData)

        if(orderData.payment=="razor"){
            const product = orderData.products.find((product) => product._id.toString()==id)

        const cancel = await Order.findOneAndUpdate({user:req.session.user_id, 'products._id':id},{
            $set:{
                'products.$.status': 'cancelled',
            }
        })
        const refund = await User.findByIdAndUpdate({_id:userId},{$inc:{wallet:total}})

        if(cancel){
            res.json({success: true, param})
        }else{
            res.json({success: false})
        }


        }else{

        
        const product = orderData.products.find((product) => product._id.toString()==id)

        const cancel = await Order.findOneAndUpdate({user:req.session.user_id, 'products._id':id},{
            $set:{
                'products.$.status': 'cancelled',
            }
        })

        if(cancel){
            res.json({success: true, param})
        }else{
            res.json({success: false})
        }
    }

        


    } catch (error) {
        console.log(error.message)
    }
}

const returnOrder = async(req,res)=>{
    try {

        const param = req.body.param
        const pid = req.query.pid
        const id = req.query.id

        const orderData = await Order.findOne({'products._id':pid})
        const product = orderData.products.find((product) => product._id.toString()==pid)

        const returned = await Order.findOneAndUpdate({user:req.session.user_id, 'products._id':pid},{
            $set:{
                'products.$.status': 'returned',
            }
        })

        if(returned){
            res.redirect(`/orderDetails?id=${id}`)
        }else{
            res.redirect('/allOrders')

        }


    } catch (error) {
        console.log(error.message)
    }
}

const applyWallet = async(req,res)=>{
    try {

        const total = req.query.Total
        const user = await User.findOne({_id:req.session.user_id})
        const walletBalance = user.wallet
        const offBalance = total * 0.6;
        const balance = total - (total * 0.6);

        if(walletBalance <= offBalance){
            const newTotal = total - walletBalance
            // await User.findByIdAndUpdate({_id:req.session.user_id},{$inc:{wallet:-walletBalance}})
            await Cart.findOneAndUpdate({user:req.session.user_id},{$set:{isWallet:true}})
            res.redirect(`/checkout?Total=${newTotal.toFixed()}&&oldTotal=${total}`)

        }else{
            const newTotal = total- offBalance
            // await User.findByIdAndUpdate({_id:req.session.user_id},{$inc:{wallet:-offBalance}})
            await Cart.findOneAndUpdate({user:req.session.user_id},{$set:{isWallet:true}})
            res.redirect(`/checkout?Total=${newTotal.toFixed()}&&oldTotal=${total}`)


        }
        
    } catch (error) {
        console.log(error.message)
    }
}

const removeWallet = async(req,res)=>{
    try {

        const total = req.query.Total
        const newt = req.query.t
        const balance = total-newt
        // await User.findByIdAndUpdate({_id:req.session.user_id},{$inc:{wallet:balance}})
        await Cart.findOneAndUpdate({user:req.session.user_id},{$set:{isWallet:false}})
        res.redirect(`/checkout?Total=${total}`)


        
    } catch (error) {
        console.log(error.message)
    }
}

const editUser = async(req,res)=>{
    try {
        const id = req.query.id
        const user = await User.findOne({_id:id})
        res.render('editUserDetails',{user})
        
    } catch (error) {
        console.log(error.message)
    }
}

const postEditUser = async(req,res)=>{
    try {

        const id = req.query.id
        const user = await User.findOne({_id:id})
        if(user){
            const update = await User.findByIdAndUpdate({_id:id},{$set:{
                name:req.body.name,
                email:req.body.email,
                phone:req.body.phone
            }})
        }
        res.redirect('/account')
        
    } catch (error) {
        conosle.log(error.message)
    }
}






module.exports = {
    loadHome,
    loadshop,
    loadLogin,
    loadRegister,
    loadOtpPage,
    insertUser,
    verifyLogin,
    sendVerifymail,
    otpVerifying,
    loadAccount,
    loadAbout,
    loadContact,
    userLogout,
    p_details,
    loadForgotPass,
    postForgotPass,
    loadForgotPassOtp,
    postForgotPassOtp,
    loadNewPassword,
    postnewPassword,
    loadCheckout,
    placeOrder,
    loadOrderPlaced,
    loadAllOrders,
    loadOrderDetails,
    cancelOrder,
    verifypayment,
    applyWallet,
    removeWallet,
    returnOrder,
    editUser,
    postEditUser
}