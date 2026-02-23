import express, { Request, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';
import { FriendRequestService } from '../services/friend-request.service';

const router = express.Router();

// Send friend request
router.post('/send', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { to } = req.body;
  const from = req.userId;
  if (typeof to !== 'string' || typeof from !== 'string') return res.status(400).json({ success: false, error: 'Missing user' });
  const result = await FriendRequestService.sendRequest(from, to);
  res.json(result);
});

// Get incoming/outgoing requests
router.get('/requests', authMiddleware, async (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  if (typeof userId !== 'string') return res.status(400).json({ success: false, error: 'Missing userId' });
  const result = await FriendRequestService.getRequests(userId);
  res.json(result);
});

// Accept/decline friend request
router.post('/respond', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { requestId, accept } = req.body;
  const userId = req.userId;
  if (typeof requestId !== 'string' || typeof userId !== 'string' || typeof accept !== 'boolean') return res.status(400).json({ success: false, error: 'Missing params' });
  const result = await FriendRequestService.respondRequest(requestId, userId, accept);
  res.json(result);
});

// List friends
router.get('/list', authMiddleware, async (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  if (typeof userId !== 'string') return res.status(400).json({ success: false, error: 'Missing userId' });
  const result = await FriendRequestService.listFriends(userId);
  res.json(result);
});

export default router;
