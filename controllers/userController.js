const User = require("../models/userModel");
const counsil = require("../models/counsellingModel");
const registrationModel = require("../models/registrationModel");
const dteList = require('../models/user')
const leaveModel = require("../models/leaveModel");
const moment = require ('moment')
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const dteModel = require("../models/user");
const exceljs = require("exceljs");


const RandomString = require("randomstring");
const config = require("../config/config");


// const cloudinary = require("cloudinary");
// cloudinary.config({
//   cloud_name: "dywvtdtpy",
//   api_key: "655265211765838",
//   api_secret: "mN7DrgpBMlhqLzFxIOreh5gRJFE",
//   secure: false,
// });

const sendVerifyMAail = async (name, email, user_id) => {
  try {
    var transporter = nodemailer.createTransport({
      //   service: "gmail",
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: config.userEmail,
        pass: config.userMailPassword,
      },
    });

    var mailOptions = {
      from: config.userEmail,
      to: email,
      subject: "For verification mail",
      html:
        "Hello," +
        name +
        ',Thank you for registering. Please click the following link to verify your email: <a href="http://localhost:3000/verify?id=' +
        user_id +
        '">verify</a>"If you did not register, please ignore this email.',
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });
  } catch (error) {
    console.log(error.message);
  }
};
class userControl {
  static Dashboard = async (req, res) => {
    try {
      const userData = await User.findOne({ _id: req.session.user_id });

      var searchinq = "";
      if (req.query.searchinq) {
        searchinq = req.query.searchinq;
      }

      const usersinq = await counsil
        .find({
          facultyId: userData._id,

          // multiple searching
          $or: [
            {
              applicantName: { $regex: "^" + searchinq + "$", $options: "i" },
            },
            { applicantNo: { $regex: ".*" + searchinq + ".*", $options: "i" } },
            { mobile: { $regex: "^" + searchinq + "$", $options: "i" } },
            { fatherName: { $regex: "^" + searchinq + "$", $options: "i" } },
            { email: { $regex: "^" + searchinq + "$", $options: "i" } },
            {
              "courses.course": {
                $regex: "^" + searchinq + "$",
                $options: "i",
              },
            },
            {
              "courses.branch": {
                $regex: "^" + searchinq + "$",
                $options: "i",
              },
            },
          ],
        })
        .sort({ _id: -1 })
        .exec();

      // for register

      var searchreq = "";
      if (req.query.searchreq) {
        searchreq = req.query.searchreq;
      }

      const usersreq = await registrationModel
        .find({
          facultyId: userData._id,
          // multiple searching
          $or: [
            { studentName: { $regex: "^" + searchreq + "$", $options: "i" } },
            { applicantNo: { $regex: ".*" + searchreq + ".*", $options: "i" } },
            { mobile: { $regex: "^" + searchreq + "$", $options: "i" } },
            { fatherName: { $regex: "^" + searchreq + "$", $options: "i" } },
            { email: { $regex: "^" + searchreq + "$", $options: "i" } },
            {
              "courses.course": {
                $regex: "^" + searchreq + "$",
                $options: "i",
              },
            },
            {
              "courses.branch": {
                $regex: "^" + searchreq + "$",
                $options: "i",
              },
            },
          ],
        })
        .sort({ _id: -1 })
        .exec();

      res.render("users/clg", {
        usersinq: usersinq,
        usersreq: usersreq,
        user: userData,
      });
    } catch (error) {
      console.log(error.message);
    }
  };
  static downloadReport = async (req, res) => {
    try {
      const userData = await User.findOne({ _id: req.session.user_id });
      res.render("users/download", {
        user: userData,
        message: req.flash("error"),
      });
    } catch (error) {
      console.log(error.message);
    }
  };
  static exportUser = async (req, res) => {
    try {
      const userDetails = await User.findOne({ _id: req.session.user_id });
      var today = new Date().toISOString()
      var start = "";
      var end = "";

      if (req.query.startDate || req.query.endDate ) {
        start = req.query.startDate;
        end = req.query.endDate;
      }
     
      const fileType = req.query.fileType;
      // const date = req.query.date;
      const workBook = new exceljs.Workbook();
      const workSheet = workBook.addWorksheet("my User");
      if (fileType === "enquiry") {
        workSheet.columns = [
          { header: "S.no", key: "s_no" },
          { header: "Applicant No", key: "applicantNo" },
          { header: "Applicant Name", key: "applicantName" },
          { header: "Date of Birth", key: "dob" },
          { header: "Gender", key: "gender" },
          { header: "Mobile", key: "mobile" },
          { header: "Father Name", key: "fatherName" },
          { header: "Guardian Mobile", key: "guardianMobile" },
          { header: "Address", key: "address" },
          { header: "Course", key: "course" },
          { header: "Branch", key: "branch" },
          { header: "Qualifying Degree", key: "qualifyingDegree" },
          { header: "MP Domicile", key: "domicile" },
          { header: "JEE Appearance", key: "jeeAppearance" },
          { header: "State", key: "state" },
          { header: "City", key: "city" },
          { header: "Status", key: "status" },
          { header: "Registration Date", key: "registrationDate" },
          { header: "Enquiry Status", key: "inquiryStatus" },
          { header: "Faculty Name", key: "facultyName" },
        ];
      }
      if (fileType == "dte") {
        workSheet.columns = [
          { header: "S.no", key: "s_no" },
          { header: "Rank", key: "rank" },
          { header: "Marks", key: "marks" },
          { header: "Roll No", key: "rollNo" },
          { header: "Name", key: "name" },
          { header: "Father", key: "father" },
          { header: "Mother", key: "mother" },
          { header: "Eligible Cateogory", key: "eligibleCategory" },
          { header: "Alloted Cateogory", key: "allotedCategory" },
          { header: "Domicile", key: "domicile" },
          { header: "Gender", key: "gender" },
          { header: "Phone No", key: "phoneNo" },
          { header: "EWS", key: "ews" },
          { header: "Status", key: "status" },
          { header: "Admission Date", key: "admissionDate" },
          { header: "Alloted Round", key: "allotedRound" },
          { header: "Branch", key: "branch" },
          { header: "Remark", key: "comment" },
          { header: "Reporting date", key: "reportingDate" },
          { header: "Final Status", key: "finalStatus" },
        ];
      }
      if (fileType == "registration") {
        workSheet.columns = [
          { header: "S.no", key: "s_no" },
          { header: "Applicant No", key: "applicantNo" },
          { header: "Applicant Name", key: "studentName" },
          { header: "Mobile", key: "mobile" },
          { header: "Guardian Mobile", key: "guardianMobile" },
          { header: "Date of Birth", key: "dob" },
          { header: "Gender", key: "gender" },
          { header: "Address", key: "address" },
          { header: "Course", key: "course" },
          { header: "Branch", key: "branch" },
          { header: "Qualifying Degree", key: "qualifyingDegree" },
          { header: "Father Name", key: "fatherName" },
          { header: "Mother Name", key: "motherName" },
          { header: "Father Occupation", key: "occupation" },
          { header: "Email", key: "email" },
          { header: "Cationality", key: "nationality" },
          { header: "Category", key: "category" },
          { header: "State", key: "state" },
          { header: "City", key: "city" },
          { header: "Status", key: "status" },
          { header: "Registration Date", key: "registrationDate" },
          { header: "Enquiry Status", key: "inquiryStatus" },
          { header: "Faculty Name", key: "facultyName" },
        ];
      }
      let counter = 1;
      if (fileType === "enquiry") {
        const userData = await counsil.find({
          facultyId: userDetails._id,
          $or: [
            {
              registrationDate: { $gte: start, $lte: end },
            }, // Assuming 'dateField' is the name of the date field
          ],
        });
        userData.forEach((user) => {
          let branchNumber = 1
          user.s_no = counter;
          user.course = user.courses.course
          user.branch = user.courses.branch.map((elem,idx)=>{
              return `${idx+1 + '. ' + elem }`
          }).join(' ')
          workSheet.addRow(user);
          counter++;
        });
      }
      if (fileType === "registration") {
        const userData = await registrationModel.find({
          facultyId: userDetails._id,

          $or: [
            {
              registrationDate: { $gte: start, $lte: end },
            },
          ],
        });
        userData.forEach((user) => {
          user.s_no = counter;
          workSheet.addRow(user);
          counter++;
        });
      }
      if (fileType === "dte") {
        const userData = await dteModel.find({
          facultyId: userDetails._id,

          $or: [
            // {
            //   admissionDate: { $regex: "^" + search, $options: "i" },
            // },
            // {
            //   currentDate: { $regex: "^" + search, $options: "i" },
            // },
            {
              followUpDate: { $regex: "^" + search, $options: "i" },
            },
            // Assuming 'dateField' is the name of the date field
          ],
        });
        userData.forEach((user) => {
          user.s_no = counter;
          workSheet.addRow(user);
          counter++;
        });
      }

      workSheet.getRow(1).eachCell((cell) => {
        cell.font = { bold: true };
      });

      // res.setHeader(
      //   "Content-Type",
      //   "application/vnd.openxmlformats-officedocument.spreadsheatml.sheet"
      // );

      res.setHeader("Content-Disposition", `attachement; filename=${fileType + today}.xlsx`);

      return workBook.xlsx.write(res).then(() => {
        res.status(200);
      });
    } catch (error) {
      console.log(error.message);
    }
  };

