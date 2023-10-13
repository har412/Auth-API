const express = require('express');
const { Register, Login, getProducts, ResetPassword, Welcome,ForgetPassword, UpdatePasswordWithToken, generateTokenAndMailToVerifyEmail, VerifyEmailWithToken } = require('../Controllers/userController');
const { VerifyUser } = require('../Middlewares/Auth');

const router= express.Router();

//  Schemas ---------------------
/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - email
 *       properties:
 *         email:
 *           type: email
 *           description: This is the email of the user
 *         password:
 *           type: string
 *           description: This is the password for the user(hashed) , by default its null
 *         resetToken:
 *           type: string
 *           description: This token is generated on forget password , by default its null
 *         expiry:
 *           type: date
 *           description: This is the time stored for expiry of token after 3 mins of generation , by default its null
 *       example:
 *         email: test@gmail.com
 *         password: "123456"
 *     Token:
 *       type: object
 *       required:
 *         - token 
 *       properties:
 *         token :
 *           type: string
 *           token: This is jwt token
 *       example:
 *         token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoidGVzdEBnbWFpbC5jb20iLCJpYXQiOjE2OTcwMTU5NTN9.2GCFmJbSY5gv8mw_5aaIua7b-dS-HdVEX-gFhPkfVJ0"
 *     Password:
 *       type: object
 *       required:
 *         - old_password 
 *         - new_password 
 *         - email 
 *       properties:
 *         password :
 *           type: string
 *       example:
 *         email: "test@gmail.com"
 *         old_password: "123456"
 *         new_password: "1234567"
 *     Email:
 *       type: object
 *       required:
 *         - email 
 *         - base_url
 *       properties:
 *         email :
 *           type: email
 *         base_url :
 *           type: string
 *       example:
 *         email: "test@gmail.com"
 *         base_url: "http://localhost:8080"
 *     Reset:
 *       type: object
 *       required:
 *         - email
 *         - token
 *         - password
 *       properties:
 *         email :
 *           type: email
 *         token :
 *           type: string
 *         password :
 *           type: string
 *       example:
 *         email: "test@gmail.com"
 *         token: "c0b8d3e6e674f28e1df4e829a515e6f5"
 *         password: "123456"
 *     Verify:
 *       type: object
 *       required:
 *         - email
 *         - token
 *         - password
 *       properties:
 *         email :
 *           type: email
 *         token :
 *           type: string
 *       example:
 *         email: "test@gmail.com"
 *         token: "c0b8d3e6e674f28e1df4e829a515e6f5"
 */

// --------------------------- API's Start -----------------
/**
 * @swagger
 * tags:
 *   name: Register
 *   description: Create new user by email and password
 * /register:
 *   post:
 *     summary: Create a new User
 *     tags: [Register]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: The created User.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       500:
 *         description: Internal server error
 *       409:
 *         description: User Already Present
 * 
 *
 */
router.route('/register').post(Register)





/**
 * @swagger
 * tags:
 *   name: Login
 *   description: Login User to get JWT Token
 * /login:
 *   post:
 *     summary: Login User to token for further access
 *     tags: [Login]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: User Login Success
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Token'
 *       500:
 *         description: Internal server error
 *       400:
 *         description: User Not Found
 *       401:
 *         description: Wrong Password
 *
 */

router.route('/login').post( Login)

/**
 * @swagger
 * tags:
 *   name: Private Resource
 *   description: This is the private data specific to user
 * /private:
 *   get:
 *     summary: User Authenticated resource
 *     tags: [Private Resource]
 *     parameters:
 *     - name: auth-token
 *       in: header
 *       description : Its jwt token should be given with request if needed for specific user
 *       required: false
 *       type: string
 *     responses:
 *       200:
 *         description: Dashboard 
 *       500:
 *         description: Internal server error
 *       401:
 *         description: User Not Authorised
 * 
 *
 */
router.route('/private').get(VerifyUser,getProducts)

/**
 * @swagger
 * tags:
 *   name: Reset Password
 *   description: Reset Password Using  New Password
 * /reset-password:
 *   post:
 *     summary: Reset Password with New password and old password with email , which you can get from params of url.
 *     tags: [Reset Password]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Password'
 *     responses:
 *       200:
 *         description: Reset Sucessfull
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       500:
 *         description: Internal server error
 *       401:
 *         description: Password is Incorrect
 *       400:
 *         description: User Not Found
 * 
 *
 */
router.route('/reset-password').post(  ResetPassword)
/**
 * @swagger
 * tags:
 *   name: Forget Password
 *   description: It Lets User change password by verifying Email
 * /forget-password:
 *   post:
 *     summary: It lets user change password by entering email , code will be sent on Email which is valid for 3 mins
 *     tags: [Forget Password]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Email'
 *     responses:
 *       200:
 *         description: Email sent with token
 *       500:
 *         description: Internal server err or
 *       401:
 *         description: User Not Found
 *
 */
router.route('/forget-password').post(ForgetPassword)

/**
 * @swagger
 * tags:
 *   name: Reset Password With Token
 *   description: It Lets User change password by input token sent on email by forget password endpoint
 * /reset-password-with-token:
 *   post:
 *     summary: It Lets User change password by input token sent on email by forget password endpoint
 *     tags: [Reset Password With Token]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Reset'
 *     responses:
 *       200:
 *         description: Password Changed
 *       500:
 *         description: Internal server err or
 *       401:
 *         description: User Not Found
 *       400:
 *         description: Token Expired
 *
 */
router.route('/reset-password-with-token').post(UpdatePasswordWithToken)

/**
 * @swagger
 * tags:
 *   name: Generate Token and Email to verify User
 *   description: It Lets User to send an email with token to verify email of user
 * /generate-token-to-verify-email:
 *   post:
 *     summary: It Lets User to send an email with token to verify email of user which is valid for 3 mins
 *     tags: [Generate Token and Email to verify User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Email'
 *     responses:
 *       200:
 *         description: Email sent with token
 *       409:
 *         description: User Already Verified
 *       500:
 *         description: Internal server err or
 *       400:
 *         description: User Not Found
 *
 */
router.route('/generate-token-to-verify-email').post(generateTokenAndMailToVerifyEmail)


/**
 * @swagger
 * tags:
 *   name: Verify User With Token
 *   description: It Lets User verify Email by input token sent on email   
 * /verify-user-with-token:
 *   post:
 *     summary: It Lets User verify Email by input token sent on email 
 *     tags: [Verify User With Token]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Verify'
 *     responses:
 *       200:
 *         description: User Verified 
 *       500:
 *         description: Internal server err or
 *       400:
 *         description: User Not Found
 *       401:
 *         description: Wrong Token
 *       402:
 *         description: Token Expired
 *
 */

router.route('/verify-user-with-token').post(VerifyEmailWithToken)

router.route('/').get(Welcome)

module.exports = router