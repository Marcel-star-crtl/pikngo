const mongoose = require('mongoose');

/**
 * @swagger
 * components:
 *   schemas:
 *     Notification:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Unique identifier for the notification
 *         recipient:
 *           type: string
 *           description: User ID of the notification recipient
 *         type:
 *           type: string
 *           enum: [task_created, task_updated, task_assigned, task_completed, task_cancelled, payment_received, payment_sent, new_message, rating_received, system_notification]
 *           description: Type of notification
 *         title:
 *           type: string
 *           description: Notification title
 *         message:
 *           type: string
 *           description: Notification message content
 *         data:
 *           type: object
 *           properties:
 *             taskId:
 *               type: string
 *               description: Related task ID if applicable
 *             paymentId:
 *               type: string
 *               description: Related payment ID if applicable
 *             senderId:
 *               type: string
 *               description: User ID of the sender if applicable
 *             additionalData:
 *               type: object
 *               description: Any additional data related to the notification
 *         priority:
 *           type: string
 *           enum: [low, medium, high]
 *           description: Priority level of the notification
 *         read:
 *           type: boolean
 *           description: Whether the notification has been read
 *         readAt:
 *           type: string
 *           format: date-time
 *           description: Date and time when the notification was read
 *         expireAt:
 *           type: string
 *           format: date-time
 *           description: Date and time when the notification will expire
 *         deliveryStatus:
 *           type: object
 *           properties:
 *             socket:
 *               type: string
 *               enum: [pending, sent, failed]
 *               description: Socket delivery status
 *             push:
 *               type: string
 *               enum: [pending, sent, failed]
 *               description: Push notification delivery status
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Date and time when the notification was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Date and time when the notification was last updated
 *       required:
 *         - recipient
 *         - type
 *         - title
 *         - message
 */
const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    required: true,
    enum: [
      'task_created',
      'task_updated',
      'task_assigned',
      'task_completed',
      'task_cancelled',
      'payment_received',
      'payment_sent',
      'new_message',
      'rating_received',
      'system_notification'
    ]
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  data: {
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task'
    },
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment'
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    additionalData: mongoose.Schema.Types.Mixed
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  read: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date
  },
  expireAt: {
    type: Date
  },
  deliveryStatus: {
    socket: {
      type: String,
      enum: ['pending', 'sent', 'failed'],
      default: 'pending'
    },
    push: {
      type: String,
      enum: ['pending', 'sent', 'failed'],
      default: 'pending'
    }
  }
}, {
  timestamps: true
});

// Index for efficient queries
notificationSchema.index({ recipient: 1, read: 1, createdAt: -1 });
notificationSchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 }); 

// Pre-save middleware to set expiration
notificationSchema.pre('save', function(next) {
  if (!this.expireAt) {
    // Set default expiration to 30 days
    this.expireAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  }
  next();
});

module.exports = mongoose.model('Notification', notificationSchema);