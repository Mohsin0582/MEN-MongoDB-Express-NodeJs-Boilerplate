const express = require("express");
const app = express();

const mongoose = require("mongoose");

mongoose.connect('mongodb+srv://mohsin:okayokay@cluster0.5tzby.mongodb.net/test?retryWrites=true&w=majority', { useNewUrlParser: true })
.then(() => console.log('MongoDB Connected...'))
.catch(err => console.log(err));

// standard port for Node Js
app.listen(5000);