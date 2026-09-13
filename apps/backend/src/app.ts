import express, { Express, Request, Response } from 'express';
import cors from "cors";
import restaurantRoutes from './domains/restaurant/routes/restaurant.routes.js';
import reviewerRoutes from './domains/reviewer/routes/reviewer.routes.js';
import reviewRoutes from './domains/review/routes/review.routes.js';
import visitRoutes from './domains/visit/routes/visit.routes.js';
import { setupSwagger } from './lib/swagger.js';
import { auth } from "./lib/auth/auth.js";
import { toNodeHandler } from "better-auth/node";
import { isAuthenticated } from "./lib/auth/middleware/auth.middleware.js";
import { isAdmin } from "./lib/auth/middleware/admin.middleware.js";

const app: Express = express();
const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3001";

app.use(cors({
  origin: frontendUrl,
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json());

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

app.all("/api/auth/sign-up/*path", isAdmin, toNodeHandler(auth));
app.all("/api/auth/*path", toNodeHandler(auth));

app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Welcome to Ranking Gourmet API' });
});

app.use('/api/restaurants', isAuthenticated, restaurantRoutes);
app.use('/api/reviewers', isAuthenticated, reviewerRoutes);
app.use('/api/reviews', isAuthenticated, reviewRoutes);
app.use('/api/visits', isAuthenticated, visitRoutes);

setupSwagger(app);

export default app;
