// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, '../../front/public/media')
//     },
    
//     filename: function (req, file, cb) {
//         cb(null, file.originalname)
//     }
// });
// const fileFilter = (req,file,cb) => {
//     if(file.mimetype === "image/jpg"  || 
//        file.mimetype ==="image/jpeg"  || 
//        file.mimetype ===  "image/png"){
     
//     cb(null, true);
//    }else{
//       cb(new Error("Image uploaded is not of type jpg/jpeg or png"),false);
// }
// }

// export const upload = multer({storage: storage, fileFilter : fileFilter});