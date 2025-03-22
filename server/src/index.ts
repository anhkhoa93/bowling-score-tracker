import Fastify from 'fastify';
import cors from '@fastify/cors';
import dotenv from 'dotenv';
import playerRoutes from './routes/players';
import gameRoutes from './routes/games';

// Load environment variables
dotenv.config();

// Create Fastify instance
const fastify = Fastify({
  logger: true
});

// Register CORS plugin
fastify.register(cors, {
  origin: true // Allow all origins in development
});

// Register route handlers
fastify.register(playerRoutes, { prefix: '/api/players' });
fastify.register(gameRoutes, { prefix: '/api/games' });

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
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
