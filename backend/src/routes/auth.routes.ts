import express, { Router, Request, Response } from 'express';
import passport from '../config/passport.config';
import { authService } from '../services/auth.service';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';
import { IUser } from '../models/User';

const router: Router = express.Router();

// Signup
router.post('/signup', async (req: Request, res: Response) => {
  const { email, password, firstName, lastName } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password required' });
  }

  const result = await authService.signup(email, password, firstName, lastName);
  res.status(result.success ? 201 : 400).json(result);
});

// Login
router.post('/login', async (req: Request, res: Response) => {
  const { email, password, totpToken } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password required' });
  }

  const result = await authService.login(email, password, totpToken);
  res.status(result.success ? 200 : 401).json(result);
});

// Admin Login
router.post('/admin/login', async (req: Request, res: Response) => {
  const { email, password, totpToken } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password required' });
  }

  const result = await authService.adminLogin(email, password, totpToken);
  res.status(result.success ? 200 : 401).json(result);
});

// Setup 2FA
router.post('/2fa/setup', authMiddleware, async (req: AuthRequest, res: Response) => {
  if (!req.userId) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  const result = await authService.setupTwoFactor(req.userId);
  res.json(result);
});

// Verify and Enable 2FA
router.post('/2fa/verify', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { totpToken } = req.body;

  if (!req.userId || !totpToken) {
    return res.status(400).json({ success: false, message: 'User ID and TOTP token required' });
  }

  const result = await authService.verifyAndEnableTwoFactor(req.userId, totpToken);
  res.json(result);
});

// Disable 2FA
router.post('/2fa/disable', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { password } = req.body;

  if (!req.userId || !password) {
    return res.status(400).json({ success: false, message: 'Password required' });
  }

  const result = await authService.disableTwoFactor(req.userId, password);
  res.json(result);
});

// Change Password
router.post('/change-password', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { oldPassword, newPassword } = req.body;

  if (!req.userId || !oldPassword || !newPassword) {
    return res.status(400).json({ success: false, message: 'Old and new passwords required' });
  }

  const result = await authService.changePassword(req.userId, oldPassword, newPassword);
  res.json(result);
});

// Verify Token (check if user is authenticated)
router.get('/verify', authMiddleware, async (req: AuthRequest, res: Response) => {
  res.json({ success: true, message: 'Token is valid', userId: req.userId });
});

// Google OAuth Routes
router.get('/google', 
  (req: Request, res: Response, next) => {
    // Check if Google OAuth is configured
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      return res.status(503).json({ 
        success: false, 
        message: 'Google OAuth is not configured on this server' 
      });
    }
    next();
  },
  passport.authenticate('google', { 
    session: false,
    scope: ['profile', 'email'] 
  })
);

router.get('/google/callback',
  (req: Request, res: Response, next) => {
    // Check if Google OAuth is configured
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      return res.redirect(`${frontendUrl}/login?error=oauth_not_configured`);
    }
    next();
  },
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  async (req: Request, res: Response) => {
    try {
      const user = req.user as IUser;
      const result = await authService.googleAuth(user);

      if (result.success && result.token) {
        // Redirect to frontend with token
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        res.redirect(`${frontendUrl}/auth/google/callback?token=${result.token}&user=${encodeURIComponent(JSON.stringify(result.user))}`);
      } else {
        res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=auth_failed`);
      }
    } catch (error) {
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=auth_failed`);
    }
  }
);

export default router;
