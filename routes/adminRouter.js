const express = require('express')
const admin_route = express()
const adminController = require('../controllers/admin-controller')
const categoryController = require('../controllers/category-controller')
const productcontroller = require('../controllers/product-controller')
const offerController = require('../controllers/offerController')
const couponController = require('../controllers/couponController')
const auth = require('../middleware/adminAuth')


// const upload = require('../middleware/multer')
const nocache = require('nocache')
const upload = require('../middleware/multer')


admin_route.set('view engine' , 'ejs')
admin_route.set('views' , './views/admin')

admin_route.use(nocache())

admin_route.get('/' , auth.isLogout ,  adminController.loadLogin)
admin_route.post('/login' , adminController.verifyLogin)
admin_route.get('/logout' , adminController.logout)
admin_route.get('/dashboard' , auth.isLogin , adminController.loadDashboard)
admin_route.get('/allUser',adminController.loadUserDetails)
admin_route.get('/block-user' , auth.isLogin , adminController.blockUser)
admin_route.get('/unblock-user' , auth.isLogin , adminController.unblockUser)
admin_route.get('/userOrders',adminController.userOrders)
admin_route.get('/userOrderDetails', adminController.userOrderDetails)
admin_route.post('/adminCancelOrder', adminController.adminCancelOrder)
admin_route.get('/salesReport', adminController.loadSalesReport)
admin_route.post('/postSalesReport', adminController.sortSalesReport)
admin_route.post('/deliver', adminController.deliver)
admin_route.post('/sort', adminController.sort)
admin_route.get('/orders', adminController.loadAllOrders)
admin_route.get('/details', adminController.details)
admin_route.get('/adminDelivery',adminController.adminDeliver)


//categoryController

admin_route.get('/allCategory', auth.isLogin, categoryController.loadCategory);
admin_route.get('/addCategory', auth.isLogin, categoryController.loadAddCategory);
admin_route.post('/addCategory',auth.isLogin,categoryController.addCategory);
admin_route.get('/editCategory',auth.isLogin,categoryController.loadEditCategory);
admin_route.post('/editCategory', categoryController.editCategory);
admin_route.get('/unlistCategory', categoryController.unlistCategory);
admin_route.get('/listCategory', categoryController.listCategory);

//prooductController

admin_route.get('/allProducts', auth.isLogin, productcontroller.loadProduct)
admin_route.get('/addProduct', auth.isLogin, productcontroller.loadAddProducts)
admin_route.post('/add-product' ,  upload.array('image' , 5) , productcontroller.addProduct)
admin_route.get('/unlistProduct', productcontroller.unlistProduct)
admin_route.get('/listProduct', productcontroller.listProduct)
admin_route.get('/editProduct', auth.isLogin, productcontroller.loadEditProduct)
admin_route.post('/editProduct',  upload.array('image' , 5) , productcontroller.editProduct)
admin_route.get('/deleteImage/:id/:image', productcontroller.deleteImage)

//offerController

admin_route.get('/productOffer', offerController.loadProductOffer)
admin_route.get('/addProductOffer',offerController.loadAddProductOffer)
admin_route.post('/addProductOffer', offerController.postAddProductOffer)
admin_route.get('/applyPrOffer',offerController.loadapplyProductOffer)
admin_route.get('/setProductOffer', offerController.postProductOffer)
admin_route.get('/removeOffer', offerController.removeProductOffer)
admin_route.get('/applyCatOff', offerController.loadApplyCatOffer)
admin_route.get('/applyCategoryOffer', offerController.postCategoryOffer)
admin_route.get('/removeCatOff',offerController.removeCategoryOffer)

//couponController

admin_route.get('/coupons',couponController.loadCoupon)
admin_route.get('/addCoupon', couponController.loadAddCoupon)
admin_route.post('/addCoupon', couponController.postAddCoupon)










module.exports = admin_route