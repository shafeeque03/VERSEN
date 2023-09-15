const Address = require('../models/addressModel')

const loadAddress = async(req,res)=>{
    try {

        const userId = req.session.user_id
        const address = await Address.findOne({user:userId})
        
        res.render('address',{address})

    } catch (error) {
        console.log(error.message)
    }
}

const loadAddAddress = async(req,res)=>{
    try {
        
        res.render('add_address')
        
    } catch (error) {
        console.log(error.message)
    }
}

const postAddAddress = async(req,res)=>{
    try {

        const userId = req.session.user_id

        const address = await Address.findOne({user:userId});

        if(address){
            await Address.updateOne(
                {user:userId},
                {
                    $push:{
                        addresses:{
                            fname:req.body.fname,
                            lname:req.body.lname,
                            phone:req.body.phone,
                            address:req.body.address,
                            city:req.body.city,
                            pin:req.body.pin
                        }
                    }
                }
            );
        }else{
            const newAddress = new Address({
                user:userId,
                addresses:[{
                    fname:req.body.fname,
                    lname:req.body.lname,
                    phone:req.body.phone,
                    address:req.body.address,
                    city:req.body.city,
                    pin:req.body.pin
                }]
            });
            await newAddress.save()
        }
        res.redirect('/address')
        
        
    } catch (error) {
        console.log(error.message)
    }
}

const deleteAddress = async(req,res)=>{
    try {

        const id = req.query.id
        const userId = req.session.user_id
        const address = await Address.findOne({user:userId})

        if(address.addresses.length==1){
            const dAddress = await Address.deleteOne({user:userId})
        }else{
            const dAddress = await Address.findOneAndUpdate(
                {user:userId, 'addresses._id':id},
                {$pull:{addresses:{_id:id}}}
            )
        }
        res.redirect('/address')

        
    } catch (error) {
        conosle.log(error.message)
    }
}

const loadEditAddress = async(req,res)=>{
    try {

        const userId = req.session.user_id
        const id = req.query.id

        const addressData = await Address.findOne({user:userId},{addresses:{$elemMatch:{_id:id}}})
        res.render('editAddress', {address:addressData.addresses[0]})
        
    } catch (error) {
        console.log(error.message)
    }
}

const postEditAddress = async(req,res)=>{
    try {

        const UserId = req.session.user_id
        const addressId = req.query.id
        const address = await Address.findOne({user:UserId})
        if(address){
        const data = await Address.updateOne(
            {"addresses._id":addressId},
            {
                $set:{
                    "addresses.$.fname":req.body.fname,
                    "addresses.$.lname":req.body.lname,
                    "addresses.$.phone":req.body.phone,
                    "addresses.$.address":req.body.address,
                    "addresses.$.city":req.body.city,
                    "addresses.$.pin":req.body.pin
                },
            }
        );
    }
        res.redirect('/address')
        
    } catch (error) {
        console.log(error.message)
    }
}

const cAddAddress = async(req,res)=>{
    try {
        const total = req.query.Total
        res.render('cAddAddress',{total})
        
    } catch (error) {
        console.log(error.message)
    }
}

const postCaddAddress = async(req,res)=>{
    try {

        const userId = req.session.user_id
        const total = req.body.total

        const address = await Address.findOne({user:userId});

        if(address){
            await Address.updateOne(
                {user:userId},
                {
                    $push:{
                        addresses:{
                            fname:req.body.fname,
                            lname:req.body.lname,
                            phone:req.body.phone,
                            address:req.body.address,
                            city:req.body.city,
                            pin:req.body.pin
                        }
                    }
                }
            );
        }else{
            const newAddress = new Address({
                user:userId,
                addresses:[{
                    fname:req.body.fname,
                    lname:req.body.lname,
                    phone:req.body.phone,
                    address:req.body.address,
                    city:req.body.city,
                    pin:req.body.pin
                }]
            });
            await newAddress.save()
        }
        res.redirect(`/checkout?Total=${total}`)
        
        
    } catch (error) {
        console.log(error.message)
    }
}

module.exports = {
    
    loadAddress,
    loadAddAddress,
    postAddAddress,
    deleteAddress,
    loadEditAddress,
    postEditAddress,
    cAddAddress,
    postCaddAddress
}