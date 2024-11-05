const bcrypt = require('bcrypt');
const { models } = require('../util/database');
const SibApiV3Sdk = require('sib-api-v3-sdk');

// Initialize Sendinblue API client
const apiKey = new SibApiV3Sdk.ApiClient();
apiKey.authentications['api-key'].apiKey = process.env.SENDINBLUE_API_KEY;
SibApiV3Sdk.ApiClient.instance = apiKey;
const transactionalEmailsApi = new SibApiV3Sdk.TransactionalEmailsApi();

const createPasswordResetRequest = async (email) => {
    try {
        const user = await models.User.findOne({ where: { email } });
        if (!user) throw new Error('User not found.');

        const request = await models.ForgotPasswordRequest.create({ userId: user.id });
        return request;
    } catch (error) {
        throw new Error('Error creating password reset request: ' + error.message);
    }
};

const sendResetPasswordEmail = async (email, resetLink) => {
    const emailContent = {
        sender: { name: 'Your App Name', email: 'support@yourapp.com' },
        to: [{ email }],
        subject: 'Password Reset Request',
        htmlContent: `<html><body><h1>Reset Your Password</h1><p>Click <a href="${resetLink}">here</a> to reset your password.</p></body></html>`,
    };

    try {
        await transactionalEmailsApi.sendTransacEmail(emailContent);
    } catch (error) {
        throw new Error('Error sending reset password email: ' + error.message);
    }
};

const resetPassword = async (requestId, newPassword) => {
    try {
        const request = await models.ForgotPasswordRequest.findOne({ where: { id: requestId, isActive: true } });
        if (!request) throw new Error('Invalid or expired reset link.');

        const user = await models.User.findByPk(request.userId);
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        request.isActive = false;
        await request.save();
    } catch (error) {
        throw new Error('Error resetting password: ' + error.message);
    }
};

module.exports = { createPasswordResetRequest, sendResetPasswordEmail, resetPassword };
