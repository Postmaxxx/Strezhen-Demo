const jwt = require('jsonwebtoken')
const User = require("../models/User")

module.exports = async (req, res, next) => {
    if (req.method === 'OPTIONS') {
        return next()
    }
    try {               
        const receivedToken = req.headers.authorization?.split(' ')?.[1]
        if (!receivedToken) {
            req.user = { _id: undefined, isAdmin: false }
            return next()
        }
        const decoded = await jwt.verify(receivedToken, process.env.jwtSecret)
        if (!decoded) {
            req.user = { _id: undefined, isAdmin: false }
            return next()
        } 
        if (decoded.iat > decoded.exp) {
            req.user = { _id: undefined, isAdmin: false }
            return next()
        }
        const user = await User.findOne({_id: decoded.userId})       
        if (!user) {
            req.user = { _id: undefined, isAdmin: false }
           return next()
        }
        req.user = {
            _id: decoded.userId,
            isAdmin: user.email === process.env.admEmail
        }
        return next()
    } catch (error) {
        req.user = { _id: undefined, isAdmin: false }
        next()
    }
}

export {}