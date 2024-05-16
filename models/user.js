const { name } = require('ejs')
const mongoose = require('mongoose')
const userSchema = new mongoose.Schema(
  {
    facultyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    rank: {
      type: String,
    },
    marks: {
      type: String,
    },
    rollNo: {
      type: String,
    },
    name: {
      type: String,
    },
    father: {
      type: String,
    },
    mother: {
      type: String,
    },
    eligibleCategory: {
      type: String,
    },
    allotedCategory: {
      type: String,
    },
    domicile: {
      type: String,
    },
    gender: {
      type: String,
    },
    phoneNo: {
      type: String,
    },
    ews: {
      type: String,
    },
    status: {
      type: String,
    },
    admissionDate: {
      type: String,
    },
    allotedRound: {
      type: String,
    },
    finalStatus: {
      type: String,
    },
    comment: {
      type: String,
    },
    currentDate: {
      type: String,
    },
    branch: {
      type: String,
    },
    followUpDate: {
      type: String,
    },
    fileName:{
      type:String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('importedData',userSchema)