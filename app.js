const express = require("express");
const app = express();

const mongoose = require("mongoose");
mongoose
  .connect("mongodb+srv://dbUser:pulkit12@pulkitscluster.5odkhln.mongodb.net/?retryWrites=true&w=majority&appName=PulkitsCluster")
  .then((result) => {
    console.log("connection successfull");
  })
  .catch((err) => {
    console.log(err);
  });

  //

//

const config = require('./config/config')

const session = require("express-session");
app.use(session({ secret: config.sessionSecret }))

const bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const path = require("path")
app.use(express.static(path.resolve(__dirname,'public')))


const flash = require("connect-flash");
const cookieParser = require("cookie-parser");
app.use(cookieParser());

//messages
app.use(
  session({
    secret: "secret",
    cookie: { maxAge: 60000 },
    resave: false,
    saveUninitialized: false,
  })
);
//Flash messages
app.use(flash());

//css
app.set("view engine", "ejs");
app.use(express.static("public"));
//user routes
const userRoutes = require("./routes/index");
app.use("/", userRoutes);
//admin routes
const admin = require('./routes/adminRoutes')
app.use('/admin', admin)



const port=8000
app.listen(port, function () {
  console.log("serving is running on ",port);
});
