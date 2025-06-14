const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const multer = require('multer');

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 } 
});

const profileUpload = upload.fields([
    { name: 'profilePhoto', maxCount: 1 },
    { name: 'identificationDocument', maxCount: 1 }
]);

router.use(authMiddleware);

/**
 * @swagger
 * /api/profile/update:
 *   put:
 *     tags:
 *       - Profile
 *     summary: Update user profile
 *     description: Update user profile information including profile photo and identification documents
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - multipart/form-data
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               profilePhoto:
 *                 type: string
 *                 format: binary
 *                 description: Profile photo image file
 *               identificationDocument:
 *                 type: string
 *                 format: binary
 *                 description: Identification document image file
 *               fullName:
 *                 type: string
 *                 description: User's full name
 *               location:
 *                 type: string
 *                 description: JSON string of location object
 *               spokenLanguages:
 *                 type: string
 *                 description: JSON array of spoken languages
 *               preferredPaymentMethods:
 *                 type: string
 *                 description: JSON array of preferred payment methods
 *               paymentDetails:
 *                 type: string
 *                 description: JSON object with payment details
 *     responses:
 *       200:
 *         description: Profile updated successfully
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
 *                   example: Profile updated successfully
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *                 completionPercentage:
 *                   type: number
 *                   example: 85
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.put('/update', profileUpload, profileController.updateProfile);

/**
 * @swagger
 * /api/profile/me:
 *   get:
 *     tags:
 *       - Profile
 *     summary: Get user profile
 *     description: Get the authenticated user's profile information
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *                 completionPercentage:
 *                   type: number
 *                   example: 85
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Profile not found
 *       500:
 *         description: Server error
 */
router.get('/me', profileController.getProfile);

/**
 * @swagger
 * /api/profile/delete:
 *   delete:
 *     tags:
 *       - Profile
 *     summary: Delete user profile
 *     description: Delete the authenticated user's profile
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile deleted successfully
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
 *                   example: Profile deleted successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.delete('/delete', profileController.deleteProfile);

// Doer-specific routes
// router.put('/doer/availability', 
//     requireRole('doer'),
//     profileController.updateAvailability
// );

module.exports = router;