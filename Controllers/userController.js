const User = require("../Modals/User");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
var Brevo = require("@getbrevo/brevo");
var defaultClient = Brevo.ApiClient.instance;

const bcrypt = require("bcrypt");
const saltRounds = 10;

const Register = (req, res) => {
  try {
    User.find({ email: req.body.email }).then((user) => {
      if (user.length > 0) {
        res.status(409).send("User already present");
      } else {
        bcrypt.hash(req.body.password, saltRounds, function (err, hash) {
          if (err) {
            res.status(500).send({ "Error While hashing user password": err });
          } else {
            const new_user = {
              email: req.body.email,
              password: hash,
            };
            User.create(new_user)
              .then((data) => {
                res.status(200).send({ "User Created Succesfully": data });
                console.log("User created Sucessfully");
              })
              .catch((err) => {
                res.status(500).send({ "Error Adding User to Database": err });
                console.log("Error creating User ", err);
              });
          }
        });
      }
    });
  } catch (error) {
    console.log("Error Adding User to Database", error);
    res.status(500).send("Error Adding User to Database", error);
  }
};

const Login = (req, res) => {
  try {
    User.find({ email: req.body.email }).then((user) => {
      if (user.length > 0) {
        bcrypt
          .compare(req.body.password, user[0].password)
          .then(function (result) {
            if (result == true) {
              const token = jwt.sign(
                { user_id: user[0].email },
                process.env.SECRET
              );
              res.status(200).send({ token: token });
            } else {
              console.log(result);
              res.status(401).send("Password is Incorrect");
            }
          })
          .catch((err) => {
            res.status(500).send("Error While comparing hash", err);
          });
      } else {
        res.status(400).send("User Not Found");
      }
    });
  } catch (error) {
    res.status(500).send("Error While Logging In", error);
  }
};

const getProducts = (req, res) => {
  const user = res.locals.user;
  console.log(user)
  User.find({email:user.user_id})
  .then(user=>{
    // console.log(user)
    res.status(200).send(user[0])
  })
  .catch(err=>{
    res.status(500).send(err)
  })
};

const ResetPassword = (req, res) => {
  if (!req.body.new_password && !req.body.email && !req.body.old_password ) {
    res.status(400).send("data is incomplete");
  } else {
    try {
      User.find({ email: req.body.email }).then((user) => {
        if (user.length > 0) {
          bcrypt
            .compare(req.body.old_password, user[0].password)
            .then(function (result) {
              if (result == true) {
                let user_ = user[0];
                bcrypt.hash(
                  req.body.new_password,
                  saltRounds,
                  function (err, hash) {
                    if (err) {
                      console.log(err);
                      res
                        .status(500)
                        .send({ "Error while creating hash password": err });
                    } else {
                      console.log(hash);
                      user_.password = hash;
                      console.log(user_);
                      User.findOneAndUpdate({ email: req.body.email }, user_)
                        .then((response) => {
                          res.status(200).send({ "Password changed": user_ });
                        })
                        .catch((err) => {
                          res
                            .status(500)
                            .send({ "Error while Reseting password": err });
                        });
                    }
                  }
                );
              } else {
                console.log(result);
                res.status(401).send("Old Password is Incorrect");
              }
            })
            .catch((err) => {
              console.log(err);
              res.status(500).send({ "Error While comparing hash": err });
            });
        } else {
          res.status(400).send("User Not Found");
        }
      });
    } catch (error) {
      res.status(500).send({ "Error while Reseting password": error });
    }
  }
};

const ForgetPassword = (req, res) => {
  try {
    User.find({ email: req.body.email })
      .then((user) => {
        if (user.length > 0) {
          const token = crypto.randomBytes(16).toString("hex");
          const currentTime = new Date();
          const expirationTime = new Date(currentTime.getTime() + 180 * 1000);
          user[0].expiry = expirationTime;
          user[0].resetToken = token;

          User.findOneAndUpdate({ email: req.body.email }, user[0])
            .then((response) => {
              //send Email wit token
              var apiKey = defaultClient.authentications["api-key"];
              apiKey.apiKey = process.env.API_KEY;
              var apiInstance = new Brevo.TransactionalEmailsApi();
              let sendSmtpEmail = new Brevo.SendSmtpEmail();

              sendSmtpEmail.subject = "Password Reset";
              sendSmtpEmail.htmlContent = `<html><body><h1>Password Reset</h1>
                <p>Please use following Token to reset the password by going to following Link .
                  <a href='${req.body.base_url}/reset-token?email=${req.body.email}' >Reset Password</a>
                </p>
                <p style="color:white;background:black;padding:20px;border-radius:10px" > ${token} </p>
                <p>Thanks & Regards</p>
                <p>Auth Application</p>
                
                </body></html>`;
              sendSmtpEmail.sender = {
                name: "harkirat",
                email: "harkirat.tws@gmail.com",
              };
              sendSmtpEmail.to = [
                { email: `${req.body.email}`, name: "harkirat" },
              ];
              sendSmtpEmail.replyTo = {
                name: "harkirat",
                email: "harkirat.tws@gmail.com",
              };

              apiInstance.sendTransacEmail(sendSmtpEmail).then(
                function (data) {
                  console.log(
                    "API called successfully. Returned data: " +
                      JSON.stringify(data)
                  );
                  res.status(200).send("Email sent with token ");
                },
                function (error) {
                  console.error("error in sending email", error);
                  res.status(500).send({ "Error while Sending Email ": error });
                }
              );
            })
            .catch((err) => {
              res.status(500).send({ "Error while storing token ": err });
            });
        } else {
          res.status(401).send("User Not Found");
        }
      })
      .catch((err) => {
        res.status(500).send({ "Error while getting user ": err });
      });
  } catch (error) {
    res.status(500).send({ "Error in Forget Password ": error });
  }
};

