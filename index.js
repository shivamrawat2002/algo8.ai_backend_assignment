require('dotenv').config();
const app = require('./app');
const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect(process.env.DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// Log all available routes
function logRoutes() {
    const routes = [];
    app._router.stack.forEach((middleware) => {
        if (middleware.route) {
            routes.push({
                path: middleware.route.path,
                methods: Object.keys(middleware.route.methods),
                description: getRouteDescription(middleware.route.path)
            });
        } else if (middleware.name === 'router') {
            middleware.handle.stack.forEach((handler) => {
                if (handler.route) {
                    routes.push({
                        path: `/api/v1${handler.route.path}`,
                        methods: Object.keys(handler.route.methods),
                        description: getRouteDescription(handler.route.path)
                    });
                }
            });
        }
    });

    console.log('\n=== Available API Routes ===');
    routes.forEach(route => {
        console.log(`\n${route.methods.join(', ').toUpperCase()} ${route.path}`);
        if (route.description) {
            console.log(`Description: ${route.description}`);
        }
    });
    console.log('\n=========================');
}

function getRouteDescription(path) {
    const routeDescriptions = {
        '/signup': 'Create a new user account',
        '/login': 'Authenticate user and get token',
        '/logout': 'Logout user and clear cookie',
        '/users': 'Get all users (Protected)',
        '/user/:id': 'Get, Update or Delete user by ID (Protected)',
        '/home': 'Home page endpoint'
    };
    return routeDescriptions[path] || '';
}

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    logRoutes();
});
