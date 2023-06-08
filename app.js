const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const encrypt = require('mongoose-encryption');

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

const url = "mongodb+srv://qianwenpan:LpaU4z6r4Dxj4NjQ@cluster0.iyauopq.mongodb.net/secrectsDB";
mongoose.connect(url,{useNewUrlParser: true}).then(() => console.log('MongoDB Connected...')).catch(err => console.log(err));

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});
var secret = "thismysecret";
userSchema.plugin(encrypt, {secret: secret, encryptedFields: ["password"]});

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
    const password = req.body.password;

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
    const password = req.body.password;

    User.findOne({email: username})
    .then((foundUser) => {
        if(!foundUser){
            console.log("user not exist");
            res.redirect("/login")
        }else{
            if(foundUser.password === password){
                console.log("login successful");
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
