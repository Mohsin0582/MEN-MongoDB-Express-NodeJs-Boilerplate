const express = require("express");
const app = express();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

const { User } = require("./models/user");
const config = require("./config/key");
const { response } = require("express");
const { auth } = require("./middleware/auth");


mongoose.connect( config.mongoURI, { useNewUrlParser: true })
.then(() => console.log('MongoDB Connected...'))
.catch(err => console.log(err));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

app.get('/api/user/auth', auth, (req, res) => {
    return res.status(200).json({
        '_id' : req._id,
        'isAuth' : true,
        'email' : req.user.email,
        'name' : req.user.name,
        'lastname' : req.user.lastname,
        'role' : req.user.role
    });
});

app.post('/api/users/register', (req, res) => {
    const user = new User(req.body);
    user.save((err, data) => {
        if(err){
            return res.status(400).json({
                "success" : false,
                "message" : err
            });
        }
        return res.status(200).json({
            "success" : true
        });
    });
});

app.post('/api/user/login', (req, res) => {
    
    // find the email
    User.findOne({email:req.body.email},(err, user)=>{
        if(!user){
            return res.json({
                loginSuccess:   false,
                message     :   "Auth failed, email not found!"
            });
        }

        // compare the password
        user.comparePassword( req.body.password, (err, isMatch)=>{
            if(!isMatch){
                return res.json({
                    loginSuccess:   false,
                    message     :   "Auth failed, wrong password!"
                });
            }
        });

        // generate token
        user.generateToken( (err, user) => {
            if (err){
                return res.status(400).send(err);
            }
            res.cookie('x-auth', user.token).status(200).json({
                loginSuccess:   true,
                message     :   "Auth Successful!"
            });;
        });

    });
});

app.get('/api/users/logout', auth, (req, res) => {
    User.findOneAndUpdate({'_id' : req.user._id}, {token:""}, (err, doc)=>{
        if(err) return res.json({success: false, err});

        return res.status(200).send({
            success : true
        });
    });
});

// process.env.PORT automatically takes the server assigned port
// 5000 is standard port for Node Js
const port = process.env.PORT || 5000;

app.listen(port, ()=>{
    console.log(`Server started at ${port}`);
});