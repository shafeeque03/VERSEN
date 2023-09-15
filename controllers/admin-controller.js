const User = require('../models/userModel')
const bcrypt = require('bcrypt')
const Order = require('../models/orderModel')
const axios = require('axios')


const loadDashboard = async (req , res) => {
    try {

        const usersData = await User.find({is_admin:0})
        const usersCount = await User.find({is_admin:0}).count()
        const orderCount = await Order.find().count()
        const orders = await Order.find({});
        const jeans = [1049,  420,  419,  2584, 10390,
        624, 1049,  125, 7900,  1399,
        312,  312, 2098,  599,  1811,
        911,  698,  587,]
        const trousers = [5989,  599,  5899,  6587, 3006,
          624, 1049,  125, 7900,
          125, 2098, 6895, 3249,   10898]
          const tshirts = [3658,  2589,  8954,  899, 3006,
            624, 1049,  125, 7900,  1399,
            312,  312, 518,  599,  1811,
            911,  789,  911,  690,  1899,
            125, 2098, 6895]
            const hoodies = [499,  7777,  2566,  1565, 3006,
              624, 1049,  125, 7900]

        const today = new Date();
        const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(today.getDate()-7);
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(today.getFullYear()-1);

        const dailyOrders = orders.filter(order => order.date >= startOfToday);
        const weeklyOrders = orders.filter(order => order.date >= oneWeekAgo);
        const yearlyOrders = orders.filter(order => order.date >= oneYearAgo);

        const dailySalesData = dailyOrders.map(order => order.totalAmount);
        const weeklySalesData = weeklyOrders.map(order => order.totalAmount);
        const yearlySalesData = yearlyOrders.map(order => order.totalAmount);

        

        const totalDailyEarnings = dailyOrders.reduce((sum, order)=> sum + order.totalAmount, 0)
        const totalWeeklyEarnings = weeklyOrders.reduce((sum, order)=> sum + order.totalAmount, 0)
        const totalYearlyEarnings =  yearlyOrders.reduce((sum, order)=> sum + order.totalAmount, 0)


        const totalEarnings = orders.reduce((sum, order) => sum + order.totalAmount, 0);
        const categoryData = await Order.aggregate([
          {
              $unwind: '$products'
          },
          {
              $group: {
                  _id: '$products.productId.category',
                  totalOrders: { $sum: 1 }
              }
          }
      ]);
        // console.log(categorySalesData)

        const categoryNames = categoryData.map((item) => item._id); // Assuming _id represents category names
        const categorySales = categoryData.map((item) => item.totalSales);
        
        res.render('dashboard',{
            users:usersData,
            usersCount,
            orderCount,
            totalEarnings,
            totalDailyEarnings,
            totalWeeklyEarnings,
            totalYearlyEarnings,
            dailySalesData,
            weeklySalesData,
            yearlySalesData,
            categoryNames,
            categorySales,
            jeans,
            trousers,
            tshirts,
            hoodies
            
        });
        
    } catch (err) {
        console.log(err.message);
    }
}

const searchUsers = async (req, res) => {
    try {
      const search = req.query.search || "";
      const regex = new RegExp(`^${search}`, "i");
  
      const admin = await User.findById(req.session.admin_id);
  
      const user = await User.find({
        $or: [
          { name: { $regex: regex } },
          { email: { $regex: regex } },
        ],
      });
  
      res.render("allUser", {
        admin: admin,
        user: user,
        searchValue: search,
      });
    } catch (error) {
      console.log(error.message);
      res.status(500).send("An error occurred.");
    }
  };

  
  const loadUserDetails = async (req, res) => {
    try {
        let page = 1;

        if (req.query.page) {
            page = parseInt(req.query.page); // Ensure the page is a number
            if (isNaN(page) || page < 1) {
                return res.status(400).send("Invalid page number");
            }
        }

        const limit = 6;
        let query = { is_admin: 0 }; // Default query for non-admin users

        // Check if a search query parameter is provided
        if (req.query.search) {
            const searchQuery = req.query.search;
            query = {
                $and: [
                    { is_admin: 0 },
                    {
                        $or: [
                            { username: { $regex: searchQuery, $options: "i" } }, // Case-insensitive search on username
                            { email: { $regex: searchQuery, $options: "i" } } // Case-insensitive search on email
                        ]
                    }
                ]
            };
        }

        const userData = await User.find(query)
            .limit(limit)
            .skip((page - 1) * limit)
            .exec();

        const count = await User.countDocuments(query);
        const totalPages = Math.ceil(count / limit);

        res.render('allUser', {
            users: userData,
            totalPages,
            currentPage: page,
            searchQuery: req.query.search // Pass the search query to the view
        });

    } catch (err) {
        console.error("Error:", err);
        res.status(500).send("Internal Server Error");
    }
};




const loadLogin = async (req , res) => {
    try {
      const message = req.query.message

        res.render('aLogin',{message})
        
    } catch (err) {
        console.log(err.message);
    }
}

