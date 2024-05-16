const mongoose = require("mongoose");
const registrationSchema = new mongoose.Schema(
  {
    facultyId: {
      type: String,
      required: true,
    },
    applicantNo: {
      type: String,
      required: true,
    },
    studentName: {
      type: String,
      required: true,
    },
    dob: {
      type: String,
      required: true,
    },
    fatherName: {
      type: String,
      required: true,
    },
    motherName: {
      type: String,
      required: true,
    },
    occupation: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    gender: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      
    },
    mpDomicile: {
      type: String,
      // required: true,
    },
    category: {
      type: String,
      required: true,
    },
    mobile: {
      type: String,
      required: true,
    },

    guardianMobile: {
      type: String,
      required: true,
    },

    courses: {
      course: [
        {
          type: String,
          required: true,
        },
      ],

      branch: [
        {
          type: String,
         
        },
      ],
    },

    location: {
      state: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
      },
    },

    qualifyingDegree: {
      degreeName: [{ type: String }],
      percentage: [
        {
          type: String,
        },
      ],
      examinationAuthority: [
        {
          type: String,
        },
      ],

      subjectStream: [
        {
          type: String,
        },
      ],

      passingYear: [
        {
          type: String,
        },
      ],
    },

    registrationFee: {
      paymentMode: {
        type: String,
        required: true,
      },
      amount: {
        type: String,
        required: true,
      },
      receiptNumber: {
        type: String,
        required: true,
      },
      receiptDate: {
        type: String,
        required: true,
      },
    },

    jeeMains: {
      jeeEnrollmentNumber: {
        type: String,
        
      },
      jeeMarksPercentile: {
        type: String,
        
      },
      jeeRank: {
        type: String,
      
      },
    },

    schemeOpted: [
      {
        type: String,
        // required: true,
      },
    ],

    inquirySource: {
      type: String,
      // required: true,
    },
  

    additionDetails: [{
      type:String,
    }],
    registrationStatus: {
      type: String,
      default: "Approved",
    },
    registrationDate: {
      type: String,
      required: true,
    },
    referralName: {
      type: String,
    },
    facultyName: {
      type: String,
      required:true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("registration", registrationSchema);