const UpdatePasswordWithToken = (req, res) => {
  // get the user token for authentication
  // get email fron user
  try {
    User.find({ email: req.body.email })
      .then((user) => {
        if (user.length > 0) {
          const currentTime = new Date();
          if (user[0].expiry > new Date(currentTime.getTime())) {
            if (user[0].resetToken == req.body.token) {
              let user_ = user[0];
              bcrypt.hash(req.body.password, saltRounds, function (err, hash) {
                if (err) {
                  console.log(err);
                  res
                    .status(500)
                    .send({ "Error while creating hash password": err });
                } else {
                  console.log(hash);
                  user_.password = hash;
                  console.log(user_);
                  User.findOneAndUpdate({ email: req.body.email }, user_)
                    .then((response) => {
                      res.status(200).send({ "Password changed": user_ });
                    })
                    .catch((err) => {
                      res
                        .status(500)
                        .send({ "Error while Reseting password": err });
                    });
                }
              });
            } else {
              res.status(400).send("wrong token ");
            }
          } else {
            res.status(402).send("Token Expired");
          }
        } else {
          res.status(401).send("User not found");
        }
      })
      .catch((err) => {
        res.status(500).send({ "Error in fetching user": err });
      });
  } catch (error) {
    res.status(500).send({ "Error in email verification ": error });
  }
};

const generateTokenAndMailToVerifyEmail = (req, res) => {
  // To Generate Token
  // User will input email
  // then we need to check User is present or not ?
  // If user present then Email user with a random hex token .
  // Also store in Db with Expiry.
  // else say user not present
  console.log(req.body.base_url)
  try {
    User.find({ email: req.body.email })
      .then((user) => {
        if (user.length > 0) {
          if(user[0].verified ==  true){
            res.status(409).send('User Already Verified')
          }
          else{
            const token = crypto.randomBytes(16).toString("hex");
          const currentTime = new Date();
          const expirationTime = new Date(currentTime.getTime() + 180 * 1000);
          user[0].verifyExpiry = expirationTime;
          user[0].verifyToken = token;
          User.findOneAndUpdate({ email: req.body.email }, user[0])
            .then((response) => {
              //send Email with token
              var apiKey = defaultClient.authentications["api-key"];
              apiKey.apiKey = process.env.API_KEY;
              var apiInstance = new Brevo.TransactionalEmailsApi();
              let sendSmtpEmail = new Brevo.SendSmtpEmail();
              // <a href='https://auth-app-2023-react.netlify.app/verify-token?email=${req.body.email}' >Verify Email</a>
              sendSmtpEmail.subject = "Verify Your Email ";
              sendSmtpEmail.htmlContent = `<html><body><h1>Email Verification</h1>
            <p>Please use following Token to Verify your Email by going to following Link .
              <a href='${req.body.base_url}/verify-token?email=${req.body.email}' >Verify Email</a>
            </p>
            <p style="color:white;background:black;padding:20px;border-radius:10px" > ${token} </p>
            <p>Thanks & Regards</p>
            <p>Auth Application</p>
            </body></html>`;
              sendSmtpEmail.sender = {
                name: "harkirat",
                email: "harkirat.tws@gmail.com",
              };
              sendSmtpEmail.to = [
                { email: `${req.body.email}`, name: "harkirat" },
              ];
              sendSmtpEmail.replyTo = {
                name: "harkirat",
                email: "harkirat.tws@gmail.com",
              };

              apiInstance.sendTransacEmail(sendSmtpEmail).then(
                function (data) {
                  console.log(
                    "API called successfully. Returned data: " +
                      JSON.stringify(data)
                  );
                  res.status(200).send("Email sent with token ");
                },
                function (error) {
                  console.error("error in sending email", error);
                  res.status(500).send({ "Error while Sending Email ": error });
                }
              );
            })
            .catch((err) => {
              res.status(500).send({ "Error while storing token ": err });
            });
        }
          
        } else {
          res.status(400).send("User Not Present");
        }
      })
      .catch((err) => {
        res.status(500).send({ message: "Internal server Error", error: err });
      });
  } catch (err) {
    res.status(500).send({ message: "Internal server Error", error: err });
  }
};

const VerifyEmailWithToken = (req, res) => {
  try {
    User.find({ email: req.body.email })
      .then((user) => {
        if (user.length > 0) {
         
            const currentTime = new Date();
            if (user[0].verifyExpiry > new Date(currentTime.getTime())) {
              if (user[0].verifyToken == req.body.token) {
                let user_ = user[0];
                user_.verified = true;
                User.findOneAndUpdate({ email: req.body.email }, user_)
                  .then((response) => {
                    res.status(200).send({ "User verified": user_ });
                  })
                  .catch((err) => {
                    res.status(500).send({ "Error while Verifying User": err });
                });
              } else {
                res.status(401).send("wrong token ");
              }
            } else {
              res.status(402).send("Token Expired");
            }
          
          
        } else {
          res.status(400).send("User not found");
        }
      })
      .catch((err) => {
        res.status(500).send({ "Error in fetching user": err });
      });
  } catch (error) {
    res.status(500).send({ "Error in email verification ": error });
  }
};

const Welcome = (req, res) => {
  res.send("Welcome to AuthAPI");
};

module.exports = {
  Login,
  Register,
  getProducts,
  ResetPassword,
  ForgetPassword,
  UpdatePasswordWithToken,
  generateTokenAndMailToVerifyEmail,
  VerifyEmailWithToken,
  Welcome,
};