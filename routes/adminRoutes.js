const express = require("express");
const router = express.Router();
const session = require('express-session')
const config = require('../config/config')
const AdminController = require('../controllers/adminController')

const adminAuth = require('../middlewares/adminAuth')
const multer = require("multer");
const stroage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/uploads");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage: stroage });


router.get('/',adminAuth.islogout,AdminController.loadLogin)

router.post("/login", adminAuth.islogout, AdminController.verifyUser);
router.get('/home',adminAuth.islogin,AdminController.loadDashboard)
router.get('/logout', adminAuth.islogin, AdminController.logout)
router.get("/forgot",adminAuth.islogout, AdminController.forgotLoad);
router.post("/forgot", AdminController.forgotVerify);
router.get("/forgot-password",adminAuth.islogout, AdminController.forgotPasswordLoad);
router.post("/forgot-password", AdminController.resetPassword);


router.get('/new-user', adminAuth.islogin, AdminController.newUser)
router.post("/new-user", AdminController.addUser);

//actions edit
router.get('/edit-user',adminAuth.islogin,AdminController.editUserLoad)
router.post("/edit-user", AdminController.updateUserLoad);

router.get("/delete-user", adminAuth.islogin, AdminController.deleteUserLoad);

router.get("/exportcounsil",adminAuth.islogin, AdminController.exportcounsil);

router.get("/export-user", adminAuth.islogin, AdminController.exportUser);
router.get("/exportcounsilPDF", AdminController.exportcounsilPDF);

router.get("/export-user-pdf", adminAuth.islogin, AdminController.exportUserPdf);


router.get("/importData",adminAuth.islogin, AdminController.importData);

router.post("/importData", upload.single("file"), AdminController.dataImport);


router.get("/inquiryDetails",adminAuth.islogin,AdminController.inquiryDetails);
router.get("/view/:id",adminAuth.islogin, AdminController.viewFullInquiry)
router.get("/edit/:id",adminAuth.islogin, AdminController.editInquiry);
router.post("/edit-user-inq", AdminController.updateInquiry);

router.get("/delete/:id",adminAuth.islogin, AdminController.deleteInquiry);
router.get("/teachersTable",adminAuth.islogin, AdminController.teachersTable);
router.get("/registrationData",adminAuth.islogin, AdminController.registrationDetails);


router.get("/fillINQ",adminAuth.islogin, AdminController.fillINQ);
router.post("/counsil", AdminController.counsil);
router.get("/viewreg/:id",adminAuth.islogin, AdminController.viewFullRegistration);
router.get("/editreg/:id", adminAuth.islogin,AdminController.editRegistration);
router.post("/edit-user-reg", AdminController.updateRegistration);



router.get("/registrationFormN",adminAuth.islogin, AdminController.registrationFormN);
router.get("/registration/:id",adminAuth.islogin, AdminController.registrationForm);
router.post("/registration", AdminController.registrationData);
router.get("/logs",adminAuth.islogin, AdminController.logs);

router.get("/numberReport",adminAuth.islogin, AdminController.ReportNumber);
router.post("/numberReport",AdminController.numberReport);


router.get("/print/:Id",adminAuth.islogin, AdminController.printForm);

router.get("/pendingForm",adminAuth.islogin, AdminController.pendingForm)
router.post("/updatestatus/:Id", AdminController.updatestatus);

router.get("/inquiryReports",adminAuth.islogin, AdminController.inquiryReports)
router.get("/registerReports",adminAuth.islogin, AdminController.registerReports);
router.get("/facultyLeave",adminAuth.islogin, AdminController.facultyLeave);
router.get("/dteList",adminAuth.islogin, AdminController.dteList);


router.get('*', (req, res) => {
    res.redirect('/admin')
})










module.exports = router;