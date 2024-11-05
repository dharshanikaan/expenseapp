const forgotPasswordService = require('../services/passwordservices');

const forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await forgotPasswordService.createPasswordResetRequest(email);
        const resetLink = `http://localhost:3000/password/resetpassword/${user.resetId}`;
        await forgotPasswordService.sendResetPasswordEmail(email, resetLink);
        res.status(200).json({ message: 'Reset link sent to your email.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const resetPassword = async (req, res) => {
    const { id } = req.params;
    const { newPassword } = req.body;

    try {
        await forgotPasswordService.resetPassword(id, newPassword);
        res.status(200).json({ message: 'Password updated successfully.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { forgotPassword, resetPassword };
