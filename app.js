require('dotenv').config()
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
var md5 = require('md5');
 
const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

const db_name = process.env.DB_NAME;
const db_password = process.env.DB_PASSWORD;
const url = `mongodb+srv://${db_name}:${db_password}@cluster0.iyauopq.mongodb.net/secrectsDB`
mongoose.connect(url,{useNewUrlParser: true}).then(() => console.log('MongoDB Connected...')).catch(err => console.log(err));

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

// userSchema.plugin(encrypt, {secret: process.env.SECRET, encryptedFields: ["password"]});
//using hash instead encrypt

const User = mongoose.model("User", userSchema);

app.get("/", (req, res) => {
    res.render("home");
});
app.get("/login", (req, res) => {
    res.render("login");
});
app.get("/register", (req, res) => {
    res.render("register");
});

app.post("/register", (req, res) => {
    const username = req.body.username;
    const password = md5(req.body.password);

    const newUser = new User({
        email: username,
        password: password
    });

    newUser.save()
    .then(() => {
        console.log("new user saved");
        res.render("secrets");
    })
    .catch((e) => console.log(`user can't save because: ${e}`));

});

app.post("/login", (req, res) => {
    const username = req.body.username;
    const password = md5(req.body.password);

    User.findOne({email: username})
    .then((foundUser) => {
        if(!foundUser){
            console.log("user not exist");
            res.redirect("/login")
        }else{
            if(foundUser.password === password){
                console.log("login successful");
                console.log(password);
                res.render("secrets");
            }else{
                console.log("wrong password");
                res.redirect("/login");
            }   
        }
    })
    .catch((e) => {
        console.log(`login fail : ${e}`)
    })
});


app.listen(3000, ()=>{
    console.log("server runing");
} )
