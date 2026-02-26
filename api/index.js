const { app, connectDB } = require('../server/server');

// Ensure DB connects before handling requests on Vercel
module.exports = async (req, res) => {
    // Wait for the async connectDB from server.js to finish
    await connectDB();

    // Now delegate handling to Express
    return app(req, res);
};
