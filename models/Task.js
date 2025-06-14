const mongoose = require('mongoose');

/**
 * @swagger
 * components:
 *   schemas:
 *     Task:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Unique identifier for the task
 *         title:
 *           type: string
 *           description: Title of the task
 *         description:
 *           type: string
 *           description: Detailed description of the task
 *         category:
 *           type: string
 *           enum: [delivery, housework, maintenance, shopping, other]
 *           description: Category of the task
 *         budget:
 *           type: number
 *           description: Budget allocated for the task
 *         price:
 *           type: number
 *           description: Final price of the task
 *         creator:
 *           type: string
 *           description: User ID of the task creator
 *         doer:
 *           type: string
 *           description: User ID of the assigned doer
 *         status:
 *           type: string
 *           enum: [pending, assigned, in_progress, completed, cancelled]
 *           description: Current status of the task
 *         paymentStatus:
 *           type: string
 *           enum: [unpaid, pending, paid]
 *           description: Payment status of the task
 *         location:
 *           type: object
 *           properties:
 *             type:
 *               type: string
 *               enum: [Point]
 *               default: Point
 *             coordinates:
 *               type: array
 *               items:
 *                 type: number
 *               description: [longitude, latitude]
 *             address:
 *               type: string
 *               description: Human-readable address
 *         scheduledDate:
 *           type: string
 *           format: date-time
 *           description: Date and time when the task is scheduled
 *         completionDate:
 *           type: string
 *           format: date-time
 *           description: Date and time when the task was completed
 *         images:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               url:
 *                 type: string
 *               publicId:
 *                 type: string
 *         ratings:
 *           type: object
 *           properties:
 *             fromUser:
 *               type: object
 *               properties:
 *                 rating:
 *                   type: number
 *                   minimum: 1
 *                   maximum: 5
 *                 review:
 *                   type: string
 *                 date:
 *                   type: string
 *                   format: date-time
 *             fromDoer:
 *               type: object
 *               properties:
 *                 rating:
 *                   type: number
 *                   minimum: 1
 *                   maximum: 5
 *                 review:
 *                   type: string
 *                 date:
 *                   type: string
 *                   format: date-time
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *       required:
 *         - title
 *         - description
 *         - category
 *         - budget
 *         - price
 *         - creator
 *         - location
 *         - scheduledDate
 */
const taskSchema = new mongoose.Schema({
  budget: {
    type: Number,
    required: [true, 'Budget is required'],
    min: [0, 'Budget cannot be negative']
  },
  paymentStatus: {
    type: String,
    enum: ['unpaid', 'pending', 'paid'],
    default: 'unpaid'
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxLength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxLength: [1000, 'Description cannot exceed 1000 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['delivery', 'housework', 'maintenance', 'shopping', 'other']
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  doer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  status: {
    type: String,
    enum: ['pending', 'assigned', 'in_progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: true,
      validate: {
        validator: function(v) {
          return v.length === 2 && 
                 v[0] >= -180 && v[0] <= 180 && 
                 v[1] >= -90 && v[1] <= 90;
        },
        message: 'Invalid coordinates'
      }
    },
    address: {
      type: String,
      required: true
    }
  },
  scheduledDate: {
    type: Date,
    required: [true, 'Scheduled date is required']
  },
  completionDate: Date,
  images: [{
    url: String,
    publicId: String
  }],
  ratings: {
    fromUser: {
      rating: { type: Number, min: 1, max: 5 },
      review: String,
      date: Date
    },
    fromDoer: {
      rating: { type: Number, min: 1, max: 5 },
      review: String,
      date: Date
    }
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
taskSchema.index({ "location": "2dsphere" });
taskSchema.index({ creator: 1, status: 1 });
taskSchema.index({ doer: 1, status: 1 });
taskSchema.index({ category: 1 });

module.exports = mongoose.model('Task', taskSchema);