const verifyLogin = async(req , res) => {
    try {

        const email = req.body.email
        const password = req.body.password

        const userData = await User.findOne({email : email})

        if(userData) {
            const mpassword = await bcrypt.compare(password , userData.password)

            if(mpassword) {
                if(userData.is_admin == 1) {
                    req.session.admin_id = userData._id
                    res.redirect('/admin/dashboard')
                }else{
                  res.redirect('/admin?message=Email+or+password+incorrect');
                }
            }else{
              res.redirect('/admin?message=Email+or+password+incorrect');

            }
        }else{
          res.redirect('/admin?message=Email+or+password+incorrect');

        }
        
    } catch (err) {
        console.log(err.message);
    }
}

// const deleteUser = async (req , res) => {
//     try {

//         const id = req.query.id
//         await User.deleteOne({ _id : id})
//         res.redirect('/admin/user')
        
//     } catch (err) {
//         console.log(err.message);
//     }
// }

const blockUser = async (req , res) => {
    try {

        const id = req.query.id
        await User.findOneAndUpdate({ _id : id} , {$set : { is_blocked : 1, is_verified:0 }})
        res.redirect('/admin/allUser')
        
    } catch (err) {
        console.log(err.message);
    }
}

const unblockUser = async (req , res) => {
    try {

        const id = req.query.id
        await User.findOneAndUpdate({ _id : id } , {$set : { is_blocked : 0, is_verified:1}})
        res.redirect('/admin/allUser')

    } catch (err) {
        console.log(err.message);
    }
}

const logout = async (req , res) => {
    try {

        req.session.destroy()
        res.redirect('/admin')
        
    } catch (err) {
        console.log(err.message);
    }
}

const userOrders = async(req,res)=>{
    try {

        const userId = req.query.id
        // console.log(userId);
        const orders = await Order.find({user:userId}).populate('products.productId')
        // console.log(orders)  
        res.render('userOrders',{orders})
        
    } catch (error) {
        console.log(error.message)
    }
}

const userOrderDetails = async(req,res)=>{
    try {

        const orderId = req.query.id
        const orderData = await Order.findOne({ _id: orderId }).populate('products.productId')
        // console.log(orderData);
        res.render('userOrderDetails', { session: req.session.user_id, order: orderData })
        
    } catch (error) {
        console.log(error.message)
    }
}

const adminCancelOrder = async(req,res)=>{
    try {

        const param = req.body.param
        const id = req.body.crId
        const user = req.body.user
        // console.log(user)
        

        const orderData = await Order.findOne({'products._id':id})
        const product = orderData.products.find((product) => product._id.toString()==id)

        const cancel = await Order.findOneAndUpdate({user:user, 'products._id':id},{
            $set:{
                'products.$.status': 'cancelled',
            }
        })

        if(cancel){
            res.json({success: true, param})
        }else{
            res.json({success: false})
        }


    } catch (error) {
        console.log(error.message)
    }
}

const loadSalesReport = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 15;
    const totalOrders = await Order.countDocuments();
    const totalPages = Math.ceil(totalOrders / limit);
    const message = req.query.message;
    
    // Sort orders by date in descending order
    const orders = await Order.find()
      .sort({ date: -1 }) // Assuming 'date' is the field you want to sort by
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("products.productId");

    res.render("salesReport", { orders, totalPages, req, axios, message, page });
  } catch (error) {
    console.log(error.message);
  }
};


  const datewiseReport = async (req, res) => {
    try {
      const message = ""
      const { startDate, endDate } = req.body;
  
      // Validate the date range on the server-side
      if (!startDate || !endDate || startDate > endDate) {
        return res.status(400).json({ error: "Invalid date range" });
      }
  
      const selectedDate = await Order.aggregate([
        {
          $match: {
            createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) },
          },
        },
        {
          $unwind: "$products",
        },
        {
          $lookup: {
            from: "products",
            localField: "products.productId",
            foreignField: "_id",
            as: "productDetails",
          },
        },
        {
          $unwind: "$productDetails",
        },
        {
          $project: {
            _id: 0, // Exclude _id field from the result
            orderID: "$_id",
            productID: "$products.productId",
            productName: "$productDetails.name",
            productPrice: "$productDetails.price",
            productQuantity: "$products.quantity",
            paymentMethod: "$method",
            total: { $multiply: ["$productDetails.price", "$products.quantity"] },
            date: "$date",
            status: "$status",
          },
        },
      ]);
  
      res.status(200).json({ selectedDate,message });
    } catch (error) {
      console.error(error.message);
    }
  };
  
  module.exports = { datewiseReport };
  

  const deliver = async(req,res)=>{
    try {
        
        const id = req.body.id
        console.log(id)
        const order = await Order.findOne({'products._id':id})

        await Order.findOneAndUpdate({'products._id':id},
        {$set:{"products.$.status":"delivered"}}
        )
        res.json({success: true})

    } catch (error) {
        console.log(error.message)
    }
  }

  const sortSalesReport = async (req, res,next) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = 100


      let fromDate = req.body.fromDate ? new Date(req.body.fromDate) : null;
      fromDate.setHours(0, 0, 0, 0);
      const message = "Enter date properly!!!";
      let toDate = req.body.toDate ? new Date(req.body.toDate) : null;
      toDate.setHours(23, 59, 59, 999);
      const n = ""
      

      const currentDate = new Date();

      if (fromDate && toDate) {
        if (toDate < fromDate) {
          res.redirect(`/admin/salesReport?message=${message}`)

        }
      } else if (fromDate) {
        res.redirect(`/admin/salesReport?message=${message}`)

      } else if (toDate) {
        res.redirect(`/admin/salesReport?message=${message}`)

      }
