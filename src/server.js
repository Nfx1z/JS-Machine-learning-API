const Hapi = require('@hapi/hapi');
const Inert = require('@hapi/inert');
const routes = require('./routes');

// Initialize the server and register routes
const init = async () => {
    // Create a new Hapi server instance
    const server = Hapi.server({
        port: 3000,
        host: 'localhost'
    });
    // Register the Inert plugin
    await server.register(Inert);
    // Register the routes
    server.route(routes);
    // Start the server
    await server.start();
    console.log(`Server berjalan pada ${server.info.uri}`);
};

init();
