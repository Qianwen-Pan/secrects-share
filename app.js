require('dotenv').config()
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require('express-session');
const passport = require("passport");
const passportLocalMongoose = require('passport-local-mongoose');
 
const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.use(session({
    secret: 'Our little secret',
    resave: false,
    saveUninitialized: false
  }))

app.use(passport.initialize());
app.use(passport.session());

const db_name = process.env.DB_NAME;
const db_password = process.env.DB_PASSWORD;

const url = `mongodb+srv://${db_name}:${db_password}@cluster0.iyauopq.mongodb.net/secrectsDB`
mongoose.connect(url,{useNewUrlParser: true}).then(() => console.log('MongoDB Connected...')).catch(err => console.log(err));

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

userSchema.plugin(passportLocalMongoose);

const User = mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/", (req, res) => {
    res.render("home");
});
app.get("/login", (req, res) => {
    res.render("login");
});
app.get("/register", (req, res) => {
    res.render("register");
});

app.get("/secret", (req, res) => {
    if(req.isAuthenticated()){
        res.render("secrets");
    }else{
        res.redirect("/login");
    }
    
})

app.get("/logout", (req, res) => {
    req.logout(function(err) {
        if (err) { console.log(`logout failed ${err}`)}
        res.redirect("/");
      });
})

app.post("/register", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    User.register({username: username}, password).then(() => {
        passport.authenticate("local")(req, res, () => {
            res.redirect("/secret"); 
        })
    }).catch((e) => {
        console.log(`user can't register because error happened: ${e}`)
        res.redirect("/register");
    });

});

app.post("/login", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    const user = new User({
        username: username,   //
        password: password
    });
    req.login(user, function(err) {
        if (err) { 
            console.log(`login failed ${err}`)
        }else{
            passport.authenticate("local")(req, res, () => {    //passport.authenticate("local") return a function
                res.redirect("/secret"); 
            })
        }
      });
});


app.listen(3000, ()=>{
    console.log("server runing");
} )
