import { Router } from 'express';

const router = Router();

// Health check route
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// TODO: Add other route imports here
// import authRoutes from './auth';
// import eventRoutes from './events';
// import betRoutes from './bets';
// import userRoutes from './users';
// import adminRoutes from './admin';

// TODO: Mount other routes
// router.use('/auth', authRoutes);
// router.use('/events', eventRoutes);
// router.use('/bets', betRoutes);
// router.use('/users', userRoutes);
// router.use('/admin', adminRoutes);

export default router; 