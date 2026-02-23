const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    const token = req.header('Authorization');
    if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });

    try {
        const splitToken = token.startsWith('Bearer ') ? token.split(' ')[1] : token;
        const decoded = jwt.verify(splitToken, process.env.JWT_SECRET);
        req.user = decoded.user;
        next();
    } catch (err) {
        res.status(401).json({ msg: 'Token is not valid' });
    }
};

const superAdminMiddleware = (req, res, next) => {
    if (req.user.role !== 'SuperAdmin') {
        return res.status(403).json({ msg: 'Access denied. SuperAdmin restricted.' });
    }
    next();
};

module.exports = { authMiddleware, superAdminMiddleware };
