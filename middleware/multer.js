const multer = require('multer')
const path = require('path')

const storage = multer.diskStorage({
    
    destination : function (req , file , cb) {
    console.log(1);

        cb(null , path.join(__dirname , '../public/adminAssets/productImages') , function (err , success) {
            if(err) {
                console.log(err);
                throw err
            }
        });
    },

    filename : function (req , file , cb) {
    console.log(2);

        const name = Date.now() + '-' + file.originalname
        cb(null , name , function (err , success) {
            if(err) {
                console.log(err);

                throw err
            }
        });
    }
});

const imageFilter = function (req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png|webp)$/)) {
      req.fileValidationerror = 'Only image files are allowed!';
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  }

const upload = multer({ storage : storage , fileFilter : imageFilter})

module.exports = upload