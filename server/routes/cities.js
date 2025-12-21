const express = require("express");
const citiesRouter = express.Router();

/**
 * @swagger
 * /cities/top:
 *   get:
 *     summary: Get top 3 cities by metrics
 *     description: Returns an array of the top 3 cities, each with city name, state, population, average listing price, and average health measure.
 *     responses:
 *       200:
 *         description: Success. Returns a JSON array of the top 3 cities with their metrics.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   city:
 *                     type: string
 *                     example: New York
 *                   state:
 *                     type: string
 *                     example: NY
 *                   population:
 *                     type: integer
 *                     example: 12345
 *                   avgListingPrice:
 *                     type: integer
 *                     example: 123456
 *                   avgHealthMeasure:
 *                     type: number
 *                     format: float
 *                     example: 0.01
 */
citiesRouter.get("/top", (req, res) => {
  res.json([
    {
      city: "New York",
      state: "NY",
      population: 12345,
      avgListingPrice: 123456,
      avgHealthMeasure: 0.01,
    },
    {
      city: "Los Angeles",
      state: "CA",
      population: 12345,
      avgListingPrice: 123456,
      avgHealthMeasure: 0.01,
    },
    {
      city: "Chicago",
      state: "IL",
      population: 12345,
      avgListingPrice: 123456,
      avgHealthMeasure: 0.01,
    },
  ]);
});

module.exports = citiesRouter;
