
const mongoose = require("mongoose");

const DB=process.env.DB

mongoose.connect(DB,{useNewUrlParser: true, useUnifiedTopology: true ,useFindAndModify: false }).then(()=>{
    console.log("Database connected successfully")
}).catch((err)=>{
    console.log("Database connection failed :" ,err)
});
mongoose.set("useCreateIndex",true)

