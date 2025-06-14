const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authMiddleware, requireRoles } = require('../middlewares/authMiddleware');
const User = require('../models/User');

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Register a new user
 *     description: Register a new user with email or phone
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *               phone:
 *                 type: string
 *                 description: User's phone number
 *               password:
 *                 type: string
 *                 format: password
 *                 description: User's password
 *               fullName:
 *                 type: string
 *                 description: User's full name
 *             required:
 *               - password
 *               - fullName
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: User registered successfully
 *                 token:
 *                   type: string
 *                   description: JWT authentication token
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     email:
 *                       type: string
 *                     phone:
 *                       type: string
 *                     fullName:
 *                       type: string
 *                     role:
 *                       type: string
 *                     emailVerified:
 *                       type: boolean
 *                     phoneVerified:
 *                       type: boolean
 *       400:
 *         description: Bad request
 *       500:
 *         description: Server error
 */
router.post('/register', authController.register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags:
 *       - Auth
 *     summary: User login
 *     description: Login with email/phone and password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *               phone:
 *                 type: string
 *                 description: User's phone number
 *               password:
 *                 type: string
 *                 format: password
 *                 description: User's password
 *             required:
 *               - password
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 token:
 *                   type: string
 *                   description: JWT authentication token
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid credentials or unverified user
 *       500:
 *         description: Server error
 */
router.post('/login', authController.login);

/**
 * @swagger
 * /api/auth/verify-email:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Verify user email
 *     description: Verify user email with the provided token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *               token:
 *                 type: string
 *                 description: Verification token sent to email
 *             required:
 *               - email
 *               - token
 *     responses:
 *       200:
 *         description: Email verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Email verified successfully
 *       400:
 *         description: Invalid token or user not found
 *       500:
 *         description: Server error
 */
router.post('/verify-email', authController.verifyEmail);

/**
 * @swagger
 * /api/auth/verify-phone:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Verify user phone
 *     description: Verify user phone with the provided token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               phone:
 *                 type: string
 *                 description: User's phone number
 *               token:
 *                 type: string
 *                 description: Verification token sent to phone
 *             required:
 *               - phone
 *               - token
 *     responses:
 *       200:
 *         description: Phone verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Phone verified successfully
 *       400:
 *         description: Invalid token or user not found
 *       500:
 *         description: Server error
 */
router.post('/verify-phone', authController.verifyPhone);

/**
 * @swagger
 * /api/auth/users:
 *   get:
 *     tags:
 *       - Auth
 *       - Admin
 *     summary: Get all users (admin only)
 *     description: Get all users with filtering and pagination (admin access required)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [user, doer, admin]
 *         description: Filter users by role
 *       - in: query
 *         name: verificationStatus
 *         schema:
 *           type: string
 *           enum: [verified, unverified]
 *         description: Filter users by verification status
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     users:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/User'
 *                     totalPages:
 *                       type: integer
 *                     currentPage:
 *                       type: integer
 *                     totalUsers:
 *                       type: integer
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       500:
 *         description: Server error
 */
router.get('/users', authMiddleware, requireRoles('admin'), async (req, res) => {
    try {
        const { role, page = 1, limit = 10, verificationStatus } = req.query;
        
        // Build query object
        let query = {};
        if (role) {
            query.role = role;
        }
        
        // Add verification status filtering
        if (verificationStatus === 'verified') {
            query.$or = [
                { emailVerified: true },
                { phoneVerified: true }
            ];
        } else if (verificationStatus === 'unverified') {
            query.$and = [
                { emailVerified: false },
                { phoneVerified: false }
            ];
        }

        const users = await User
            .find(query)
            .select('-password -emailVerificationToken -phoneVerificationToken')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

        const totalUsers = await User.countDocuments(query);

        res.status(200).json({
            success: true,
            data: {
                users,
                totalPages: Math.ceil(totalUsers / limit),
                currentPage: parseInt(page),
                totalUsers
            }
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch users',
            error: error.message
        });
    }
});

/**
 * @swagger
 * /api/auth/users/{userId}:
 *   get:
 *     tags:
 *       - Auth
 *     summary: Get user by ID
 *     description: Get user details by ID (admin or own user only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Access denied
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.get('/users/:userId', authMiddleware, async (req, res) => {
    try {
        const { userId } = req.params;
        
        const user = await User
            .findById(userId)
            .select('-password -emailVerificationToken -phoneVerificationToken');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check permissions
        if (req.user.role !== 'admin' && req.user._id.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        res.status(200).json({
            success: true,
            data: { user }
        });
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch user',
            error: error.message
        });
    }
});

/**
 * @swagger
 * /api/auth/users/search:
 *   get:
 *     tags:
 *       - Auth
 *       - Admin
 *     summary: Search users (admin only)
 *     description: Search users by name, email, or phone (admin access required)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: query
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: Search results retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     users:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/User'
 *                     totalPages:
 *                       type: integer
 *                     currentPage:
 *                       type: integer
 *                     totalUsers:
 *                       type: integer
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       500:
 *         description: Server error
 */
router.get('/users/search', authMiddleware, requireRoles('admin'), async (req, res) => {
    try {
        const { query, page = 1, limit = 10 } = req.query;

        const searchQuery = {
            $or: [
                { fullName: { $regex: query, $options: 'i' } },
                { email: { $regex: query, $options: 'i' } },
                { phone: { $regex: query, $options: 'i' } }
            ]
        };

        const users = await User
            .find(searchQuery)
            .select('-password -emailVerificationToken -phoneVerificationToken')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

        const count = await User.countDocuments(searchQuery);

        res.status(200).json({
            success: true,
            data: {
                users,
                totalPages: Math.ceil(count / limit),
                currentPage: parseInt(page),
                totalUsers: count
            }
        });
    } catch (error) {
        console.error('Error searching users:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to search users',
            error: error.message
        });
    }
});

/**
 * @swagger
 * /api/auth/protected:
 *   get:
 *     tags:
 *       - Auth
 *     summary: Protected route example
 *     description: Example of a protected route requiring authentication
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Access granted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 */
router.get('/protected', authMiddleware, (req, res) => {
    res.json({ success: true, user: req.user });
});

/**
 * @swagger
 * /api/auth/doer-only:
 *   get:
 *     tags:
 *       - Auth
 *     summary: Doer-only route example
 *     description: Example of a route requiring doer role
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Access granted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Doer access granted
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Doer access required
 */
router.get('/doer-only', authMiddleware, requireRoles('doer'), (req, res) => {
    res.json({ success: true, message: 'Doer access granted' });
});

module.exports = router;