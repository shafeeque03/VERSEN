const Wishlist = require('../models/wishlistModel')

const Swal = require('sweetalert2')

const loadWishlist = async (req, res, next) => {
    try {

        const wishlist = await Wishlist.findOne({ user: req.session.user_id }).populate('products.productId')
        res.render('wishlist', { session: req.session.user_id, wish: wishlist })

    } catch (err) {
        next(err.message)
    }
}

const addToWishlist = async (req, res) => {
  try {
    const product = req.query.id;
    const userId = req.session.user_id;

    const wishData = await Wishlist.findOne({ user: userId });

    if (wishData) {
      const wishProducts = wishData.products;
      const existProduct = wishProducts.find((p) => p.productId.toString() === product);

      if (existProduct) {

        res.redirect('/wishlist');
        
      } else {
        await Wishlist.findOneAndUpdate({ user: userId }, { $push: { products: { productId: product } } });

        res.redirect('/wishlist');
      }
    } else {
      const wishlist = new Wishlist({
        user: userId,
        products: [
          {
            productId: product,
          },
        ],
      });

      const newWish = await wishlist.save();
      if (newWish) {
        res.redirect('/wishlist');
      }
    }
  } catch (error) {
    console.error(error.message);
  }
};


const deleteWishlist = async(req,res)=>{
    try {

        const productId = req.query.id
        const wishData = await Wishlist.findOne({user:req.session.user_id})

        if(wishData.products.length==1){
            await Wishlist.deleteOne({user:req.session.user_id})
            res.redirect('/wishlist')
        }else{
            await Wishlist.findOneAndUpdate({user:req.session.user_id},{
                $pull:{products:{productId:productId}}   
            })
            res.redirect('/wishlist')
        }
        
    } catch (error) {
        cosnole.log(error.message)
    }
}

module.exports = {
    loadWishlist,
    addToWishlist,
    deleteWishlist
}