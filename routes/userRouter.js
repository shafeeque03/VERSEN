const express = require('express');
const nocache = require('nocache')
const user_route = express();
const user_controller = require('../controllers/user-controller');
const cart_controller = require('../controllers/cart-controller');
const address_controller = require('../controllers/address-controller')
const auth = require("../middleware/auth")
const block = require('../middleware/blockUser')
const wishlistController = require('../controllers/wishlist-controller')
const CouponController = require('../controllers/couponController')

user_route.set('view engine','ejs');
user_route.set('views','./views/user');
user_route.use(nocache())



user_route.use(express.static('public'));


user_route.get('/', user_controller.loadHome);
user_route.get('/shop', user_controller.loadshop);
user_route.get('/login',auth.isLogout, user_controller.loadLogin);
user_route.post('/login', user_controller.verifyLogin);
user_route.get('/register',auth.isLogout, user_controller.loadRegister);
user_route.post('/register', user_controller.insertUser);
user_route.get('/otp', user_controller.loadOtpPage);
user_route.post('/otp',user_controller.otpVerifying);
user_route.get('/account',block.checkUserBlocking,auth.isLogin,user_controller.loadAccount);
user_route.get('/about',user_controller.loadAbout);
user_route.get('/contact',user_controller.loadContact);
user_route.get('/logout',auth.isLogin,user_controller.userLogout);
user_route.get('/productDetails',user_controller.p_details);
user_route.get('/cart', auth.isLogin,block.checkUserBlocking, cart_controller.loadCart)
user_route.get('/addToCart', auth.isLogin,block.checkUserBlocking, cart_controller.addToCart)
user_route.get('/address', auth.isLogin, block.checkUserBlocking, address_controller.loadAddress)
user_route.get('/addAddress', auth.isLogin, block.checkUserBlocking, address_controller.loadAddAddress)
user_route.post('/addAddress', block.checkUserBlocking, address_controller.postAddAddress)
user_route.get('/deleteAddress', block.checkUserBlocking, address_controller.deleteAddress)
user_route.get('/editAddress',block.checkUserBlocking, address_controller.loadEditAddress)
user_route.post('/editAddress',block.checkUserBlocking, address_controller.postEditAddress)

user_route.get('/editUser', block.checkUserBlocking, user_controller.editUser)
user_route.post('/editUser',block.checkUserBlocking, user_controller.postEditUser)

user_route.get('/wishlist', auth.isLogin, block.checkUserBlocking, wishlistController.loadWishlist)
user_route.get('/addToWishlist', auth.isLogin, block.checkUserBlocking, wishlistController.addToWishlist)
user_route.get('/deleteWishlist',block.checkUserBlocking, wishlistController.deleteWishlist)
user_route.post('/changes', block.checkUserBlocking, cart_controller.changes)
user_route.get('/deleteCart', block.checkUserBlocking, cart_controller.deleteCart)

user_route.get('/cAddAddress',block.checkUserBlocking, address_controller.cAddAddress)
user_route.post('/cAddAddress',block.checkUserBlocking,address_controller.postCaddAddress)

user_route.get('/checkout', block.checkUserBlocking, user_controller.loadCheckout)
user_route.post('/checkout', block.checkUserBlocking, user_controller.placeOrder)
user_route.post('/verifypayment', block.checkUserBlocking, user_controller.verifypayment)

user_route.get('/order-placed/:id', user_controller.loadOrderPlaced)


user_route.get('/forgotPass', user_controller.loadForgotPass);
user_route.post('/forgotPass',user_controller.postForgotPass);
user_route.get('/forgotPassOtp', user_controller.loadForgotPassOtp);
user_route.post('/forgotPassOtp',user_controller.postForgotPassOtp);
user_route.get('/newPassword', user_controller.loadNewPassword);
user_route.post('/newPassword', user_controller.postnewPassword);

user_route.get('/allOrders',  block.checkUserBlocking, user_controller.loadAllOrders)


user_route.get('/orderDetails', block.checkUserBlocking, user_controller.loadOrderDetails)
user_route.post('/cancelOrder', block.checkUserBlocking, user_controller.cancelOrder)
user_route.get('/returnOrder', block.checkUserBlocking, user_controller.returnOrder)

user_route.post('/applyCoupon', block.checkUserBlocking, CouponController.postCoupon)
user_route.get('/removeCoupon', block.checkUserBlocking, CouponController.removeCoupon)

user_route.get('/applyWallet',block.checkUserBlocking, user_controller.applyWallet)
user_route.get('/removeWallet',block.checkUserBlocking, user_controller.removeWallet)





module.exports = user_route;
    
