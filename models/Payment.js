const mongoose = require('mongoose');

/**
 * @swagger
 * components:
 *   schemas:
 *     Payment:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Unique identifier for the payment
 *         taskId:
 *           type: string
 *           description: ID of the task this payment is for
 *         amount:
 *           type: number
 *           description: Payment amount
 *         currency:
 *           type: string
 *           default: XAF
 *           description: Currency code (default is Cameroon CFA Franc)
 *         status:
 *           type: string
 *           enum: [pending, completed, failed]
 *           description: Current status of the payment
 *         paymentMethod:
 *           type: string
 *           enum: [mtn_mobile_money]
 *           description: Method used for payment
 *         phoneNumber:
 *           type: string
 *           description: Phone number used for mobile money payment
 *         transactionId:
 *           type: string
 *           description: Unique transaction ID from payment provider
 *         payerId:
 *           type: string
 *           description: User ID of the person making the payment
 *         payeeId:
 *           type: string
 *           description: User ID of the payment recipient
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Date and time when the payment was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Date and time when the payment was last updated
 *       required:
 *         - taskId
 *         - amount
 *         - phoneNumber
 *         - payerId
 *         - payeeId
 */
const paymentSchema = new mongoose.Schema({
    taskId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task',
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        default: 'XAF'  // Cameroon CFA Franc
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'pending'
    },
    paymentMethod: {
        type: String,
        enum: ['mtn_mobile_money'],
        default: 'mtn_mobile_money'
    },
    phoneNumber: {
        type: String,
        required: true,
        validate: {
            validator: function(v) {
                // Basic validation for Cameroon phone numbers
                return /^237[0-9]{9}$/.test(v);
            },
            message: props => `${props.value} is not a valid Cameroon phone number!`
        }
    },
    transactionId: {
        type: String,
        sparse: true,
        unique: true
    },
    payerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    payeeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

paymentSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Payment', paymentSchema);