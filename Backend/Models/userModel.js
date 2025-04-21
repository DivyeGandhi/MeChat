//Name REQ
//Email REQ
//Password REQ
//Picture

const mongoose=require( 'mongoose' )
const bcrypt = require('bcryptjs');


const UserModel = mongoose.Schema({
        name: { 
            type: String, 
            required: true,
        } ,
        email: { 
            type: String, 
            required: true,
            unique: true,
        } ,
        password: { 
            type: String, 
            required: true,
        } ,
        pic: { 
            type: String, 
            default: "https://imgs.search.brave.com/mDztPWayQWWrIPAy2Hm_FNfDjDVgayj73RTnUIZ15L0/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly90NC5m/dGNkbi5uZXQvanBn/LzAyLzE1Lzg0LzQz/LzM2MF9GXzIxNTg0/NDMyNV90dFg5WWlJ/SXllYVI3TmU2RWFM/TGpNQW15NEd2UEM2/OS5qcGc",
        } ,
    },
    {
        timestamps: true,
    } 
)

UserModel.methods.matchPassword = async function (enteredPassword){ 
    return await bcrypt.compare(enteredPassword, this.password);
}

UserModel.pre('save', async function (next){
    if(!this.isModified('password')){
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
})

const User = mongoose.model("User",UserModel);
module.exports = User;