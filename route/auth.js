const express=require('express')
require('dotenv').config();
const crypto = require('crypto')
const router= express.Router()
const mongoose=require('mongoose')
const User=mongoose.model("User")
const bcrypt=require('bcryptjs')
const jwt=require('jsonwebtoken')
const requireLogin=require("../middleware/requireLogin")
const SECRET=process.env.SECRET_KEY
const BASE_URL=process.env.BASE_URL
const SendEmail = require("../utils/SendEmail");



router.post('/api/signup', async (req,res)=>{
    const {name,email,password,profilePic}=req.body
    if(!name || !email || !password){
        return res.status(422).json({error:"fill all field"})
    }
    await User.findOne({email})
    .then((savedUser)=>{
        if(savedUser){
            return res.status(422).json({error:"User already exists"})
        }
        bcrypt.hash(password,12)
        .then((hashedPassword)=>{
            const user=new User({
                name,email,password:hashedPassword,profilePic
            }) 
            user.save()
            .then((user)=>{
                const msg=` <h1>Welcome to Insta-Gram-App</h1><h5>This is an auto generated mail please do not reply</h5>`;
                SendEmail(user.email,"Signup Success",msg);
                res.json({message:"saved user successfully"})
            })
            .catch((err)=>console.log(err))
            
        })
    }).catch((err)=>{
        console.log(err)
    })
})

router.post('/api/signin',(req,res)=>{
    const {email,password}=req.body
    if(!email || !password){
        return res.status(422).json({error:"Fill mandatory fields "})
    }
    User.findOne({email})
    .then(((savedUser)=>{
        bcrypt.compare(password,savedUser.password)
        .then(matched=>{
            if(matched){
                const token=jwt.sign({_id:savedUser._id},SECRET)
                const {_id,name,email,followers,following}=savedUser
                res.json({message:"User SignIn successfully",token,user:{_id,name,email,followers,following}})
            
            }
            else return res.status(422).json({error:"Invalid Credentials"})
        })
        .catch((err)=>console.log(err))
    }))
    .catch((err)=>{
        return res.status(422).json({error:"Invalid Credentials"})
    })
})


router.post('/api/reset-password', async (req,res)=>{
    await crypto.randomBytes(32,(err,buffer)=>{
         if(err){
             console.log(err)
         }
         const token = buffer.toString("hex")
         User.findOne({email:req.body.email})
         .then(user=>{
             if(!user){
                 return res.status(422).json({error:"User dont exists with that email"})
             }
             user.resetToken = token
             user.expireToken = Date.now() + 3600000 //user should reset within 1 hour
             user.save().then( (result)=>{
                    const msg=`
                          <h2>You requested for password reset</h2>
                          <h3>click in this <a href="${BASE_URL}/reset/${token}">link</a> to reset password</h3>
                          `
                  SendEmail(user.email,"Password Reset",msg);
                  res.json({message:"check your email"})
             })

         })
     })
})


router.post('/api/new-password',(req,res)=>{
    const newPassword = req.body.password
    const sentToken = req.body.token
    console.log(sentToken)
    User.findOne({resetToken:sentToken,expireToken:{$gt:Date.now()}})
    .then(user=>{
        if(!user){
            return res.status(422).json({error:"Try again session expired"})
        }
        bcrypt.hash(newPassword,12).then(hashedpassword=>{
           user.password = hashedpassword
           user.resetToken = undefined
           user.expireToken = undefined
           user.save().then((saveduser)=>{
               res.json({message:"password updated success"})
           })
        })
    }).catch(err=>{
        console.log(err)
    })
})


module.exports=router
