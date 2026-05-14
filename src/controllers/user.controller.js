import {asynchandler} from "../utils/asynchandler.js";
import{ApiError} from "../utils/apiError.js"
import{User} from "../models/user.models.js"
import{uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/apiResponse.js";

const registerUser = asynchandler(async(req,res)=>{
    //get user details from frontend
    //validation - non empty
    //check user exists orn not
    //check for images and avatar
    //upload them to cloudinary
    //create user object and entry in db
    //remove password and refresh token
    //check for user creation
    //return res

    const {fullname,email,password,username}= req.body;
    // console.log("email",email);
    if(
        [fullname,email,username,password].some((field)=>
        !field || field.trim() === "")
    ){
        throw new ApiError(400,"All fields are required")
    }
    const existedUser = await User.findOne({
        $or:[{username},{email}]
    })
    if(existedUser){
        throw new ApiError(400,"User already existed")
    }
    // console.log(req.files);
    
    const avatarLocalPath = req.files?.avatar?.[0]?.path
    const coverImageLocalPath=req.files?.coverImage?.[0]?.path


    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar is required")
    }
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = coverImageLocalPath
  ? await uploadOnCloudinary(coverImageLocalPath)
  : null;


    if(!avatar){
        throw new ApiError(400,"Avatar is required")
    }
    const user = await User.create({
        fullname,
        avatar: avatar.secure_url || avatar.url,
        coverImage: coverImage?.secure_url || coverImage?.url || "",
        email,
        password,
        username:username.toLowerCase()
    })
    const createdUser=await User.findById(user._id).select(
        "-password -refreshToken"
    )
    if(!createdUser){
        throw new ApiError(500,"Something went wrong while registering user")
    }
    return res.status(201).json(
        new ApiResponse(200,createdUser,"User Registered Successfully")
    )
    
})

export {registerUser}