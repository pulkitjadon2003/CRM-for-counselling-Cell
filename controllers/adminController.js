const userModel = require("../models/userModel");
const counsellingModel = require("../models/counsellingModel");
const registrationModel = require("../models/registrationModel");
const bcrypt = require("bcrypt");
const RandomString = require("randomstring");
const config = require("../config/config");
const nodemailer = require("nodemailer");
const exceljs = require("exceljs");
const moment = require("moment");
const User = require("../models/user");
const leave = require('../models/leaveModel')

// const cloudinary = require("cloudinary");
// cloudinary.config({
  //   cloud_name: "dywvtdtpy",
  //   api_key: "655265211765838",
  //   api_secret: "mN7DrgpBMlhqLzFxIOreh5gRJFE",
  //   secure: false,
  // });
  
  // html to pdf
  const ejs = require("ejs");
  const pdf = require("html-pdf");
  const fs = require("fs");
  const path = require("path");
  const csv = require("csvtojson");
  const xlsx = require('xlsx');

const { use } = require("../routes/adminRoutes");
const { response } = require("express");
const { clg } = require("./userController");
const user = require("../models/user");

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
        ',Thank you for registering. Please click the following link to reset password your email: <a href="http://localhost:3000/admin/forgot-password?token=' +
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

const sendUserMail = async (name, email, password, user_id) => {
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
      subject: "Admin added you and verify your mail",
      html:
        "Hello," +
        name +
        ',Thank you for registering. Please click the following link to verify your email: <a href="http://localhost:3000/verify?id=' +
        user_id +
        '">verify</a>"<br><br><b>Email:- </b>' +
        email +
        "<br><b>password :-</b>" +
        password +
        "",
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

class AdminController {
  static loadLogin = async (req, res) => {
    try {
      res.render("admin/login", { message: req.flash("error") });
    } catch (error) {
      console.log(error.message);
    }
  };
  static verifyUser = async (req, res) => {
    try {
      const { email, password } = req.body;
      const userData = await userModel.findOne({ email: email });
      if (userData) {
        const isMatch = await bcrypt.compare(password, userData.password);
        if (isMatch) {
          if (userData.is_admin === 0) {
            req.flash("error", "Email and password is incorrect");
            res.redirect("/admin");
          } else {
            req.session.user_id = userData._id;
            res.redirect("/admin/home");
          }
        } else {
          req.flash("error", "Email and password is incorrect");

          res.redirect("/admin");
        }
      } else {
        req.flash("error", "Email and password is incorrect");

        res.redirect("/admin");
      }
    } catch (error) {
      console.log(error.message);
    }
  };
  static loadDashboard = async (req, res) => {
    try {
      const userData = await userModel.findOne({ _id: req.session.user_id });
      res.render("admin/home", { admin: userData });
    } catch (error) {
      console.log(error.message);
    }
  };

  static logout = async (req, res) => {
    try {
      req.session.destroy();
      res.redirect("/admin");
    } catch (error) {
      console.log(error.message);
    }
  };

  static forgotLoad = async (req, res) => {
    try {
      res.render("admin/forgot");
    } catch (error) {
      console.log(error.message);
    }
  };
  static forgotVerify = async (req, res) => {
    try {
      const { email } = req.body;
      const userData = await userModel.findOne({ email: email });
      if (userData) {
        if (userData.is_admin === 0) {
          res.render("admin/forgot", { message: "Email is incorrect" });
        } else {
          const randomStr = RandomString.generate();
          const upadateData = await userModel.updateOne(
            { email: email },
            { $set: { token: randomStr } }
          );
          sendResetPasswordMail(userData.name, userData.email, randomStr);
          res.render("admin/forgot", {
            message: "Please check your mail to reset password",
          });
        }
      } else {
        res.render("admin/forgot", { message: "Email is incorrect" });
      }
    } catch (error) {
      console.log(error.message);
    }
  };
  static forgotPasswordLoad = async (req, res) => {
    try {
      const { token } = req.query;
      const tokenData = await userModel.findOne({ token: token });
      if (tokenData) {
        res.render("admin/forgot-password", { user_id: tokenData._id });
      } else {
        res.status(400).send("Invalid or expired verification token.");
      }
    } catch (error) {
      console.log(error.message);
    }
  };
  //reset password here
  static resetPassword = async (req, res) => {
    try {
      const { password, user_id } = req.body;
      const securePassword = await bcrypt.hash(password, 10);
      const Data = await userModel.findByIdAndUpdate(
        { _id: user_id },
        { $set: { password: securePassword, token: "" } }
      );
      res.redirect("/admin");
    } catch (error) {
      console.log(error.message);
    }
  };

  static newUser = async (req, res) => {
    try {
      const userDetails = await userModel.findOne({ _id: req.session.user_id });

      res.render("admin/newUser", { admin: userDetails });
    } catch (error) {
      console.log(error.message);
    }
  };
  static addUser = async (req, res) => {
    try {
      const userDetails = await userModel.findOne({ _id: req.session.user_id });

      console.log(req.body);
      const { name, email, mobile } = req.body;

      const password = RandomString.generate(8);
      const securePassword = await bcrypt.hash(password, 10);
      const newUser = new userModel({
        name: name,
        email: email,
        mobile: mobile,
        password: securePassword,
        is_admin: 0,
      });
      const userData = await newUser.save();
      if (userData) {
        sendUserMail(name, email, password, userData._id);
        res.redirect("/admin/dashboard");
      } else {
        res.render("admin/newUser", { admin: userDetails });
      }
    } catch (error) {
      console.log(error.message);
    }
  };
  static editUserLoad = async (req, res) => {
    try {
      const { id } = req.query;
      const userData = await userModel.findById({ _id: id });
      if (userData) {
        res.render("admin/editUser", { user: userData });
      } else {
        res.redirect("/admin/dashboard");
      }
    } catch (error) {
      console.log(error.message);
    }
  };
  static updateUserLoad = async (req, res) => {
    try {
      const { name, email, mobile } = req.body;
      const updateUser = await userModel.findByIdAndUpdate(
        { _id: req.body.id },
        {
          $set: {
            name: name,
            email: email,
            mobile: mobile,
          },
        }
      );
      res.redirect("/admin/dashboard");
    } catch (error) {
      console.log(error.message);
    }
  };
  static deleteUserLoad = async (req, res) => {
    try {
      const { id } = req.query;
      await userModel.deleteOne({ _id: id });
      res.redirect("/admin/dashboard");
    } catch (error) {
      console.log(error.message);
    }
  };
  static exportcounsil = async (req, res) => {
    try {
      const userDetails = await userModel.findOne({ _id: req.session.user_id });
      res.render("admin/exportCounsil", {
        admin: userDetails,
      });
    } catch (error) {
      console.log(error.message);
    }
  };
  //excel
  static exportUser = async (req, res) => {
    try {
      var today = new Date().toISOString();
      var start = "";
      var end = "";
      if (req.query.startDate || req.query.endDate) {
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
          { header: "Mobile", key: "mobile" },
          { header: "Guardian Mobile", key: "guardianMobile" },
          { header: "Date of Birth", key: "dob" },
          { header: "Gender", key: "gender" },
          { header: "Address", key: "address" },
          { header: "Course", key: "course" },
          { header: "Branch", key: "branch" },
          { header: "Qualifying Degree", key: "qualifyingDegree" },
          { header: "Father Name", key: "fatherName" },
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
          { header: "Faculty Name", key: "facultyName" },
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
        const userData = await counsellingModel.find({
          $or: [
            {
              registrationDate: { $gte: start, $lte: end },
            }, // Assuming 'dateField' is the name of the date field
          ],
        });
        userData.forEach((user) => {
          user.s_no = counter;
          workSheet.addRow(user);
          counter++;
        });
      }
      if (fileType === "registration") {
        const userData = await registrationModel.find({
          $or: [
            {
              registrationDate: { $gte: start, $lte: end },
            }, // Assuming 'dateField' is the name of the date field
          ],
        });
        userData.forEach((user) => {
          user.s_no = counter;
          workSheet.addRow(user);
          counter++;
        });
      }
      if (fileType === "dte") {
        const userData = await User.find({
          $or: [
            // {
            //   admissionDate: { $gte: start, $lte: end },
            // },
            // {
            //   currentDate: { $gte: start, $lte: end },
            // },
            {
              followUpDate: { $gte: start, $lte: end },
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

      res.setHeader(
        "Content-Disposition",
        `attachement; filename=${fileType + today}.xlsx`
      );

      return workBook.xlsx.write(res).then(() => {
        res.status(200);
      });
    } catch (error) {
      console.log(error.message);
    }
  };
  // pdf
  static exportcounsilPDF = async (req, res) => {
    try {
      const userDetails = await userModel.findOne({ _id: req.session.user_id });
      res.render("admin/exportCounsilPDF", {
        admin: userDetails,
      });
    } catch (error) {
      console.log(error.message);
    }
  };
  static exportUserPdf = async (req, res) => {
    try {
      var search = "";
      if (req.query.date) {
        search = req.query.date;
      }
      // const date = req.query.date;
      const userData = await counsellingModel.find({
        $or: [
          {
            registrationDate: { $regex: "^" + search, $options: "i" },
          }, // Assuming 'dateField' is the name of the date field
        ],
      });
      const data = {
        users: userData,
      };

      const filePathName = path.resolve(
        __dirname,
        "../views/admin/htmltopdf.ejs"
      );
      const htmlString = fs.readFileSync(filePathName).toString();
      let options = {
        format: "Letter",
        orientation: "portrait",
        border: "10mm",
      };
      const ejsData = ejs.render(htmlString, data);
      pdf.create(ejsData, options).toFile("users.pdf", (err, response) => {
        if (err) console.log(err);
        //  console.log('file generated')

        const filePath = path.resolve(__dirname, "../users.pdf");
        fs.readFile(filePath, (err, file) => {
          if (err) {
            console.log(err);
            return res.status(500).send("Could not download file");
          }
          res.setHeader("Content-Type", "application/pdf");

          res.setHeader(
            "Content-Disposition",
            `attachement; filename=users.pdf`
          );

          res.send(file);
        });
      });
    } catch (error) {
      console.log(error.message);
    }
  };
  static importData = async (req, res) => {
    try {
      const userData = await userModel.findOne({ _id: req.session.user_id });

      res.render("admin/importData", {
        admin: userData,
        message: req.flash("message"),
        error: req.flash("error"),

      });
    } catch (error) {
      console.log(error.message);
    }
  };
  static dataImport = async (req, res) => {
    try {
      const dateString = moment().format("YYYY-MM-DD");
      const { fileName } = req.body;
      var userData = [];
   
      const workbook = xlsx.readFile(req.file.path);
      
      workbook.SheetNames.forEach( Sheet=>{   
      const sheetName =Sheet; 
      const worksheet = workbook.Sheets[sheetName];
      const response = xlsx.utils.sheet_to_json(worksheet);
          for (var x = 0; x < response.length; x++) {
            const user =  userModel.findOne({
              _id: response[x].FacultyId,
            });
          

            if (user) {
              let admissionDate = new Date((response[x].AdmissionDate - (25567 + 2)) * 86400 * 1000)
              admissionDate = moment(admissionDate).format('DD-MM-YYYY')
              userData.push({
                facultyId: response[x].FacultyId,
                rank: response[x].Rank,
                marks: response[x].Marks,
                rollNo: response[x].RollNo,
                name: response[x].Name,
                father: response[x].Father,
                mother: response[x].Mother,
                eligibleCategory: response[x].EligibleCategory,
                allotedCategory: response[x].AllotedCategory,
                domicile: response[x].Domicile,
                gender: response[x].Gender,
                phoneNo: response[x].PhoneNo,
                ews: response[x].EWS,
                status: response[x].Status,
                admissionDate: admissionDate,
                allotedRound: response[x].AllotedRound,
                finalStatus: response[x].FinalStatus,
                currentDate: dateString,
                branch: sheetName,
                fileName:fileName
              });
              
            } else {
             
              
              req.flash("error",`User with facultyId:${response[x].FacultyId} not found.`);
              res.redirect("/admin/importData");
              return;

            }
          }
        })
        
        console.log(userData);
          await User.insertMany(userData);
          console.log({ status: 200, success: true, msg: "Imported" });
          req.flash("message", "File Upload successful");
          res.redirect("/admin/importData");
        
       
    } catch (error) {
      // res.send({ status: 400, success: false, msg: error.message });
        req.flash("error",` Error: While appointing this '${error.value}' Faculty Id`);
        res.redirect("/admin/importData");
    }
  };
  static dteList = async (req, res) => {
    try {
      const userData = await userModel.findOne({ _id: req.session.user_id });

      var searchinq1 = "";
      if (req.query.searchinq1) {
        searchinq1 = req.query.searchinq1;
      }
      // console.log(searchreq1);

      var searchinq2 = "";
      if (req.query.searchinq2) {
        searchinq2 = req.query.searchinq2;
      }
      // console.log(searchreq2);

      const data = await User.find({
        // multiple searching
        $and: [
          {
            $or: [
              {
                currentDate: { $regex: "^" + searchinq1, $options: "i" },
              },
              {
                admissionDate: { $regex: "^" + searchinq1, $options: "i" },
              },
              {
                reportingDate: { $regex: "^" + searchinq1, $options: "i" },
              }, // Assuming 'dateField' is the name of the date field
            ],
          },
          {
            $or: [
              {
                name: {
                  $regex: "^" + searchinq2 + "$",
                  $options: "i",
                },
              },
              {
                rollNo: {
                  $regex: "^" + searchinq2 + "$",
                  $options: "i",
                },
              },
              {
                rank: {
                  $regex: "^" + searchinq2 + "$",
                  $options: "i",
                },
              },

              { phoneNo: { $regex: "^" + searchinq2 + "$", $options: "i" } },
              {
                father: {
                  $regex: "^" + searchinq2 + "$",
                  $options: "i",
                },
              },

              { fileName: { $regex: ".*" + searchinq2 + ".*", $options: "i" } },
              { branch: { $regex: "^" + searchinq2 + "$", $options: "i" } },

              
            ],
          },
        ],

        // Add more conditions here using $and operator if needed
      })
        .populate("facultyId")
        .sort([
          ["currentDate", -1], // Then sorting by currentDate in descending order
          ["marks", -1], // Sorting by marks in descending order
        ])
        .exec();

      res.render("admin/dteList", {
        user: data,
        admin: userData,
      });
    } catch (error) {
      console.log(error.message);
    }
  };
  static ReportNumber = async (req, res) => {
    try {
      const userData = await userModel.findOne({ _id: req.session.user_id });
      res.render("admin/reportNumber", {
        admin: userData,
      });
    } catch (error) {
      console.log(error.message);
    }
  };

  static numberReport = async (req, res) => {
    try {
      // const branch = req.body.branch ? req.body.branch : "";
      var start = req.body.StartDate ? req.body.StartDate : "";
      var end = req.body.EndDate ? req.body.EndDate : "";
      const actualDate = moment().format('YYYY-MM-DD');

      // console.log(start);
      // console.log(end);

      // Initialize an empty array to store counts for each date
      const datewiseCounts = [];

      // Iterate over each date in the range
      var reportCount = 0;
      let currentDate = moment(start).format('YYYY-MM-DD');
      // console.log(currentDate)
      while (currentDate <= end) {
        // Count the number of students for the current date
        const count = await User.countDocuments({
          $and: [
            // { branch: branch },
            {
              followUpDate: currentDate,
            },
            { finalStatus: "Reporting" },
          ],
        });
        reportCount = reportCount + count;
        // Push the count along with the date to the datewiseCounts array
        datewiseCounts.push({ date: currentDate, count: count });

        // Move to the next date
        currentDate = moment(currentDate).add(1, "days").format("YYYY-MM-DD");
      }
      console.log("count" + reportCount)

      // Log or return the datewiseCounts array for debugging or further processing
      // console.log(datewiseCounts);
      // Count the number of students who took admission
      const notDecidedCount = await User.countDocuments({
        $and: [
          // { branch: branch },

          { finalStatus: "Not Decided" },
          { followUpDate: { $gte: start, $lte: end } },
        ],
      });

      // Count the number of students who Go For CLC Round
      const goForClcCount = await User.countDocuments({
        $and: [
          // { branch: branch },

          { followUpDate: { $gte: start, $lte: end } },
          { finalStatus: "Go For Clc" },
        ],
      });
      // Count the number of students who are not interested
      const notInterestedCount = await User.countDocuments({
        $and: [
          // { branch: branch },
          { finalStatus: "Not Interested" },
          { followUpDate: { $gte: start, $lte: end } },
        ],
      });

      // Count the number of students who are reporting
      const reportingCount = await User.countDocuments({
        $and: [
          // { branch: branch },
          { finalStatus: "Reporting" },
          { followUpDate: { $gte: start, $lte: end } },
        ],
      });

      // Count the number of students who are not picking up the phone
      const notPickingUpCount = await User.countDocuments({
        $and: [
          // { branch: branch },
          { finalStatus: "Not Picked" },
          { followUpDate: { $gte: start, $lte: end } },
        ],
      });
      let grandTotal = 0;
      grandTotal =
        reportCount +
        notDecidedCount +
        notInterestedCount +
        notPickingUpCount +
        goForClcCount;
      
      const allotementNo = await User.countDocuments();
      // console.log(allotementNo);

      // Generate the report
      console.log("Not Decided Students:", notDecidedCount);
      console.log("Not Interested Students:", notInterestedCount);
      console.log("Reporting Students:", reportingCount);
      console.log("Not Picking Up Phone Students:", notPickingUpCount);
      console.log("Go For CLC Round:", goForClcCount);
      res.render("admin/printDteform", {
        datewiseCounts: datewiseCounts,
        notDecidedCount: notDecidedCount,
        notInterestedCount: notInterestedCount,
        reportingCount: reportingCount,
        notPickingUpCount: notPickingUpCount,
        goForClcCount: goForClcCount,
        StartDate: start,
        EndDate: end,
        allotementNo: allotementNo,
        // branch: branch,
        reportCount: reportCount,
        grandTotal:grandTotal,
        actualDate:actualDate
      });
    } catch (error) {
      console.log(error.message);
    }
  };
  static inquiryDetails = async (req, res) => {
    try {
      const userData = await userModel.findOne({ _id: req.session.user_id });

      var searchinq1 = "";
      if (req.query.searchinq1) {
        searchinq1 = req.query.searchinq1;
      }
      // console.log(searchreq1);

      var searchinq2 = "";
      if (req.query.searchinq2) {
        searchinq2 = req.query.searchinq2;
      }
      // console.log(searchreq2);

      const usersinq = await counsellingModel
        .find({
          // multiple searching
          $and: [
            {
              $or: [
                {
                  registrationDate: { $regex: "^" + searchinq1, $options: "i" },
                }, // Assuming 'dateField' is the name of the date field
              ],
            },
            {
              $or: [
                {
                  applicantName: {
                    $regex: ".*" + searchinq2 + ".*",
                    $options: "i",
                  },
                },
                {
                  applicantNo: {
                    $regex: ".*" + searchinq2 + ".*",
                    $options: "i",
                  },
                },
                { mobile: { $regex: ".*" + searchinq2 + ".*", $options: "i" } },
                {
                  fatherName: {
                    $regex: ".*" + searchinq2 + ".*",
                    $options: "i",
                  },
                },
                { email: { $regex: ".*" + searchinq2 + ".*", $options: "i" } },
                // { fatherName: { $regex: ".*" + searchinq2 + ".*", $options: "i" } },
                {
                  "courses.course": {
                    $regex: ".*" + searchinq2 + ".*",
                    $options: "i",
                  },
                },
                {
                  "courses.branch": {
                    $regex: ".*" + searchinq2 + ".*",
                    $options: "i",
                  },
                },
                {
                  facultyName: {
                    $regex: ".*" + searchinq2 + ".*",
                    $options: "i",
                  },
                },
              ],
            },
          ],

          // Add more conditions here using $and operator if needed
        })
        .sort({ _id: -1 })
        .exec();
      res.render("admin/inquiryDisplay", {
        user: usersinq,
        admin: userData,
      });
    } catch (error) {
      console.log(error.message);
    }
  };
  static teachersTable = async (req, res) => {
    try {
      const userData = await userModel.findOne({ _id: req.session.user_id });
      const data = await userModel.find({ is_admin: 0 });
      res.render("admin/teachersTable", { data: data, admin: userData });
    } catch (error) {
      console.log(error.message);
    }
  };
  static registrationDetails = async (req, res) => {
    try {
      const userData = await userModel.findOne({ _id: req.session.user_id });

        var searchinq1 = "";
        if (req.query.searchinq1) {
          searchinq1 = req.query.searchinq1;
        }
        // console.log(searchreq1);

        var searchinq2 = "";
        if (req.query.searchinq2) {
          searchinq2 = req.query.searchinq2;
        }
        // console.log(searchreq2);

        const usersreq = await registrationModel
          .find({
            // multiple searching
            $and: [
              {
                $or: [
                  {
                    registrationDate: {
                      $regex: "^" + searchinq1,
                      $options: "i",
                    },
                  }, // Assuming 'dateField' is the name of the date field
                ],
              },
              {
                $or: [
                  {
                    studentName: {
                      $regex: ".*" + searchinq2 + ".*",
                      $options: "i",
                    },
                  },
                  {
                    applicantNo: {
                      $regex: ".*" + searchinq2 + ".*",
                      $options: "i",
                    },
                  },
                  {
                    mobile: { $regex: ".*" + searchinq2 + ".*", $options: "i" },
                  },
                  {
                    fatherName: {
                      $regex: ".*" + searchinq2 + ".*",
                      $options: "i",
                    },
                  },
                  {
                    email: { $regex: ".*" + searchinq2 + ".*", $options: "i" },
                  },
                  // { fatherName: { $regex: ".*" + searchinq2 + ".*", $options: "i" } },
                  {
                    "courses.course": {
                      $regex: ".*" + searchinq2 + ".*",
                      $options: "i",
                    },
                  },
                  {
                    "courses.branch": {
                      $regex: ".*" + searchinq2 + ".*",
                      $options: "i",
                    },
                  },
                  {
                    facultyName: {
                      $regex: ".*" + searchinq2 + ".*",
                      $options: "i",
                    },
                  },
                ],
              },
            ],

            // Add more conditions here using $and operator if needed
          })
          .sort({ _id: -1 })
          .exec();
      res.render("admin/registrationData", {
        user: usersreq,
        admin: userData,
      });
    } catch (error) {
      console.log(error.message);
    }
  };
  static viewFullInquiry = async (req, res) => {
    try {
      const data = await counsellingModel.findById(req.params.id);
      const userData = await userModel.findOne({ _id: req.session.user_id });

      res.render("admin/view", { view: data, admin: userData });
    } catch (error) {
      console.log(error.message);
    }
  };
  static viewFullRegistration = async (req, res) => {
    try {
      const data = await registrationModel.findById(req.params.id);
      const userData = await userModel.findOne({ _id: req.session.user_id });

      res.render("admin/viewFullRegistration", { view: data, admin: userData });
    } catch (error) {
      console.log(error.message);
    }
  };
  static editInquiry = async (req, res) => {
    try {
      const data = await counsellingModel.findById(req.params.id);
      const userData = await userModel.findOne({ _id: req.session.user_id });

      res.render("admin/editUser", { users: data, admin: userData });
    } catch (error) {
      console.log(error.message);
    }
  };
  static editRegistration = async (req, res) => {
    try {
      const data = await registrationModel.findById(req.params.id);
      const userData = await userModel.findOne({ _id: req.session.user_id });

      res.render("admin/editRegistration", { users: data, admin: userData });
    } catch (error) {
      console.log(error.message);
    }
  };
  static deleteInquiry = async (req, res) => {
    try {
      const { id } = req.params;
      await counsellingModel.deleteOne({ _id: id });
      res.redirect("back");
    } catch (error) {
      console.log(error.message);
    }
  };
  static updateRegistration = async (req, res) => {
    try {
      const userData = await userModel.findOne({ _id: req.session.user_id });
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
      res.render("admin/viewFullRegistration", {
        view: updateUser,
        admin: userData,
      });
    } catch (error) {
      console.log(error.message);
    }
  };
  static updateInquiry = async (req, res) => {
    try {
      const userData = await userModel.findOne({ _id: req.session.user_id });

      const { name, email, mobile } = req.body;
      const updateUser = await counsellingModel.findByIdAndUpdate(
        { _id: req.body.id },
        {
          $set: {
            applicantName: name,
            email: email,
            mobile: mobile,
          },
        }
      );

      res.render("admin/view", { view: updateUser, admin: userData });
    } catch (error) {
      console.log(error.message);
    }
  };
  static fillINQ = async (req, res) => {
    try {
      const userData = await userModel.findOne({ _id: req.session.user_id });
      res.render("admin/fillINQ", {
        admin: userData,
        message: req.flash("error"),
      });
    } catch (error) {
      console.log(error.message);
    }
  };
  static counsil = async (req, res) => {
    try {
      const userUpData = await userModel.findOne({ _id: req.session.user_id });
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
      const userFound = await counsellingModel.findOne({
        $and: [{ applicantName: applicantName }, { mobile: mobile }],
      });
      if (userFound) {
        req.flash("error", "Student Enquiry Found");
        res.render("admin/fillINQ", {
          message: req.flash("error"),
          admin: userUpData,
        });
      } else {
        if (
        
          gender &&
          facultyName
        ) {
          const newData = new counsellingModel({
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
          res.render("admin/view", { view: userData, admin: userUpData });
        } else {
          req.flash("error", "Fields are Required");
          res.render("admin/fillINQ", {
            admin: userUpData,
            message: req.flash("error"),
          });
        }
      }
    } catch (error) {
      console.log(error.message);
    }
  };
  static registrationFormN = async (req, res) => {
    try {
      const userData = await userModel.findOne({ _id: req.session.user_id });
      res.render("admin/registrationFormN", {
        admin: userData,
        message: req.flash("error"),
      });
    } catch (error) {
      console.log(error.message);
    }
  };
  static registrationForm = async (req, res) => {
    try {
      const userData = await userModel.findOne({ _id: req.session.user_id });

      const data = await counsellingModel.findById(req.params.id);

      res.render("admin/registrationForm", { user: data, admin: userData });
    } catch (error) {
      console.log(error.message);
    }
  };
  static registrationData = async (req, res) => {
    try {
      const userData = await userModel.findOne({ _id: req.session.user_id });
      const currentYear = moment().format('YY')
      const facultyId = userData._id;
      // console.log(facultyId);
      function getRandomThreeDigitNumber() {
        // Generate a random number between 100 and 999
        return Math.floor(Math.random() * 9000) + 1000;
      }
      let branchRoll=[];
      // const branchArray = req.body.branch
      if (req.body.course == 'BTech' ) {
          branchRoll.push(...req.body.branch);
          if(branchRoll[0].includes('CSE-'))
            branchRoll[0] =  branchRoll[0].replace('CSE-','')
            
      }
      else{
        branchRoll.push(req.body.course);
      }
      // console.log(branchRoll);
      const random = getRandomThreeDigitNumber();
      const applicantNo = `0905${currentYear}` + branchRoll[0] + random;
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
        additionDetails,
        
        registrationStatus,
        facultyName,
        referralName,
        mpDomicile,
      } = req.body;
      const userFound = await registrationModel.findOne({
        $and: [{ studentName: studentName }, { mobile: mobile }],
      });
      if (userFound) {
        res.redirect("/admin/registrationFormN");
      } else {
        if (
          
          gender &&
          facultyName
        ) {
          const registerData = new registrationModel({
            facultyId: facultyId,
            applicantNo: applicantNo,
            studentName: studentName,
            dob: dob,
            fatherName: fatherName,
            motherName: motherName,
            occupation: occupation,
            address: address,
            gender: gender,
            email: email,
            
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
            // status: status,
            additionDetails:additionDetails,
            registrationStatus: registrationStatus,
            registrationDate: dateString,
            referralName: referralName,
            facultyName: facultyName,
            mpDomicile:mpDomicile,
          });
          const registeredData = await registerData.save();
          res.render("admin/viewFullRegistration", {
            view: registeredData,
            admin: userData,
          });
        } else {
          req.flash("error", "Fields are Required");
          res.redirect("/admin/registrationFormN");
        }
      }
    } catch (error) {
      console.log(error.message);
    }
  };
  static logs = async (req, res) => {
    try {
      const userData = await userModel.findOne({ _id: req.session.user_id });

      var searchinq1 = "";
      if (req.query.searchinq1) {
        searchreq1 = req.query.searchinq1;
      }
      // console.log(searchreq1);

      var searchinq2 = "";
      if (req.query.searchinq2) {
        searchreq2 = req.query.searchinq2;
      }
      // console.log(searchreq2);

      const usersinq = await counsellingModel
        .find({
          // multiple searching
          $and: [
            {
              $or: [
                {
                  registrationDate: { $regex: "^" + searchinq1, $options: "i" },
                }, // Assuming 'dateField' is the name of the date field
              ],
            },
            {
              $or: [
                {
                  applicantName: {
                    $regex: ".*" + searchinq2 + ".*",
                    $options: "i",
                  },
                },
                {
                  applicantNo: {
                    $regex: ".*" + searchinq2 + ".*",
                    $options: "i",
                  },
                },
                { mobile: { $regex: ".*" + searchinq2 + ".*", $options: "i" } },
                {
                  fatherName: {
                    $regex: ".*" + searchinq2 + ".*",
                    $options: "i",
                  },
                },
                { email: { $regex: ".*" + searchinq2 + ".*", $options: "i" } },
                // { fatherName: { $regex: ".*" + searchinq2 + ".*", $options: "i" } },
                {
                  "courses.course": {
                    $regex: ".*" + searchinq2 + ".*",
                    $options: "i",
                  },
                },
                {
                  "courses.branch": {
                    $regex: ".*" + searchinq2 + ".*",
                    $options: "i",
                  },
                },
                { dateField: { $regex: "^" + searchinq2, $options: "i" } }, // Assuming 'dateField' is the name of the date field
              ],
            },
          ],

          // Add more conditions here using $and operator if needed
        })
        .exec();
      res.render("admin/logs", {
        user: usersinq,
        admin: userData,
      });
    } catch (error) {
      console.log(err.message);
    }
  };
  static inquiryReports = async (req, res) => {
    try {
      const userData = await userModel.findOne({ _id: req.session.user_id });

      var searchinq1 = "";
      if (req.query.searchinq1) {
        searchinq1 = req.query.searchinq1;
      }
      // console.log(searchreq1);

      var searchinq2 = "";
      if (req.query.searchinq2) {
        searchinq2 = req.query.searchinq2;
      }
      // console.log(searchreq2);

       const usersinq = await counsellingModel
         .find({
           // multiple searching
           $and: [
             {
               $or: [
                 {
                   registrationDate: {
                     $regex: "^" + searchinq1,
                     $options: "i",
                   },
                 }, // Assuming 'dateField' is the name of the date field
               ],
             },
             {
               $or: [
                 {
                   applicantName: {
                     $regex: "^" + searchinq2 + ".*",
                     $options: "i",
                   },
                 },
                 {
                   applicantNo: {
                     $regex: "^" + searchinq2 + ".*",
                     $options: "i",
                   },
                 },
                 {
                   mobile: { $regex: "^" + searchinq2 + ".*", $options: "i" },
                 },
                 {
                   fatherName: {
                     $regex: "^" + searchinq2 + ".*",
                     $options: "i",
                   },
                 },
                 { email: { $regex: "^" + searchinq2 + ".*", $options: "i" } },
                 // { fatherName: { $regex: "^" + searchinq2 + ".*", $options: "i" } },
                 {
                   "courses.course": {
                     $regex: "^" + searchinq2 + ".*",
                     $options: "i",
                   },
                 },
                 {
                   "courses.branch": {
                     $regex: "" + searchinq2 + "$",
                     $options: "i",
                   },
                 },
                 {
                   facultyName: {
                     $regex: "^" + searchinq2 + ".*",
                     $options: "i",
                   },
                 },
               ],
             },
           ],

           // Add more conditions here using $and operator if needed
         })
         .sort({ _id: -1 })
         .exec();
      res.render("admin/inquiryReports", {
        user: usersinq,
        admin: userData,
      });
    } catch (err) {
      console.log(err.message);
    }
  };
  static registerReports = async (req, res) => {
    try {
      const userData = await userModel.findOne({ _id: req.session.user_id });

    var searchinq1 = "";
    if (req.query.searchinq1) {
      searchinq1 = req.query.searchinq1;
    }
    // console.log(searchreq1);

    var searchinq2 = "";
    if (req.query.searchinq2) {
      searchinq2 = req.query.searchinq2;
    }
    // console.log(searchreq2);

    const usersreq = await registrationModel
    .find({
      // multiple searching
      $and: [
        {
          $or: [
            {
              registrationDate: {
                $regex: "^" + searchinq1,
                $options: "i",
              },
            }, // Assuming 'dateField' is the name of the date field
          ],
        },
        {
          $or: [
            {
              applicantName: {
                $regex: "^" + searchinq2 + ".*",
                $options: "i",
              },
            },
            {
              applicantNo: {
                $regex: "^" + searchinq2 + "$",
                $options: "i",
              },
            },
            {
              mobile: { $regex: "^" + searchinq2 + "$", $options: "i" },
            },
            {
              fatherName: {
                $regex: "^" + searchinq2 + ".*",
                $options: "i",
              },
            },
            { email: { $regex: "^" + searchinq2 + "$", $options: "i" } },
            // { fatherName: { $regex: "^" + searchinq2 + ".*", $options: "i" } },
            {
              "courses.course": {
                $regex: "^" + searchinq2 + "$",
                $options: "i",
              },
            },
            {
              "courses.branch": {
                $regex: "" + searchinq2 + "$",
                $options: "i",
              },
            },
            {
              facultyName: {
                $regex: "^" + searchinq2 + "$",
                $options: "i",
              },
            },
          ],
        },
      ],

      // Add more conditions here using $and operator if needed
    })

      .sort({ _id: -1 })
      .exec();
      res.render("admin/registerReports", {
        user: usersreq,
        admin: userData,
      });
    } catch (err) {
      console.log(err.message);
    }
  };
  static facultyLeave = async (req, res) => {
    try {
      const userData = await userModel.findOne({ _id: req.session.user_id });

      var searchinq1 = "";
      if (req.query.searchinq1) {
        searchinq1 = req.query.searchinq1;
      }
      // console.log(searchreq1);

      var searchinq2 = "";
      if (req.query.searchinq2) {
        searchinq2 = req.query.searchinq2;
      }
      // console.log(searchreq2);

      const usersinq = await leave
        .find({
          // multiple searching
          $and: [
            {
              $or: [
                {
                  currentDate: { $regex: "^" + searchinq1, $options: "i" },
                }, // Assuming 'dateField' is the name of the date field
              ],
            },
            {
              $or: [
                {
                  facultyName: {
                    $regex: ".*" + searchinq2 + ".*",
                    $options: "i",
                  },
                },
                {
                  leaveType: {
                    $regex: ".*" + searchinq2 + ".*",
                    $options: "i",
                  },
                },

                {
                  leaveStart: {
                    $regex: ".*" + searchinq2 + ".*",
                    $options: "i",
                  },
                },
              ],
            },
          ],
          // Add more conditions here using $and operator if needed
        })
        .sort({ _id: -1 })
        .exec();
      res.render("admin/facultyLeave", {
        user: usersinq,
        admin: userData,
      });
    } catch (error) {
      console.log(err.message);
    }
  };
  static pendingForm = async (req, res) => {
    try {
      const userData = await userModel.findOne({ _id: req.session.user_id });
      const users = await counsellingModel.find({ inquiryStatus: "pending" });
      res.render("admin/pendingForms", {
        data: users,
        admin: userData,
      });
    } catch (error) {
      console.log(error.message);
    }
  };
  static updatestatus = async (req, res) => {
    try {
      const userData = await userModel.findOne({ _id: req.session.user_id });

      // const data = await counsellingModel.find({ inquiryStatus: "pending" });
      const update = await counsellingModel.findByIdAndUpdate(req.params.Id, {
        inquiryStatus: req.body.status,
      });

      //  this.sendMail(name, email, status, comment);
      res.redirect("back",);
    } catch (error) {
      console.log(error);
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
}

module.exports = AdminController;