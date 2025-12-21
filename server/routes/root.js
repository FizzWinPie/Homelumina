const express = require("express");
const rootRouter = express.Router();

/**
 * @swagger
 * /:
 *   get:
 *     summary: Root endpoint
 *     description: Returns a message indicating the server is running.
 *     responses:
 *       200:
 *         description: Success. Returns a JSON message.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Hello, World!
 */
rootRouter.get("/", (req, res) => {
  res.json({ message: "Hello, World!" });
});

/**
 * @swagger
 * /autocomplete-search:
 *   get:
 *     summary: Autocomplete search
 *     description: Returns autocomplete suggestions for a given search term (e.g., zip code, city, or state).
 *     parameters:
 *       - in: query
 *         name: searchTerm
 *         schema:
 *           type: string
 *         required: true
 *         description: The term to search for autocomplete suggestions.
 *     responses:
 *       200:
 *         description: Success. Returns an array of autocomplete suggestions.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   matchType:
 *                     type: string
 *                     example: ZipCode
 *                   matchValue:
 *                     type: string
 *                     example: 12345
 *       400:
 *         description: Bad request. Search term is required.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Search term is required
 */
rootRouter.get("/autocomplete-search", (req, res) => {
  const { searchTerm } = req.query;

  if (!searchTerm) {
    return res.status(400).json({ message: "Search term is required" });
  }

  // TODO: Implement autocomplete search logic

  res.json([
    {
      matchType: "ZipCode",
      matchValue: "12345",
    },
    {
      matchType: "City",
      matchValue: "New York, NY",
    },
    {
      matchType: "State",
      matchValue: "NY",
    },
  ]);
});

module.exports = rootRouter;
