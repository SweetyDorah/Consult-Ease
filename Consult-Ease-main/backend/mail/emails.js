import nodemailer from "nodemailer"
import {PASSWORD_RESET_REQUEST_TEMPLATE, VERIFICATION_EMAIL_TEMPLATE, PASSWORD_RESET_SUCCESS_TEMPLATE, REMINDER_EMAIL_TEMPLATE} from "./emailTemplates.js"
import { User } from "../db/user.model.js";

const transporter = nodemailer.createTransport({
  host : "smtp-relay.brevo.com",
  port : 587,
  secure: false,
  auth : {
    user : "89277f001@smtp-brevo.com",
    pass: "f6qsD28awRLVE5FP"
  }
});

export const sendVerificationEmail = async (email, verificationToken) => {
	try {
		const info = transporter.sendMail({
			from: "varshinivenkat02@gmail.com",
			to: email, 
			subject: "Verify your email",
			html : VERIFICATION_EMAIL_TEMPLATE.replace("{verificationCode}", verificationToken),
      category : "Email Verification"
		});

		console.log("Email sent successfully:", info.messageId);
	} catch (error) {
		console.error(`Error sending verification email`, error);
		throw new Error(`Error sending verification email: ${error.message}`);
	}
};

export const sendPasswordResetEmail = async (email, resetURL) => {
	const recipient = email;
	try {
		const info = transporter.sendMail({
			from: "varshinivenkat02@gmail.com",
			to: recipient, 
			subject: "Reset your password",
			html : PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", resetURL),
			category : "Password reset"
		});

		console.log("Email sent successfully:", info.messageId);
	} catch (error) {
		throw new Error(`Error sending password reset: ${error.message}`);
	}
}

export const sendResetSuccessfulEmail = async (email) => {
	const recipient = email;
	try {
		const info = transporter.sendMail({
			from: "varshinivenkat02@gmail.com",
			to: recipient, 
			subject: "Reset your password",
			html : PASSWORD_RESET_SUCCESS_TEMPLATE,
			category : "Password reset"
		});

		console.log("Email sent successfully:", info.messageId);
	} catch (error) {
		throw new Error(`Error sending password reset: ${error.message}`);
	}
}

export const sendReminderEmails = async () => {
  try {
    const users = await User.find({}, "email"); 
    for (const user of users) {
      const info = await transporter.sendMail({
        from: "varshinivenkat02@gmail.com",
        to: user.email,
        subject: "Your Bi-Weekly Reminder",
        html: REMINDER_EMAIL_TEMPLATE,
      });
      console.log(`Reminder sent to ${user.email}: ${info.messageId}`);
    }
  } catch (error) {
    console.error("Failed to send reminder emails:", error.message);
  }
};

