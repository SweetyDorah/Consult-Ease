import bcryptjs from "bcryptjs";
import crypto from "crypto";

import { User } from "../db/user.model.js";
import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.js";

export const checkAuth = async (req, res) => {
	try {
		const user = await User.findById(req.email).select("-password");
		if (!user) {
			return res.status(400).json({ success: false, message: "User not found" });
		}

		res.status(200).json({ 
			success: true, 
			user: {
				_id: user._id,
				email: user.email,
				name: user.name,
				department: user.department,
				role: user.role,  
				isVerified: user.isVerified
			}
		});
	} catch (error) {
		console.log("Error in checkAuth ", error);
		res.status(400).json({ success: false, message: error.message });
	}
};

export const login = async(req, res) => {
  try {
    const {email, password}  = req.body;
    console.log("Login request body:", req.body);
    const user = await User.findOne({email});
    if (!user){
      return res.status(400).json({success : false, message : "Invalid credentials"})
    }
    const isPasswordValid = await bcryptjs.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({success : false, message : "Invalid credentials"})
    }

    generateTokenAndSetCookie(res, user._id);

    user.lastLogin = new Date();
    user.isVerified = true;
    await user.save();

    res.status(201).json({
      success : true, 
      message: "Logged in successfully",
      user : {
        ...user._doc,
        password : undefined,
      },
    });

  } catch(error) {
    console.log("Error in login");
    res.status(400).json({success : false, message : error.message});
  }
}

export const logout = async(req, res) => {
  res.clearCookie("token")
  res.status(200).json({success : true, message : "Logged out successfully"});
}

