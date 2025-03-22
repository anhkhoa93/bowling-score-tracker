"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
const cors_1 = __importDefault(require("@fastify/cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const players_1 = __importDefault(require("./routes/players"));
const games_1 = __importDefault(require("./routes/games"));
// Load environment variables
dotenv_1.default.config();
// Create Fastify instance
const fastify = (0, fastify_1.default)({
    logger: true
});
// Register CORS plugin
fastify.register(cors_1.default, {
    origin: true // Allow all origins in development
});
// Register route handlers
fastify.register(players_1.default, { prefix: '/api/players' });
fastify.register(games_1.default, { prefix: '/api/games' });
// Root route
fastify.get('/', async () => {
    return { message: 'Bowling Score Tracker API' };
});
// Health check route
fastify.get('/health', async () => {
    return { status: 'ok' };
});
// Start the server
const start = async () => {
    try {
        const port = parseInt(process.env.PORT || '3001');
        const host = process.env.HOST || '0.0.0.0';
        await fastify.listen({ port, host });
        console.log(`Server is running on ${host}:${port}`);
    }
    catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};
start();
