/**
 * Database Mock - Legacy Interface
 * 
 * This file maintains backward compatibility while using the new modular structure.
 * For new code, consider importing directly from the mocks directory:
 * 
 * const { DatabaseMock } = require('./mocks');
 * 
 * The new modular structure provides:
 * - BaseMock: Common functionality for all mocks
 * - AnalyticsMock: Handles analytics-related queries
 * - RealEstateMock: Handles real estate-related queries
 * - FacilitiesMock: Handles facilities-related queries
 * - HealthMock: Handles health-related queries
 * - DatabaseMock: Main orchestrator that routes queries to appropriate specialized mocks
 */

const { DatabaseMock } = require('./mocks');

// Export the DatabaseMock class for backward compatibility
module.exports = DatabaseMock; 