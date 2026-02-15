const express = require('express');
const router = express.Router();
const { asyncHandler } = require('../middlewareLib/errorHandler');
const SqlAgentController = require('../controllers/sqlAgentController');

/**
 * @swagger
 * /sql-agent/query:
 *   post:
 *     summary: Natural language to SQL
 *     description: Ask a question in plain English; the server generates a read-only SELECT, runs it, and returns rows. Optional brief summary. Requires GEMINI_API_KEY.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [question]
 *             properties:
 *               question:
 *                 type: string
 *                 maxLength: 500
 *                 example: "Top 5 zip codes by median listing price in Pennsylvania"
 *               includeSummary:
 *                 type: boolean
 *                 default: false
 *     responses:
 *       200:
 *         description: Success. data contains sql, rows, and optionally summary.
 *       400:
 *         description: Bad request (missing question, or generated query was not read-only).
 *       503:
 *         description: SQL agent unavailable (Gemini not configured).
 */
router.post(
  '/query',
  asyncHandler(async (req, res) => {
    return SqlAgentController.handleQuery(req, res);
  })
);

module.exports = router;
