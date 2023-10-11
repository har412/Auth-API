const jwt = require('jsonwebtoken')



const VerifyUser = (req,res,next) =>{
    if(!(req.header('auth-token'))){
        res.status(401).send('You are not authorised')
    }
    else{
        try {       
         
            const user = jwt.verify(req.header('auth-token'),process.env.SECRET)
            if(!user){
                res.status(401).send('You are not authorised')
            }
            else{
                res.locals.user = user
                console.log("in")
                next()
            }
        } catch (error) {
            res.status(401).send('You are not authorised')
        }
    }
    

}


module.exports = {VerifyUser}