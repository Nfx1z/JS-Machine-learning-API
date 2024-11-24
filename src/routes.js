const handler = require('./handler');

// Define the routes
const routes = [
    {
        method: 'POST',
        path: '/predict',
        options: {
            payload: {
                maxBytes: 1000000,  // maximum payload size: 1MB
                parse: true,    // Parse the request body
                output: 'stream',   // Output the response as a stream
                allow: 'multipart/form-data',   // Allow multipart/form-data
            },
            handler: handler.predictHandler
        }
    }
];

module.exports = routes;
