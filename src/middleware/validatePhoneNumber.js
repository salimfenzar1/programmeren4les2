function validatePhoneNumber(req, res, next) {
    const phoneRegex = /^06[-\s]?[0-9]{8}$/;
    const { phoneNumber } = req.body;

    if (!phoneNumber || !phoneRegex.test(phoneNumber)) {
        return res.status(400).json({
            status: 400,
            message: 'Invalid phone number. Phone number must be 10 digits and start with 06',
            data: {}
        });
    }

    next();
}

module.exports = validatePhoneNumber;