const User = require('../models/User')


module.exports = async (req, res, next) => {
    if (req.method === 'OPTIONS') {
        return next()
    }
    try {
        const { isAdmin } = req.user
        if (!isAdmin) {
            return res.status(403).json({ message: { en: 'Insufficient permissions', ru: "Недостаточно прав"}, errors: []})
        }
        next()  
    } catch (e) {
        return res.status(403).json({ message: { en: `Error while checking permissions: ${e}`, ru: `Ошибка при проверке прав: ${e}`}, errors: []})
    } 
}