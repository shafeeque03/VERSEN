const User = require("../models/userModel");
const Product = require("../models/productModel");
const Cart = require("../models/cartModel");
const Address = require("../models/addressModel");
const Coupon = require("../models/couponModel")
const mongoose = require("mongoose");

const loadCart = async (req, res) => {
  try {
    const userId = req.session.user_id;
    const coupons = await Coupon.find()
    const address = await Address.findOne({ user: userId });
    const cartData = await Cart.findOne({ user: req.session.user_id }).populate(
      "products.productId"
    );
    await Cart.findOneAndUpdate({user:req.session.user_id},{$set:{isWallet:false}})
    // console.log(cartData.products);

    let total = 0;
    const discount = req.query.discount

    if (cartData) {
      cartData.products.forEach((product) => {
        total = total + product.price * product.quantity;
      });
      res.render("shopping-cart", {
        session: req.session.user_id,
        cart: cartData,
        total: total,
        coupons,
        address,
        discount
        
      });
    } else {
      res.render("shopping-cart", {
        session: req.session.user_id,
        cart: [],
        total: total,
        coupons,
        address,
      });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const addToCart = async (req, res) => {
  try {
    const productId = req.query.id;
    const userId = await User.findOne({ _id: req.session.user_id });
    const product = await Product.findOne({ _id: productId });
    const totalPrice = product.price;
    const quantity = 1;
    // console.log(totalPrice,"totalPrice",quantity);

    // console.log(productId,"its p_id")

    const cart = await Cart.findOne({ user: userId });

    if (cart) {
      const existProduct = cart.products.find(
        (cartProduct) => cartProduct.productId.toString() == productId
      );

      // console.log(existProduct)
      if (existProduct) {
        // console.log("Running existing product");
        await Cart.findOneAndUpdate(
          {
            user: userId,
            "products.productId": new mongoose.Types.ObjectId(productId),
          },
          {
            $inc: {
              "products.$.quantity": quantity,
              "products.$.totalPrice": totalPrice,
            },
          }
        );
      } else {
        const total = product.price;
        await Cart.findOneAndUpdate(
          { user: userId },
          {
            $push: {
              products: {
                productId: productId,
                quantity: 1,
                price: product.price,
                totalPrice: total,
                PID:789457
              },
            },
          }
        );
      }
    } else {
      const total = product.price;
      const cartData = new Cart({
        user: req.session.user_id,
        products: [
          {
            productId: productId,
            quantity: req.body.quantity,
            price: product.price,
            totalPrice: total,
            PID: 789457
          },
        ],
      });
      const cart = await cartData.save();
    }

    res.redirect("/cart");
  } catch (error) {
    console.log(error.message);
  }
};

const changes = async (req, res) => {
  try {
    const count = req.body.count;
    const cartId = req.body.cartId;
    const productId = req.body.productId;

    // console.log(count, "..", cartId, "..", productId);

    const cart = await Cart.findOne({ user: req.session.user_id });
    const product = await Product.findOne({ _id: productId });

    const cartProduct = cart.products.find(
      (product) => product.productId.toString() == productId
    );

    if (count == 1) {
      if (cartProduct.quantity < product.stock) {
        await Cart.updateOne(
          { user: req.session.user_id, "products.productId": productId },
          {
            $inc: {
              "products.$.quantity": 1,
              "products.$.totalPrice": product.price,
            },
          }
        );
        res.json({ success: true });
      } else {
        res.json({
          success: false,
          message: `The maximum quantity available for this product is ${product.stock} . Please adjust your quantity.`,
        });
      }
    } else if (count == -1) {
      if (cartProduct.quantity > 1) {
        await Cart.updateOne(
          { user: req.session.user_id, "products.productId": productId },
          {
            $inc: {
              "products.$.quantity": -1,
              "products.$.totalPrice": -product.price,
            },
          }
        );
        res.json({ success: true });
      } else {
        res.json({
          success: false,
          message: "Cannot decrement the quantity anymore",
        });
      }
    } else {
      res.json({ success: false, message: "Invalid count value" });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const deleteCart = async(req,res)=>{
  try {

    const product =  req.query.id
    const cartData = await Cart.findOne({user:req.session.user_id})

    if(cartData.products.length==1){
      await Cart.deleteOne({user:req.session.user_id})
      res.redirect('/cart')
    }else{
      await Cart.updateOne({ user: req.session.user_id },
        { $pull: { products: { _id: product } } })
      res.redirect('/cart')

    }
    
  } catch (error) {
    console.log(error.message)
  }
}

module.exports = {
  loadCart,
  addToCart,
  changes,
  deleteCart
};
