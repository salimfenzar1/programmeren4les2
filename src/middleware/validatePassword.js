function validatePassword(req, res, next) {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/;
    const { password } = req.body;

    if (!password){
        return res.status(400).json({
            status: 400,
            message: 'Missing password',
            data: {}
        });
    }

    if (!password || !passwordRegex.test(password)) {
        return res.status(400).json({
            status: 400,
            message: 'Invalid password',
            data: {}
        });
    }

    next();
}

module.exports = validatePassword;