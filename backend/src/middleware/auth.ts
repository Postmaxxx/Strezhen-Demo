const jwt = require('jsonwebtoken')
const User = require("../models/User")

module.exports = async (req, res, next) => {
    if (req.method === 'OPTIONS') {
        return next()
    }
    try {
        req.test = '111'
        const receivedToken = req.headers.authorization?.split(' ')?.[1]
        if (!receivedToken) {
            return res.status(401).json({message: {en: 'No token (you are not authorized)', ru: 'Нет токена (вы не авторизован)'}, errors: []})
        }
        const decoded = jwt.verify(receivedToken, process.env.jwtSecret)
        if (!decoded) {
            return res.status(401).json({ message: { en: 'Token is invalid', ru: "Токен недействителен"}, errors: []})
        }
        if (decoded.iat > decoded.exp) {
            return res.status(401).json({ message: { en: 'Token is expired', ru: "Токен истек"}, errors: []})
        }
        const user = await User.findOne({_id: decoded.userId})       
        if (!user) {
            return res.status(404).json({ message: { en: 'User was not found', ru: "Пользователь не найден"}, errors: []})
        }
        req.user ? req.user.id = decoded.userId : req.user = {id: decoded.userId}
        req.user.isAdmin = user.email === process.env.admEmail

        next()
    } catch (error) {
        return res.status(401).json({message: {en: `Problem with token: ${error}`, ru: `Проблемы с токеном: ${error}`}, errors: []})
    }

}

export {}