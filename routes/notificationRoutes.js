const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middlewares/authMiddleware');
const notificationController = require('../controllers/notificationController');
const pushNotificationService = require('../services/pushNotificationService');
const { admin } = require('../config/firebase');

/**
 * @swagger
 * /api/notifications/register-token:
 *   post:
 *     tags:
 *       - Notifications
 *     summary: Register FCM token
 *     description: Register a Firebase Cloud Messaging token for push notifications
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *                 description: Firebase Cloud Messaging token
 *               device:
 *                 type: string
 *                 description: Device identifier
 *               platform:
 *                 type: string
 *                 enum: [android, ios, web]
 *                 description: Device platform
 *             required:
 *               - token
 *               - device
 *               - platform
 *     responses:
 *       200:
 *         description: FCM token registered successfully
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
 *                   example: FCM token registered successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/register-token', authMiddleware, async (req, res) => {
  try {
    const { token, device, platform } = req.body;
    const userId = req.user._id;

    if (!token || !device || !platform) {
      return res.status(400).json({
        success: false,
        message: 'Token, device, and platform are required'
      });
    }

    await pushNotificationService.registerToken(userId, token, device, platform);

    res.status(200).json({
      success: true,
      message: 'FCM token registered successfully'
    });
  } catch (error) {
    console.error('Error registering FCM token:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @swagger
 * /api/notifications/remove-token:
 *   delete:
 *     tags:
 *       - Notifications
 *     summary: Remove FCM token
 *     description: Remove a Firebase Cloud Messaging token
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *                 description: Firebase Cloud Messaging token to remove
 *             required:
 *               - token
 *     responses:
 *       200:
 *         description: FCM token removed successfully
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
 *                   example: FCM token removed successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.delete('/remove-token', authMiddleware, async (req, res) => {
  try {
    const { token } = req.body;
    const userId = req.user._id;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Token is required'
      });
    }

    await pushNotificationService.removeToken(userId, token);

    res.status(200).json({
      success: true,
      message: 'FCM token removed successfully'
    });
  } catch (error) {
    console.error('Error removing FCM token:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     tags:
 *       - Notifications
 *     summary: Get unread notifications
 *     description: Get unread notifications for the authenticated user
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *         description: Notifications retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Notification'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     totalNotifications:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                     currentPage:
 *                       type: integer
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/', authMiddleware, notificationController.getUnreadNotifications);

/**
 * @swagger
 * /api/notifications/{notificationId}/read:
 *   put:
 *     tags:
 *       - Notifications
 *     summary: Mark notification as read
 *     description: Mark a notification as read
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: notificationId
 *         required: true
 *         schema:
 *           type: string
 *         description: Notification ID
 *     responses:
 *       200:
 *         description: Notification marked as read
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
 *                   example: Notification marked as read
 *                 data:
 *                   $ref: '#/components/schemas/Notification'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not authorized to access this notification
 *       404:
 *         description: Notification not found
 *       500:
 *         description: Server error
 */
router.put('/:notificationId/read', authMiddleware, notificationController.markNotificationAsRead);

/**
 * @swagger
 * /api/notifications/{notificationId}:
 *   delete:
 *     tags:
 *       - Notifications
 *     summary: Delete notification
 *     description: Delete a notification
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: notificationId
 *         required: true
 *         schema:
 *           type: string
 *         description: Notification ID
 *     responses:
 *       200:
 *         description: Notification deleted successfully
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
 *                   example: Notification deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not authorized to delete this notification
 *       404:
 *         description: Notification not found
 *       500:
 *         description: Server error
 */
router.delete('/:notificationId', authMiddleware, notificationController.deleteNotification);

// Test endpoints for notifications
/**
 * @swagger
 * /api/notifications/test/socket:
 *   post:
 *     tags:
 *       - Notifications
 *       - Testing
 *     summary: Test socket notification
 *     description: Test sending a socket notification
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 description: User ID to send notification to
 *               event:
 *                 type: string
 *                 description: Socket event name
 *               data:
 *                 type: object
 *                 description: Data to send with the notification
 *             required:
 *               - userId
 *               - event
 *               - data
 *     responses:
 *       200:
 *         description: Socket notification sent
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/test/socket', authMiddleware, async (req, res) => {
  try {
    const socketService = require('../services/socketService');
    const { userId, event, data } = req.body;
    
    socketService.emitToUser(userId, event, data);
    
    res.status(200).json({
      success: true,
      message: 'Socket notification sent'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @swagger
 * /api/notifications/test/push:
 *   post:
 *     tags:
 *       - Notifications
 *       - Testing
 *     summary: Test push notification
 *     description: Test sending a push notification to the current user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Push notification sent
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/test/push', authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;
    const notification = {
      title: 'Test Notification',
      body: 'This is a test notification',
      data: {
        type: 'test',
        timestamp: new Date().toISOString()
      }
    };

    const result = await pushNotificationService.sendToUser(userId, notification);
    res.status(200).json({
      success: true,
      message: 'Test notification sent',
      result
    });
  } catch (error) {
    console.error('Test notification error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @swagger
 * /api/notifications/test/both:
 *   post:
 *     tags:
 *       - Notifications
 *       - Testing
 *     summary: Test both notification types
 *     description: Test sending both socket and push notifications
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 description: User ID to send notification to
 *               event:
 *                 type: string
 *                 description: Socket event name
 *               notification:
 *                 type: object
 *                 properties:
 *                   title:
 *                     type: string
 *                   body:
 *                     type: string
 *                   data:
 *                     type: object
 *             required:
 *               - userId
 *               - event
 *               - notification
 *     responses:
 *       200:
 *         description: Both notifications sent
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/test/both', authMiddleware, async (req, res) => {
  try {
    const socketService = require('../services/socketService');
    const pushService = require('../services/pushNotificationService');
    const { userId, event, notification } = req.body;
    
    // Send both socket and push notifications
    socketService.emitToUser(userId, event, notification.data);
    await pushService.sendToUser(userId, notification);
    
    res.status(200).json({
      success: true,
      message: 'Both notifications sent'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;