import { Router } from 'express';
import passport from 'passport';
import { oauthCallback, validateToken } from '../controllers/oauthController';

const router = Router();

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/login', session: false }),
  oauthCallback
);

router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));
router.get(
  '/github/callback',
  passport.authenticate('github', { failureRedirect: '/login', session: false }),
  oauthCallback
);

router.post('/validate-token', validateToken);

export default router;
