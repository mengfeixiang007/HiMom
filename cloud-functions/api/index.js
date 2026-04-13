/**
 * EdgeOne Cloud Function Entry Point
 * This file exports the onRequest handler for the describe function
 */

const describeHandler = require('./describe.js');

// Export the onRequest handler
module.exports = describeHandler;
