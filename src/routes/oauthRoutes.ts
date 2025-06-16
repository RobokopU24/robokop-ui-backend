import { Router } from 'express';
import passport from 'passport';
import {
  oauthCallback,
  validateToken,
  logout,
  sendMagicLink,
  activateUserTokenHandler,
  activateNewUserHandler,
} from '../controllers/oauthController';

const router = Router();

/**
 * @swagger
 * components:
 *  schemas:
 *   User:
 *    type: object
 *    required:
 *     - id
 *     - email
 *    properties:
 *     id:
 *      type: string
 *      description: Unique identifier for the user
 *     email:
 *      type: string
 *      description: Email address of the user
 *    example:
 *     id: "71272a4c-b5a6-4a12-b7ad-e798d9e1b8ce"
 *     email: "amrutesharun0599@gmail.com"
 *   TokenRequest:
 *    type: object
 *    required:
 *     - token
 *    properties:
 *     token:
 *      type: string
 *      description: JWT token to validate
 *    example:
 *     token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 */

/**
 * @swagger
 * /api/auth/google:
 *   get:
 *     summary: Initiate Google OAuth login
 *     description: Redirects to Google's OAuth consent screen
 *     tags: [Authentication]
 *     responses:
 *       302:
 *         description: Redirects to Google's OAuth consent screen
 */
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

/**
 * @swagger
 * /api/auth/google/callback:
 *   get:
 *     summary: Google OAuth callback
 *     description: Handles the callback from Google OAuth
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Successfully authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Authentication failed
 */
router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/login', session: false }),
  oauthCallback
);

/**
 * @swagger
 * /api/auth/github:
 *   get:
 *     summary: Initiate GitHub OAuth login
 *     description: Redirects to GitHub's OAuth consent screen
 *     tags: [Authentication]
 *     responses:
 *       302:
 *         description: Redirects to GitHub's OAuth consent screen
 */
router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));

/**
 * @swagger
 * /api/auth/github/callback:
 *   get:
 *     summary: GitHub OAuth callback
 *     description: Handles the callback from GitHub OAuth
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Successfully authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Authentication failed
 */
router.get(
  '/github/callback',
  passport.authenticate('github', { failureRedirect: '/login', session: false }),
  oauthCallback
);

/**
 * @swagger
 * /api/auth/validate-token:
 *   post:
 *     summary: Validate authentication token
 *     description: Validates the provided authentication token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TokenRequest'
 *     responses:
 *       200:
 *         description: Token is valid
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Invalid token
 */
router.post('/validate-token', validateToken);

router.post('/verification-link', sendMagicLink);
router.get('/activate-user-token', activateUserTokenHandler);
router.post('/activate-new-user', activateNewUserHandler);
router.get('/logout', logout);

export default router;
