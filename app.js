require('dotenv').config()
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require('express-session');
const passport = require("passport");
const passportLocalMongoose = require('passport-local-mongoose');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require('mongoose-findorcreate')
 
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
    password: String,
    googleId: String
});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

const User = mongoose.model("User", userSchema);

passport.use(User.createStrategy());

// passport.serializeUser(User.serializeUser());
// passport.deserializeUser(User.deserializeUser());
passport.serializeUser(function(user, cb) {
    process.nextTick(function() {
      cb(null, { id: user.id, username: user.username });
    });
  });
  
passport.deserializeUser(function(user, cb) {
    process.nextTick(function() {
        return cb(null, user);
    });
});

passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/secrets"
    // userProfileURL: 
  },
  function(accessToken, refreshToken, profile, cb) {
    User.findOrCreate({ googleId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));

app.get("/", (req, res) => {
    res.render("home");
});

app.get('/auth/google',
  passport.authenticate('google', { scope: ["profile"] })
);

app.get('/auth/google/secrets', 
passport.authenticate('google', { failureRedirect: "/" }),
function(req, res) {
// Successful authentication, redirect home.
    res.redirect("/secrets");
});


app.get("/login", (req, res) => {
    res.render("login");
});

app.get("/register", (req, res) => {
    res.render("register");
});

app.get("/secrets", (req, res) => {
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
            res.redirect("/secrets"); 
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
                res.redirect("/secrets"); 
            })
        }
      });
});


app.listen(3000, ()=>{
    console.log("server runing");
} )
