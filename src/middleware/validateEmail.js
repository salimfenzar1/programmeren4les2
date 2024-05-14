function validateEmail(req, res, next) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const { emailAddress } = req.body;

    if (!emailAddress){
        return res.status(400).json({
            status: 400,
            message: 'Email address is required',
            data: {}
        });  
    }

    if (!emailAddress || !emailRegex.test(emailAddress)) {
        return res.status(400).json({
            status: 400,
            message: 'Invalid email address format',
            data: {}
        });
    }

    next();
}

module.exports = validateEmail;