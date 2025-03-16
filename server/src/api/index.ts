import { Router } from 'express';
import authRoutes from './auth';

const router = Router();

// Health check route
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Mount auth routes
router.use('/auth', authRoutes);

// TODO: Add other route imports here
// import eventRoutes from './events';
// import betRoutes from './bets';
// import userRoutes from './users';
// import adminRoutes from './admin';

// TODO: Mount other routes
// router.use('/events', eventRoutes);
// router.use('/bets', betRoutes);
// router.use('/users', userRoutes);
// router.use('/admin', adminRoutes);

export default router; 