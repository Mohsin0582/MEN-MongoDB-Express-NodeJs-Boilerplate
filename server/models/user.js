const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        maxlength: 50
    },
    email: {
        type: String,
        trim: true,
        unique: 1
    },
    password: {
        type: String,
        minglength: 5
    },
    lastname: {
        type: String,
        maxlength: 50
    },
    role: {
        type: Number,
        default: 0
    },
    cart: {
        type: Array,
        default: []
    },
    history: {
        type: Array,
        default: []
    },
    image: String,
    token: {
        type: String,
    },
    tokenExp: {
        type: Number
    }
});

userSchema.pre('save', function(next){
    const user = this;

    if(user.isModified('password')){
        bcrypt.genSalt(saltRounds, function(err, salt){
            if(err) return next(err);
    
            bcrypt.hash( user.password, salt, function(err, hash){
                if(err) return next(err);
                user.password = hash;
                next();
            });
        });
    }else{
        next();
    }
});

userSchema.methods.comparePassword = function(plainPassword, cb){
    bcrypt.compare(plainPassword, this.password, function(err, isMatch){
        if(err) return cb(err);
        cb(null, isMatch);
    });
};

userSchema.methods.generateToken = function(cb){
    var user = this;
    var token = jwt.sign(user._id.toHexString(), 'secret');
    user.token = token;

    user.save(function(err, user){
        if(err) return cb(err);
        cb(null, user);
    });
};

userSchema.statics.findByToken = function(token, cb){
    var user = this;
    jwt.verify(token, 'secret', function(err, decode){
        User.findOne({"_id": decode, "token" : token}, function(){
            if(err) return cb(err);
            cb(null, user);
        });
    })
};


const User = mongoose.model('User', userSchema);

module.exports = { User }