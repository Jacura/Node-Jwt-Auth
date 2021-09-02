require("dotenv").config();
require("./config/database").connect();
const express = require("express");
const bcrypt = require("bcrypt")
const auth = require("./middleware/auth");
const jwt = require("jsonwebtoken")

const app = express();

app.use(express.json());

const User = require("./model/user");

app.post("/signup", async (req, res) => {


    try {

        const { name, email,  password } = req.body;


        if (!(email && password && name)) {
            return res.status(400).json({
                message: 'All input is required '
            })

        }

        const oldUser = await User.findOne({ email });

        if (oldUser) {
            return res.status(409).json({
                message: 'User Already Exist. Please Login'
            })

        }


        encryptedPassword = await bcrypt.hash(password, 10);


        const user = await User.create({
            name,
            email: email.toLowerCase(),
    
            password: encryptedPassword,
        });


        const token = jwt.sign(
            { user_id: user._id, email },
            process.env.TOKEN_KEY,
            {
                expiresIn: "2h",
            }
        );

        user.token = token;
        return res.status(201).json({
            user
        })

    } catch (err) {
        console.log(err);
    }

});



app.post("/login", async (req, res) => {


    try {

        const { email, password } = req.body;


        if (!(email && password )) {
            return res.status(400).json({
                message: 'All input is required '
            })

        }

        const user = await User.findOne({ email:email });

        // console.log(user)
        
        //check If password or user found
        if (user && (await bcrypt.compare(password, user.password))) {

            const token = jwt.sign(
                { user_id: user._id, email },
                process.env.TOKEN_KEY,
                {
                    expiresIn: "2h",
                }
            );


            user.token = token;

            return res.status(200).json({
                message: 'User Login Success'
            })

        }
        return res.status(400).json({
            message: 'Invalid Credentials'
        })

    } catch (err) {
        console.log(err);
    }

});





app.post("/home", auth, (req, res) => {
    res.status(200).send("You are Welcomed!!! ");
});

module.exports = app;