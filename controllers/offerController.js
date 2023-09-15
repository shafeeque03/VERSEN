
const Offer = require("../models/offerModel")
const Product = require("../models/productModel")
const Category = require("../models/categoryModel")

const loadProductOffer = async(req,res)=>{
    try {

        const offers = await Offer.find()

        res.render('productOffer',{offers})
        
    } catch (error) {
        console.log(error.message)
    }
}

const loadAddProductOffer = async(req,res)=>{
    try {

        res.render('addProductOffer')
        
    } catch (error) {
        console.log(error.message)
    }
}

const postAddProductOffer = async(req,res)=>{
    try {

        const { startingDate, expiryDate, percentage } = req.body
        const name = req.body.name.toUpperCase()
        const offerExist = await Offer.findOne({name:name})

        if(offerExist){
            res.redirect('/admin/addProductOffer')
        }else{
            const offer = new Offer({
                name:name,
                startingDate:startingDate,
                expiryDate:expiryDate,
                percentage:percentage
            })
            await offer.save()
            res.redirect('/admin/productOffer')
        }
        
    } catch (error) {
        console.log(error.message)
    }
}

const loadapplyProductOffer = async(req,res)=>{
    try {

        const productId = req.query.id
        const offer = await Offer.find()
        const product = await Product.findOne({_id:productId})

        res.render('applyPrOffer',{product:product,offers:offer})
        
    } catch (error) {
        consle.log(error.message)
    }
}



const postProductOffer = async(req,res)=>{
    try {
        
        const productId = req.query.id
        const offerId = req.query.off
        const product = await Product.findOne({_id:productId})
        const price = product.price
        const offer = await Offer.findOne({_id:offerId})
        const off = offer.percentage
        const discount = price - (price * off / 100).toFixed(0)

        if(product){
            await Product.findByIdAndUpdate({_id:productId},

                {$set:{price:discount,oldPrice:price,isOffer:true}}
                )
                res.redirect('/admin/allProducts')
        }
   
    } catch (error) {
        console.log(error.message)
    }
}


const removeProductOffer = async(req,res)=>{
    try {

        const productId = req.query.id
        const product = await Product.findOne({_id:productId})
        const price = product.oldPrice
        if(product){
            await Product.findByIdAndUpdate({_id:productId},

                {$set:{price:price,oldPrice:price,isOffer:false}}
                )
                res.redirect('/admin/allProducts')
        }
        
    } catch (error) {
        console.log(error.message)
    }
}


const loadApplyCatOffer = async(req,res)=>{
    try {

        const offer = await Offer.find()
        const category = req.query.name

        res.render('applyCatOffer',{offers:offer,category})
        
    } catch (error) {
        conosle.log(error.message)
    }
}

const postCategoryOffer = async (req, res) => {
    try {
        const offerId = req.query.off;
        const category = req.query.cat;
        const products = await Product.find({ category: category });
        const offer = await Offer.findOne({ _id: offerId });
        const off = offer.percentage;

        for (let i = 0; i < products.length; i++) {
            const price = products[i].price;
            const discount = price - (price * off / 100).toFixed(0);

            await Product.findOneAndUpdate(
                { _id: products[i]._id },
                {
                    $set: {
                        price: discount,
                        oldPrice: price,
                        isOffer: true
                    }
                }
            );
        }
        await Category.findOneAndUpdate({name:category},{$set:{isOffer:true}})

        res.redirect('/admin/allCategory');
    } catch (error) {
        console.log(error.message);
    }
};

const removeCategoryOffer = async(req,res)=>{
    try {

        const category = req.query.name
        const products = await Product.find({category:category})

        for (let i = 0; i < products.length; i++) {
            const price = products[i].oldPrice;

            await Product.findOneAndUpdate(
                { _id: products[i]._id },
                {
                    $set: {
                        price: price,
                        oldPrice: price,
                        isOffer: false
                    }
                }
            );
        }
        await Category.findOneAndUpdate({name:category},{$set:{isOffer:false}})

        res.redirect('/admin/allCategory');

        


        
    } catch (error) {
        console.log(error.message)
    }
}



module.exports = {
    
loadProductOffer,
loadAddProductOffer,
postAddProductOffer,
loadapplyProductOffer,
postProductOffer,
removeProductOffer,
loadApplyCatOffer,
postCategoryOffer,
removeCategoryOffer

}