// console.log("/n/n$");
//    console.log(toDate,fromDate);
      var matchStage = {
      
        'products.status': 'delivered'
      };

      const totalAmount = await Order.aggregate([  {
        $match: {

        
          expectedDelivery: { $gte: fromDate, $lte: toDate },
        },
      },
        { $unwind: '$products' },
        { $match: matchStage }, // This is where you would put your additional matching criteria if needed
        {
          $group: {
            _id: null,
            total: { $sum: '$products.total' }
          }
        }
      ]);
      

      const totalSold = await Order.aggregate([
        {
          $match: {
  
          
            expectedDelivery: { $gte: fromDate, $lte: toDate },
          },
        },
        { $unwind: '$products' },
        { $match: matchStage },
        { $group: { _id: null, total: { $sum: '$products.quantity' } } },
        { $project: { total: 1, _id: 0 } },
      ]);

     
      const product = await Order.find({ expectedDelivery: { $gte: fromDate, $lte: toDate },"products.status": 'delivered' }).populate('products.productId').populate('user')
      const count = product.length
      const totalPages = Math.ceil(count / limit);

      // console.log('hai');
      // console.log( totalAmount,
      //   totalSold, 
      //   product);
      res.render('salesReport', {
        totalAmount,
        totalSold,
        message,
        orders:product,
        message:n,
        page,
        totalPages
      })
      
    } catch (err) {
      console.log((err.message));
    }
  };

  const sort = async (req , res , next) => {
    try {

        const range = req.body.dateRange
        console.log(range);
        const fromDate = new Date();
        const one = 1;
        const toDate = new Date(fromDate.getTime() - range * 24 * 60 * 60 * 1000);

        var matchStage = {
            'products.status': 'delivered',
            'products.quantity' : { $gte: one },
          };
      
          const totalAmount = await Order.aggregate([
            { $unwind: '$products' },
            { $match: matchStage },
            { $group: { _id: null, total: { $sum: '$products.totalPrice' } } },
          ]);
    
          const totalSold = await Order.aggregate([
            { $unwind: '$products' },
            { $match: matchStage },
            { $group: { _id: null, total: { $sum: '$products.quantity' } } },
            { $project: { total: 1, _id: 0 } },
          ]);
    
          const product = await Order.aggregate([
            { $match: matchStage },
            { $unwind: '$products' },
            { $match: { 'products.status': 'delivered' }},
            { $lookup: {
                from: 'products', 
                localField: 'products.productId',
                foreignField: '_id',
                as: 'products.productData',
              },
            },
            { $unwind: '$products.productData' },
            { $lookup: {
                from: 'users',
                localField: 'user',
                foreignField: '_id',
                as: 'userDetails',
              },
            },
            { $unwind: '$userDetails' },
          ]);
    
          res.render('salesReport', { 
            totalAmount,
            totalSold,
            orders:product
          });
        
    } catch (err) {
        next(err.message)
    }
  }

  const loadAllOrders = async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = 10;
      const totalOrders = await Order.countDocuments();
      const totalPages = Math.ceil(totalOrders / limit);
      const message = req.query.message;
      const orders = await Order.find()
        .sort({date:-1})
        .skip((page - 1) * limit)
        .limit(limit)
        .populate("products.productId");
  
      res.render("orders", { orders, totalPages, req, message, page });
    } catch (error) {
      console.error("Error loading orders:", error);
      res.status(500).send("Error loading orders.");
    }
  };


  const details = async(req,res)=>{
    try {

      const id = req.query.id

      const order = await Order.findOne({_id:id}).populate('products.productId')

      console.log(order,"order")
      const userId = order.user
      const user = await User.findOne({_id:userId})
      console.log(user,"user")

      res.render('Odetails',{order,user})
      
    } catch (error) {
      console.log(error.message)
    }
  }

  const adminDeliver = async(req,res)=>{
    try {
        
        const cid = req.query.cid
        const id = req.query.id
        console.log(id)
        const order = await Order.findOne({'products._id':cid})

        await Order.findOneAndUpdate({'products._id':cid},
        {$set:{"products.$.status":"delivered"}}
        )
        res.redirect(`/admin/details?id=${id}`)


    } catch (error) {
        console.log(error.message)
    }
  }
  










module.exports = {
    loadDashboard,
    loadLogin,
    verifyLogin,
    blockUser,
    unblockUser,
    logout,
    loadUserDetails,
    searchUsers,
    userOrders,
    userOrderDetails,
    adminCancelOrder,
    loadSalesReport,
    datewiseReport,
    deliver,
    sortSalesReport,
    sort,
    loadAllOrders,
    details,
    adminDeliver
    
}