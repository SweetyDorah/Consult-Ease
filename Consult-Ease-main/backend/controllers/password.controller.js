import { User } from "../db/user.model.js";
import crypto from "crypto";
import { sendPasswordResetEmail, sendResetSuccessfulEmail } from "../mail/emails.js";
import bcryptjs from "bcryptjs";

export const forgotPassword = async (req , res) => {
  const {email} = req.body;

  try{
    const user = await User.findOne({email});
    if (!user){
      return res.status(400).json({success: false, message : "User not found"})
    }
    const resetToken = crypto.randomBytes(20).toString("hex");
    const resetTokenExpiresAt = Date.now() + 10 * 60 * 60 * 1000;

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpiresAt = resetTokenExpiresAt;

    await user.save();

    await sendPasswordResetEmail(user.email, `http://localhost:5173/reset-password/${resetToken}`);

    res.status(200).json({
      success : true, 
      message: "Password reset link sent to your email"
    });

  }catch(error) {
    console.log("Error in forget password");
    res.status(400).json({success : false, message : error.message});
  }
}

export const resetPassword = async (req , res) => {
  try {
    const {token} = req.params;
    const { password } = req.body;


    const user = await User.findOne({
      resetPasswordToken : token,
      resetPasswordExpiresAt : {$gt : Date.now()}
    });

    if(!user) {
      return res.status(400).json({success: false, message : "Invalid or Expired Reset token"});
    }

    const hashedPassword  = await bcryptjs.hash(password, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiresAt = undefined;

    await user.save();
    await sendResetSuccessfulEmail(user.email);

    res.status(200).json({
      success : true, 
      message: "Password reset successful"
    });

  } catch(error){
    console.log("Error in forget password");
    res.status(400).json({success : false, message : error.message});
  }
}
