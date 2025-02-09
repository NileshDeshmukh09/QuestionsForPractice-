const bcrypt = require("bcryptjs");
const constants = require("../utils/constants");
const User = require("../models/user.model");
const jwt = require("jsonwebtoken");
const config = require("../configs/auth.config");

/**
 * Contoller for signup/registration
*/

async function signup(req, res) {
    const userObjTOBeSortedInDB = {
        name: req.body.name,
        userId: req.body.userId,
        email: req.body.email,
        userType: req.body.userType,
        password: bcrypt.hashSync(req.body.password, 8)

    }
    /**
     * Insert this new user to the DB
     */

    try {
        const userCreated = await User.create(userObjTOBeSortedInDB);

        console.log("user Created : ", userCreated);


        /**
         *  Return the Response
        */

        const userCreationResponse = {
            name: userCreated.name,
            userId: userCreated.userId,
            email: userCreated.email,
            userType: userCreated.userType,
            userStatus: userCreated.userStatus,
            createdAt: userCreated.createdAt,
            updatedAt: userCreated.updatedAt
        }

        res.status(201).send({
            msg: "User , Added Successully !",
            user: userCreationResponse
        });
    } catch (err) {
        console.error("Error while creating new user", err);
        res.status(500).send({
            message: "some internal error while inserting new user"
        })
    }
}

/**
 * Controller  for SIGN-IN
 */

async function signin(req, res){

    //Search the user if it exists 
    try{
        var user =  await User.findOne({ userId : req.body.userId });
        }catch(err){
            console.log(err.message);
        }
        
        if(user == null){
           return res.status(400).send({
                message : "Failed ! User id doesn't exist"
            })
        }
    
        //User is existing, so now we will do the password matching
        const isPasswordValid = bcrypt.compareSync(req.body.password, user.password);
        
        if( !isPasswordValid ){
            return res.status(401).send({
                message : "Invalid Password"
            })
        }
    
        //** Successfull login */
        //I need to generate access token now
        const token = jwt.sign({id: user.userId}, config.secret,{
            expiresIn : 600
        });
    
        //Send the response back
        res.status(200).send({
            msg : "User login Successfully !",
            user : {
                name : user.name,
                userId : user.userId,
                email : user.email,
                userType : user.userType,
                accessToken : token
            }
        })
    
}


module.exports = { signup , signin }