  static updatestatusinq = async (req, res) => {
    try {
      const { comment } = req.body;
      const today = moment().format('DD-MM-YYYY')
      if (comment) {
        const data = await counsil.findByIdAndUpdate(req.params.id, {
          $set: {
            comment: req.body.comment,
            today:today
          },
        });
      }
      //  this.sendMail(name, email, status, comment);
      res.redirect("/clg");
    } catch (error) {
      console.log(error.message);
    }
  };

  static DteList = async (req, res) => {
    try {
      const userData = await User.findOne({ _id: req.session.user_id });
      var searchinq = "";
      if (req.query.searchinq) {
        searchinq = req.query.searchinq;
      }

      const usersinq = await dteList
        .find({
          facultyId: userData._id,
          // multiple searching
          $or: [
            { name: { $regex: "^" + searchinq + "$", $options: "i" } },
            { phoneNo: { $regex: ".*" + searchinq + ".*", $options: "i" } },
            { rollNo: { $regex: "^" + searchinq + "$", $options: "i" } },
            { marks: { $regex: "^" + searchinq + "$", $options: "i" } },
            { rank: { $regex: "^" + searchinq + "$", $options: "i" } },
            { father: { $regex: "^" + searchinq + "$", $options: "i" } },
            { branch: { $regex: "^" + searchinq + "$", $options: "i" } },

          ],
        })
       
        .sort([
          ["currentDate", -1], // Then sorting by currentDate in descending order
          ["marks", -1], // Sorting by marks in descending order
        ])
        .exec();
     
     
      res.render("users/dteList", {
        usersinq: usersinq,
        user: userData,
        
      });
    } catch (error) {
      console.log(error.message);
    }
  };
  static updatestatusdte = async (req, res) => {
    try {
      const today = moment().format('YYYY-MM-DD')
      const { comment, followUpDate, status } = req.body;
      if (comment) {
        const data = await dteList.findByIdAndUpdate(req.params.id, {
          $set: {
            comment: today +': '+req.body.comment,
            followUpDate: req.body.followUpDate,
            finalStatus: req.body.status,
          },
        });
      } else {
        const data = await dteList.findByIdAndUpdate(req.params.id, {
          $set: {
            followUpDate: req.body.followUpDate,
            finalStatus: req.body.status,
          },
        });
      }
      //  this.sendMail(name, email, status, comment);
      res.redirect("/dteList");
    } catch (error) {
      console.log(error.message);
    }
  };
  static fillINQ = async (req, res) => {
    try {
      const userData = await User.findOne({ _id: req.session.user_id });

      res.render("users/fillINQ", {
        user: userData,
        message: req.flash("error"),
      });
    } catch (error) {
      console.log(error.message);
    }
  };
  static registrationForm = async (req, res) => {
    try {
      const userData = await User.findOne({ _id: req.session.user_id });

      res.render("users/registrationForm", {
        user: userData,
        message: req.flash("error"),
      });
    } catch (error) {
      console.log(error.message);
    }
  };
  static registrationFormF = async (req, res) => {
    try {
      const userData = await User.findOne({ _id: req.session.user_id });
      const data = await counsil.findById(req.params.id);

      res.render("users/registrationFormF", { users: data, user: userData });
    } catch (error) {
      console.log(error.message);
    }
  };
  static counsil = async (req, res) => {
    try {
      const userUpData = await User.findOne({ _id: req.session.user_id });
      function getRandomThreeDigitNumber() {
        // Generate a random number between 100 and 999
        return Math.floor(Math.random() * 9000) + 1000;
      }
      const random = getRandomThreeDigitNumber();
      const applicantNo = `090524` + random;

      var today = new Date();
      // Calculate two days before today
      var twoDaysBefore = new Date();
      twoDaysBefore.setDate(today.getDate() - 2);
      var formattedDate = twoDaysBefore.toISOString().split("T")[0];

      const {
        applicantName,
        email,
        mobile,
        guardianMobile,
        dob,
        gender,
        address,
        course,
        branch,
        qualifyingDegree,
        fatherName,
        state,
        city,
        inquirySource,
        status,
        registrationDate,
        facultyName,
        jeeAppearance,
        domicile,
        category,
      } = req.body;

      const userFound = await counsil.findOne({
        $and: [{ applicantName: applicantName }, { mobile: mobile }],
      });
      if (userFound) {
        req.flash("error", "Student Enquiry Found");
        res.redirect("/fillINQ");
      } else {
        if (gender && facultyName) {
          const newData = new counsil({
            facultyId: userUpData._id,
            applicantNo: applicantNo,
            applicantName: applicantName,
            email: email,
            mobile: mobile,
            guardianMobile: guardianMobile,
            dob: dob,
            gender: gender,
            address: address,
            courses: {
              course: course,
              branch: branch,
            },
            qualifyingDegree: qualifyingDegree,
            fatherName: fatherName,
            state: state,
            city: city,
            inquirySource: inquirySource,
            status: status,
            registrationDate: registrationDate,
            inquiryStatus:
              registrationDate < formattedDate ? "pending" : "Approved",
            facultyName: facultyName,
            jeeAppearance: jeeAppearance,
            domicile: domicile,
            category: category,
          });
          const userData = await newData.save();
          res.render("users/view", { view: userData, user: userUpData });
        } else {
          req.flash("error", "Fields are Required");
          res.redirect("/fillINQ");
        }
      }
    } catch (error) {
      console.log(error.message);
    }
  };
  static registrationData = async (req, res) => {
    try {
      const userData = await User.findOne({ _id: req.session.user_id });
      function getRandomThreeDigitNumber() {
        // Generate a random number between 100 and 999
        return Math.floor(Math.random() * 9000) + 1000;
      }
            let branchRoll = [];
            branchRoll.push(req.body.branch);
            const random = getRandomThreeDigitNumber();
            const applicantNo = `090524` + branchRoll[0] + random;
      const dateString = moment().format("YYYY-MM-DD");
      const {
        studentName,
        dob,
        fatherName,
        motherName,
        occupation,
        address,
        gender,
        email,
        nationality,
        category,
        mobile,
        guardianMobile,
        course,
        branch,
        state,
        city,
        degreeName,
        percentage,
        examinationAuthority,
        subjectStream,
        passingYear,
        paymentMode,
        amount,
        receiptNumber,
        receiptDate,
        jeeEnrollmentNumber,
        jeeMarksPercentile,
        jeeRank,
        schemeOpted,
        inquirySource,
        hostel,
        busExeption,
        registrationStatus,
        facultyName,
        referralName,
      } = req.body;
      const userFound = await registrationModel.findOne({
        $and: [{ studentName: studentName }, { mobile: mobile }],
      });
      if (userFound) {
        req.flash("error", "user already found");
        res.redirect("/registrationForm");
      } else {
        if (gender && facultyName) {
          const registerData = new registrationModel({
            facultyId: userData._id,
            applicantNo: applicantNo,
            studentName: studentName,
            dob: dob,
            fatherName: fatherName,
            motherName: motherName,
            occupation: occupation,
            address: address,
            gender: gender,
            email: email,
            nationality: nationality,
            category: category,
            mobile: mobile,
            guardianMobile: guardianMobile,
            courses: {
              course: course,
              branch: branch,
            },
            location: { state: state, city: city },
            qualifyingDegree: {
              degreeName: degreeName,
              percentage: percentage,
              examinationAuthority: examinationAuthority,
              subjectStream: subjectStream,
              passingYear: passingYear,
            },
            registrationFee: {
              paymentMode: paymentMode,
              amount: amount,
              receiptNumber: receiptNumber,
              receiptDate: receiptDate,
            },
            jeeMains: {
              jeeEnrollmentNumber: jeeEnrollmentNumber,
              jeeMarksPercentile: jeeMarksPercentile,
              jeeRank: jeeRank,
            },
            schemeOpted: schemeOpted,
            inquirySource: inquirySource,

            additionDetails: {
              hostel: hostel,
              busExeption: busExeption,
            },
            registrationStatus: registrationStatus,
            registrationDate: dateString,
            facultyName: facultyName,
            referralName: referralName,
          });
          const registeredData = await registerData.save();
          res.render("users/viewFullRegistration", {
            view: registeredData,
            user: userData,
          });
        } else {
          req.flash("error", "Fields are Required");
          res.redirect("/registrationForm");
        }
      }
    } catch (error) {
      console.log(error.message);
    }
  };
  static viewFullInquiry = async (req, res) => {
    try {
      const data = await counsil.findById(req.params.id);
      const userData = await User.findOne({ _id: req.session.user_id });

      res.render("users/view", { view: data, user: userData });
    } catch (error) {
      console.log(error.message);
    }
  };
  static viewFullRegistration = async (req, res) => {
    try {
      const data = await registrationModel.findById(req.params.id);
      const userData = await User.findOne({ _id: req.session.user_id });

      res.render("users/viewFullRegistration", { view: data, user: userData });
    } catch (error) {
      console.log(error.message);
    }
  };
  static editRegistration = async (req, res) => {
    try {
      const data = await registrationModel.findById(req.params.id);
      const userData = await User.findOne({ _id: req.session.user_id });

      res.render("users/editRegistration", { users: data, user: userData });
    } catch (error) {
      console.log(error.message);
    }
  };
  static updateInquiry = async (req, res) => {
    try {
      const userData = await User.findOne({ _id: req.session.user_id });

      const { name, email, mobile } = req.body;
      const updateUser = await counsil.findByIdAndUpdate(
        { _id: req.body.id },
        {
          $set: {
            applicantName: name,
            email: email,
            mobile: mobile,
          },
        }
      );

      res.render("users/view", { view: updateUser, user: userData });
    } catch (error) {
      console.log(error.message);
    }
  };
  static updateRegistration = async (req, res) => {
    try {
      const userData = await User.findOne({ _id: req.session.user_id });
      const { name, email, mobile } = req.body;
      const updateUser = await registrationModel.findByIdAndUpdate(
        { _id: req.body.id },
        {
          $set: {
            studentName: name,
            email: email,
            mobile: mobile,
          },
        }
      );
      res.render("users/viewFullRegistration", {
        view: updateUser,
        user: userData,
      });
    } catch (error) {
      console.log(error.message);
    }
  };
  static loadRegister = async (req, res) => {
    try {
      res.render("users/register");
    } catch (error) {
      console.log(error.message);
    }
  };
  //register route and send mail for verification
  static createUser = async (req, res) => {
    // const imageFile = req.files.image;
    // const imageUpload = await cloudinary.uploader.upload(
    //   imageFile.tempFilePath,
    //   {
    //     folder: "profileImage",
    //   }
    // );
    try {
      const sendVerifyMAail = async (name, email, user_id) => {
        try {
          var transporter = nodemailer.createTransport({
            //   service: "gmail",
            host: "smtp.gmail.com",
            port: 587,
            secure: false,
            requireTLS: true,
            auth: {
              user: config.userEmail,
              pass: config.userMailPassword,
            },
          });

          var mailOptions = {
            from: config.userEmail,
            to: email,
            subject: "For verification mail",
            html:
              "Hello," +
              name +
              ',Thank you for registering. Please click the following link to verify your email: <a href="http://localhost:3000/verify?id=' +
              user_id +
              '">verify</a>"If you did not register, please ignore this email.',
          };

          transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
              console.log(error);
            } else {
              console.log("Email sent: " + info.response);
            }
          });
        } catch (error) {
          console.log(error.message);
        }
      };

      const { password } = req.body;
      const securePassword = await bcrypt.hash(password, 10);

      const newUser = new User({
        name: req.body.name,
        email: req.body.email,
        mobile: req.body.mobile,

        password: securePassword,
        is_admin: 0,
      });
      const userData = await newUser.save();
      if (userData) {
        sendVerifyMAail(req.body.name, req.body.email, userData._id);
        res.render("users/register", {
          message: "you are registered successfully. please verify your mail",
        });
      } else {
        res.render("users/register", {
          message: "your registration has been failed.",
        });
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  //verify user
  static verifyMail = async (req, res) => {
    try {
      const updateInfo = await User.updateOne(
        { _id: req.query.id },
        { $set: { is_verified: 1 } }
      );
      //   console.log(updateInfo);
      res.redirect("/");
    } catch (error) {
      console.log(error.message);
    }
  };

  //login user
  static login = async (req, res) => {
    try {
      res.render("users/login", { message: req.flash("error") });
    } catch (error) {
      console.log(error.message);
    }
  };
  //verify login user
  static verifyLogin = async (req, res) => {
    try {
      const { email, password } = req.body;
      const userData = await User.findOne({
        email: email,
      });
      if (userData) {
        const isMatch = await bcrypt.compare(password, userData.password);
        if (isMatch) {
          if (userData.is_verified === 0 ) {
            req.flash("error", "Please verify your mail.");
            res.redirect("/login");
          }else if(userData.is_admin === 1){
            req.flash("error","This is not a User Account")
            res.redirect("/login");
          }
          
          else {
            req.session.user_id = userData._id;
            res.redirect("/clg");
          }
        } else {
          req.flash("error", "Enter email and password is incorrect");
          res.redirect("/");
        }
      } else {
        req.flash("error", "Enter email and password is incorrect");
        res.redirect("/login");
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  static printForm = async (req, res) => {
    try {
      const user = await registrationModel.findOne({ _id: req.params.Id });
      // console.log(user)
      res.render("users/PrintForm", { data: user });
    } catch (error) {
      console.log(err.message);
    }
  };

  //home
  static home = async (req, res) => {
    try {
      const user = await User.findOne({ _id: req.session.user_id });
      res.render("users/home", { user: user });
    } catch (error) {
      console.log(error.message);
    }
  };
  //user logout
  static userlogout = async (req, res) => {
    try {
      req.session.destroy();
      res.redirect("/");
    } catch (error) {
      console.log(error.message);
    }
  };

  //forgot password
  static forgotLoad = async (req, res) => {
    try {
      res.render("users/forgot");
    } catch (error) {
      console.log(error.message);
    }
  };
  // send forgot link to mail
  static forgotverify = async (req, res) => {
    try {
      const sendResetPasswordMail = async (name, email, token) => {
        try {
          var transporter = nodemailer.createTransport({
            //   service: "gmail",
            host: "smtp.gmail.com",
            port: 587,
            secure: false,
            requireTLS: true,
            auth: {
              user: config.userEmail,
              pass: config.userMailPassword,
            },
          });

          var mailOptions = {
            from: config.userEmail,
            to: email,
            subject: "For Reset Pasword",
            html:
              "Hello," +
              name +
              ',Thank you for registering. Please click the following link to reset password your email: <a href="http://localhost:3000/forgot-password?token=' +
              token +
              '">forget password</a>"',
          };

          transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
              console.log(error);
            } else {
              console.log("Email sent: " + info.response);
            }
          });
        } catch (error) {
          console.log(error.message);
        }
      };
      const { email } = req.body;
      const userData = await User.findOne({ email: email });
      if (userData) {
        if (userData.is_verified === 0) {
          res.render("users/forgot", { message: "Please verify your mail" });
        } else {
          const randomStr = RandomString.generate();
          const updateData = await User.updateOne(
            { email: email },
            { $set: { token: randomStr } }
          );
          sendResetPasswordMail(userData.name, userData.email, randomStr);
          res.render("users/forgot", {
            message: "Please check your mail to reset password",
          });
        }
      } else {
        res.render("users/forgot", { message: "User mail is incorrect" });
      }
    } catch (error) {
      console.log(error.message);
    }
  };
  // forgot page
  static forgotPassword = async (req, res) => {
    try {
      const { token } = req.query;
      const tokenData = await User.findOne({ token: token });
      if (tokenData) {
        res.render("users/forgot-password", { user_id: tokenData._id });
      } else {
        res.status(400).send("Invalid or expired verification token.");
      }
    } catch (error) {
      console.log(error.message);
    }
  };
  //reset password here
  static ResetPassword = async (req, res) => {
    try {
      const { password, user_id } = req.body;
      const securePassword = await bcrypt.hash(password, 10);
      const Data = await User.findByIdAndUpdate(
        { _id: user_id },
        { $set: { password: securePassword, token: "" } }
      );
      res.redirect("/");
    } catch (error) {
      console.log(error.message);
    }
  };
  static verification = async (req, res) => {
    try {
      res.render("users/verification");
    } catch (error) {
      console.log(error.message);
    }
  };
  static sendVerification = async (req, res) => {
    try {
      const { email } = req.body;
      const userData = await User.findOne({ email: email });
      if (userData) {
        sendVerifyMAail(req.body.name, req.body.email, userData._id);

        res.render("users/verification", {
          message: "please check your Email for verify ",
        });
      } else {
        res.render("users/verification", { message: "Your Email is wrong" });
      }
    } catch (error) {
      console.log(error.message);
    }
  };
  // edit profile & update
  static editload = async (req, res) => {
    try {
      const userDetails = await User.findOne({ _id: req.session.user_id });

      const id = req.params.Id;
      const userData = await counsil.findOne({ _id: id });
      if (userControl) {
        res.render("users/edit", {
          users: userData,
          user: userDetails,
        });
      } else {
        res.redirect("/home");
      }
    } catch (error) {
      console.log(error.message);
    }
  };
  static updateProfile = async (req, res) => {
    try {
      const userDetails = await User.findOne({ _id: req.session.user_id });

      if (req.file) {
        const userData = await User.findByIdAndUpdate(
          { _id: req.body.id },
          {
            $set: {
              applicantName: req.body.applicantName,
              email: req.body.email,
              mobile: req.body.mobile,
            },
          }
        );
      } else {
        const userData = await User.findByIdAndUpdate(
          { _id: req.body.id },
          {
            $set: {
              applicantName: req.body.applicantName,
              email: req.body.email,
              mobile: req.body.mobile,
            },
          }
        );
      }
      res.render("users/view");
    } catch (error) {
      console.log(error.message);
    }
  };

  static leaveForm = async (req, res) => {
    try {
      const userDetails = await User.findOne({ _id: req.session.user_id });

      res.render("users/leaveForm", { user: userDetails });
    } catch (err) {
      console.log(err.message);
    }
  };

  static leaveLoad = async (req, res) => {
    try {
      const userDetails = await User.findOne({ _id: req.session.user_id });
      const dateString = moment().format("YYYY-MM-DD");

      const { facultyName, leaveStart, leaveEnd, leaveType, subsitutionName } =
        req.body;
      const leaveData = new leaveModel({
        facultyName: facultyName,
        leaveStart: leaveStart,
        leaveEnd: leaveEnd,
        leaveType: leaveType,
        subsitutionName: subsitutionName,
        currentDate: dateString,
      });
      const leaveSave = await leaveData.save();

      res.redirect("/clg");
    } catch (error) {
      console.log(err.message);
    }
  };
}

module.exports = userControl;
