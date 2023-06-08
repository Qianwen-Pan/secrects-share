const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");


const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// const url = "mongodb+srv://qianwenpan:LpaU4z6r4Dxj4NjQ@cluster0.iyauopq.mongodb.net/secrectsDB";
// mongoose.connect(url,{useNewUrlParser: true}).then(() => console.log('MongoDB Connected...')).catch(err => console.log(err));

app.get("/", (req, res) => {
    res.render("home");
});
app.get("/login", (req, res) => {
    res.render("login");
});
app.get("/register", (req, res) => {
    res.render("register");
});

app.listen(3000, ()=>{
    console.log("server runing");
} )
