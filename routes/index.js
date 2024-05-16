const express = require('express');
const router = express.Router();
const session = require('express-session')
const userControl = require('../controllers/userController')
const auth = require('../middlewares/auth')
const multer = require("multer");
const path = require("path");
const stroage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../public/images"));
  },
  filename: function (req, file, cb) {
    const name = Date.now() + "-" + file.originalname;
    cb(null, name);
  },
});

const upload = multer({ storage: stroage });

router.get("/", userControl.login);
// router.get("/clg", userControl.clg);
router.get("/clg",auth.islogin, userControl.Dashboard);
router.get("/downloadReport",auth.islogin, userControl.downloadReport);


router.get("/dteList",auth.islogin, userControl.DteList);
router.get("/export-user",auth.islogin, userControl.exportUser);



router.get("/fillINQ",auth.islogin, userControl.fillINQ);
router.post("/counsil", userControl.counsil);
router.get("/registrationForm",auth.islogin, userControl.registrationForm);
router.post("/registrationFrom", userControl.registrationData);
router.get("/viewreg/:id",auth.islogin, userControl.viewFullRegistration);
router.get("/editreg/:id",auth.islogin, userControl.editRegistration);
router.get("/registration/:id",auth.islogin, userControl.registrationFormF);
router.post("/edit-user-inq", userControl.updateInquiry);

router.post("/edit-user-reg", userControl.updateRegistration);

router.get("/leaveForm",auth.islogin, userControl.leaveForm);
router.post("/leaveForm", userControl.leaveLoad);

router.post("/updatestatusinq/:id", userControl.updatestatusinq);

router.post(
  "/updatestatus/:id",
  userControl.updatestatusdte
);


router.get('/register',auth.islogout, userControl.loadRegister)
router.post("/register", userControl.createUser);
router.get('/verify', userControl.verifyMail)
router.get("/login", userControl.login);
router.post('/login',userControl.verifyLogin)
router.get("/users/home", auth.islogin, userControl.home);
router.get("/home", auth.islogin, userControl.home);
router.get('/logout', auth.islogin, userControl.userlogout)
// password reset
router.get('/forgot',auth.islogout,userControl.forgotLoad)
router.post("/forgot",userControl.forgotverify);
router.get('/forgot-password',auth.islogout,userControl.forgotPassword)
router.post("/forgot-password", userControl.ResetPassword);

router.get('/verification',userControl.verification)
router.post("/verification", userControl.sendVerification);

router.get('/editinq/:Id',auth.islogin,userControl.editload)
router.post('/edit', upload.single('image'), userControl.updateProfile)

router.get("/view/:id", userControl.viewFullInquiry);


router.get("/editinq/:Id", auth.islogin, userControl.editload);
router.post("/edit", upload.single("image"), userControl.updateProfile);

router.get("/print/:Id", userControl.printForm)


// router.get("*", (req, res) => {
//   res.redirect("/clg");
// });



module.exports = router;
