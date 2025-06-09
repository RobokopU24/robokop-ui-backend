import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github2';
import { PrismaClient } from '@prisma/client';
import { BACKEND_URL } from '../config';
import { Profile as GitHubProfile } from 'passport-github2';

const prisma = new PrismaClient();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: `${BACKEND_URL}/api/auth/google/callback`,
    },
    async (_accessToken, _refreshToken, profile, done) => {
      const email = profile.emails![0].value;
      const name = profile.displayName;
      const profilePicture = profile.photos?.[0]?.value || null;
      let user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        user = await prisma.user.create({
          data: { email, name, profilePicture },
        });
      } else {
        if (user.profilePicture === null && profilePicture) {
          user = await prisma.user.update({
            where: { email },
            data: { profilePicture },
          });
        }
      }
      done(null, user);
    }
  )
);

interface GitHubStrategyOptions {
  clientID: string;
  clientSecret: string;
  callbackURL: string;
  scope: string[];
}

interface GitHubProfileJson {
  email?: string;
  [key: string]: any;
}

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      callbackURL: `${BACKEND_URL}/api/auth/github/callback`,
      scope: ['user:email'],
    } as GitHubStrategyOptions,
    async (
      _accessToken: string,
      _refreshToken: string,
      profile: GitHubProfile,
      done: (error: any, user?: any) => void
    ) => {
      const email: string =
        profile.emails?.[0]?.value ||
        ((profile as any)._json as GitHubProfileJson).email ||
        `${profile.username}@users.noreply.github.com`;
      const name = profile.displayName || profile.username;
      const profilePicture = profile.photos?.[0]?.value || null;

      let user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        user = await prisma.user.create({
          data: { email, name, profilePicture },
        });
      } else {
        if (user.profilePicture === null && profilePicture) {
          user = await prisma.user.update({
            where: { email },
            data: { profilePicture },
          });
        }
      }
      done(null, user);
    }
  )
);
