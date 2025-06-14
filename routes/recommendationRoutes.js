const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middlewares/authMiddleware');
const TaskMatchingService = require('../services/TaskMatchingService');
const TaskRecommendationService = require('../services/TaskRecommendationService');

router.use(authMiddleware);

/**
 * @swagger
 * /api/recommendations/match:
 *   post:
 *     tags:
 *       - Recommendations
 *     summary: Find best tasker match
 *     description: Find the best tasker match for a given task
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Title of the task
 *               description:
 *                 type: string
 *                 description: Description of the task
 *               location:
 *                 type: object
 *                 properties:
 *                   type:
 *                     type: string
 *                     default: Point
 *                   coordinates:
 *                     type: array
 *                     items:
 *                       type: number
 *                     description: [longitude, latitude]
 *               requiredSkills:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Skills required for the task
 *             required:
 *               - location
 *               - requiredSkills
 *     responses:
 *       200:
 *         description: Best match found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 tasker:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     fullName:
 *                       type: string
 *                     skills:
 *                       type: array
 *                       items:
 *                         type: string
 *                     currentLocation:
 *                       type: object
 *                       properties:
 *                         type:
 *                           type: string
 *                         coordinates:
 *                           type: array
 *                           items:
 *                             type: number
 *                 distance:
 *                   type: number
 *                   description: Distance in kilometers
 *       404:
 *         description: No suitable tasker found
 *       500:
 *         description: Server error
 */
router.post('/match', async (req, res) => {
    try {
        const task = req.body;
        const bestMatch = await TaskMatchingService.findBestMatch(task);
        
        if (!bestMatch) {
            return res.status(404).json({ message: 'No suitable tasker found' });
        }
        
        res.json({ 
            tasker: bestMatch,
            distance: TaskMatchingService.calculateDistance(
                task.location.coordinates[1],
                task.location.coordinates[0],
                bestMatch.currentLocation.coordinates[1],
                bestMatch.currentLocation.coordinates[0]
            )
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * @swagger
 * /api/recommendations/recommend:
 *   post:
 *     tags:
 *       - Recommendations
 *     summary: Get tasker recommendations
 *     description: Get multiple tasker recommendations for a task
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               task:
 *                 type: object
 *                 properties:
 *                   title:
 *                     type: string
 *                   description:
 *                     type: string
 *                   location:
 *                     type: object
 *                     properties:
 *                       type:
 *                         type: string
 *                         default: Point
 *                       coordinates:
 *                         type: array
 *                         items:
 *                           type: number
 *                   requiredSkills:
 *                     type: array
 *                     items:
 *                       type: string
 *               limit:
 *                 type: integer
 *                 default: 5
 *                 description: Maximum number of recommendations to return
 *             required:
 *               - task
 *     responses:
 *       200:
 *         description: Recommendations found
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   tasker:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       fullName:
 *                         type: string
 *                       skills:
 *                         type: array
 *                         items:
 *                           type: string
 *                   matchScore:
 *                     type: number
 *                   distance:
 *                     type: number
 *                     description: Distance in kilometers
 *       404:
 *         description: No recommendations found
 *       500:
 *         description: Server error
 */
router.post('/recommend', async (req, res) => {
    try {
        const { task, limit } = req.body;
        const recommendations = await TaskRecommendationService.findBestMatches(task, limit);
        
        if (!recommendations || recommendations.length === 0) {
            return res.status(404).json({ message: 'No recommendations found' });
        }
        
        res.json(recommendations);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;