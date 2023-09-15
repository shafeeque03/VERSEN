const Category = require('../models/categoryModel');

const loadCategory = async(req,res)=>{
    try {

        const categoryList = await Category.find()
        // console.log(categoryList);

        res.render('allCategory',{categories:categoryList})
        
    } catch (error) {
        console.log(error.message)
    }
}

const loadAddCategory = async(req,res)=>{
    try {

        res.render('addCategory')
        
    } catch (error) {
        console.log(error.message)
    }
}

const addCategory = async(req,res)=>{
    try {
        const categoryList = await Category.find()
        const existCat = req.body.category_name
        const existCategory = await Category.findOne({name:{ $regex : `^${existCat}` , $options : 'i' }})

        if(existCategory){
            res.render('allCategory',{categories:categoryList,message:'Category already exists'})
        }else{
            const category = new Category({
                name: req.body.category_name
            })

            const newCategory = await category.save()

            if(newCategory){
                res.redirect('/admin/allCategory')
            }
        }

        
    } catch (error) {
        console.log(error.message)
    }
}

const loadEditCategory = async(req,res)=>{
    try {

        const id = req.query.id
        const editCat = await Category.findById({_id:id})

        if(editCat){
            res.render('editCategory',{category:editCat})
        }else{
            res.redirect('/admin/allCategory')
        }
        
    } catch (error) {
        console.log(error.message)
    }
}

const editCategory = async(req,res)=>{
    try {
        
        const catName = req.body.categoryName
        const catId = req.body.id
        const editCat = await Category.findById({_id:catId})

        const existCategory = await Category.findOne({name:{ $regex : `^${catName}` , $options : 'i' }})

        if(existCategory){
            res.render('editCategory',{category:editCat,message:"Category already exist"})
        }else{
        const updateCategory = await Category.findByIdAndUpdate({_id:catId},{$set:{name:catName}})
        res.redirect('/admin/allCategory')
        }


        
        
    } catch (error) {
        console.log(error.message)
    }
}

const unlistCategory = async(req,res)=>{
    try {

        const id =req.query.id
        await Category.findByIdAndUpdate({_id:id},{$set:{is_delete:0}})
        res.redirect('/admin/allCategory')
        
    } catch (error) {
        console.log(error.message)
    }
}

const listCategory = async(req,res)=>{
    try {

        const id =req.query.id
        await Category.findByIdAndUpdate({_id:id},{$set:{is_delete:1}})
        res.redirect('/admin/allCategory')
        
    } catch (error) {
        console.log(error.message)
    }
}




module.exports = {
    loadCategory,
    loadAddCategory,
    addCategory,
    loadEditCategory,
    editCategory,
    unlistCategory,
    listCategory
}