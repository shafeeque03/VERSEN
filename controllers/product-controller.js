const Category = require('../models/categoryModel')
const Product = require('../models/productModel')
const fs = require('fs')
const path = require('path')
const sharp = require('sharp')

const loadProduct = async (req, res) => {
    try {
        let page = 1;

        if (req.query.page) {
            page = parseInt(req.query.page); // Ensure the page is a number
            if (isNaN(page) || page < 1) {
                return res.status(400).send("Invalid page number");
            }
        }

        const limit = 7;
        let query = {}; // Default query

        // Check if a search query parameter is provided
        if (req.query.search) {
            const searchQuery = req.query.search;
            query = {
                $or: [
                    { name: { $regex: searchQuery, $options: "i" } }, // Case-insensitive search on product name
                ]
            };
        }

        const product = await Product.find(query)
            .limit(limit)
            .skip((page - 1) * limit)
            .exec();

        const count = await Product.countDocuments(query);
        const totalPages = Math.ceil(count / limit);

        res.render('allProducts', {
            product,
            totalPages,
            currentPage: page,
            searchQuery: req.query.search // Pass the search query to the view
        });

    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal Server Error");
    }
};


const loadAddProducts = async(req,res)=>{
    try {

        const categoryList = await Category.find()

        res.render('addProduct',{categories:categoryList})
        
    } catch (error) {
        console.log(error.message)
    }
}

const addProduct = async(req,res)=>{
    try {
        const price = req.body.price
        const stock = req.body.stock


        var image=[]
        if(req.files && req.files.length > 0){
            for(let i=0;i<req.files.length;i++){
                const filePath = path.join(
                __dirname,
                "../public/adminAssets/cropped",
                req.files[i].filename
                )
               await sharp(req.files[i].path)
               .resize({width:250, height:250})
               .toFile(filePath);
               image.push(req.files[i].filename)
            }
        }

        const category = await Category.find({is_delete:0})

        if( price> 0 && stock > 0){
            
            const existProduct = await Product.findOne({name:req.body.name})
            if(existProduct){
                res.render('addProduct',{message:"Product already exists", categories:category})
            }else{
                const product = new Product({
                    name:req.body.name,
                    price:price,
                    stock:stock,
                    description:req.body.description,
                    image: image,
                    category:req.body.category
                })
                const newProduct =  product.save()

                if(newProduct){
                    res.redirect('/admin/allProducts')
                }else{
                    res.render('addProduct',{message:"Something went wrong"})
                }
            }
        }else{
            res.render('addProduct',{message:"Cannot give a negative value",categories:category})
        }
        
    } catch (error) {
        console.log(error.message)
    }
}

const unlistProduct = async(req,res)=>{
    try {

        const id =req.query.id
        await Product.findByIdAndUpdate({_id:id},{$set:{is_delete:0}})
        res.redirect('/admin/allProducts')
        
    } catch (error) {
        console.log(error.message)
    }
}

const listProduct = async(req,res)=>{
    try {

        const id =req.query.id
        await Product.findByIdAndUpdate({_id:id},{$set:{is_delete:1}})
        res.redirect('/admin/allProducts')
        
    } catch (error) {
        console.log(error.message)
    }
}

const loadEditProduct = async(req,res)=>{
    try {
        const id = req.query.id
        const category = await Category.find({is_delete:0})
        const product = await Product.findById({_id:id})
        res.render('editProduct',{categories:category,product})
        
    } catch (error) {
        console.log(error.message)
    }
}


const editProduct = async (req, res) => {
    try {
        var images = [];

        if (req.files && req.files.length > 0) {
            for (let i = 0; i < req.files.length; i++) {
                images.push(req.files[i].filename);
            }
        }

        const id = req.body.id;
        const newName = req.body.name;
        const newPrice = req.body.price;
        const newDescri = req.body.description;
        const newCat = req.body.category;
        const newStock = req.body.stock;

        const imageUpdate = await Product.findOneAndUpdate(
            { _id: id },
            { $push: { image: { $each: images } } }
        );

        if (!imageUpdate) {
            // Handle the case when image update fails (optional)
            console.log('Failed to update images.');
        }

        const editedProduct = await Product.findOneAndUpdate(
            { _id: id },
            {
                $set: {
                    name: newName,
                    price: newPrice,
                    description: newDescri,
                    category: newCat,
                    stock: newStock
                }
            }
        );

        if (editedProduct) {
            res.redirect('/admin/allProducts');
        } else {
            res.render('editProduct', { message: 'something went wrong !!' });
        }

    } catch (err) {
        console.log(err.message);
        res.render('editProduct', { message: 'something went wrong !!' });
    }
};

const deleteImage = async (req, res) => {
    try {

        const id = req.params.id
        const image = req.params.image
        console.log(id,"This is is")
        console.log(image,"This is img")

        fs.unlink(path.join(__dirname, '../public/adminAssets/productImages', image), () => { })
        const deleImg = await Product.updateOne({ _id: id }, { $pull: { image: image } })

        if (deleImg) {
            res.redirect(`/admin/editProduct?id=${id}`)
        }

    } catch (err) {
        console.log(err.message);
    }
}



module.exports = {
    loadProduct,
    loadAddProducts,
    addProduct,
    unlistProduct,
    listProduct,
    loadEditProduct,
    editProduct,
    deleteImage
}