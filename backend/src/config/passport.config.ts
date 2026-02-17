import passport from 'passport';
import { Strategy as GoogleStrategy, Profile } from 'passport-google-oauth20';
import { User, IUser } from '../models/User';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000';

// Export flag to indicate if Google OAuth is configured
export const isGoogleOAuthConfigured = !!(GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET);

// Only configure Google OAuth if credentials are provided
if (isGoogleOAuthConfigured) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: `${BACKEND_URL}/auth/google/callback`,
        scope: ['profile', 'email']
      },
      async (accessToken: string, refreshToken: string, profile: Profile, done: any) => {
        try {
          // Check if user already exists with this Google ID
          let user = await User.findOne({ googleId: profile.id });

          if (user) {
            // Update last login
            user.lastLogin = new Date();
            await user.save();
            return done(null, user);
          }

          // Check if user exists with this email (from local auth)
          const email = profile.emails?.[0]?.value;
          if (email) {
            user = await User.findOne({ email: email.toLowerCase() });
            
            if (user) {
              // Link Google account to existing user
              user.googleId = profile.id;
              user.authProvider = 'google';
              user.profilePicture = profile.photos?.[0]?.value;
              user.lastLogin = new Date();
              await user.save();
              return done(null, user);
            }
          }

          // Create new user
          const newUser = new User({
            googleId: profile.id,
            email: email?.toLowerCase(),
            firstName: profile.name?.givenName,
            lastName: profile.name?.familyName,
            profilePicture: profile.photos?.[0]?.value,
            authProvider: 'google',
            twoFactorEnabled: false,
            backupCodes: [],
            lastLogin: new Date()
          });

          await newUser.save();

          // Send welcome email
          if (email) {
            const { EmailService } = await import('../services/email.service');
            await EmailService.sendWelcomeEmail(email, profile.name?.givenName || 'User');
          }

          done(null, newUser);
        } catch (error) {
          done(error, null);
        }
      }
    )
  );
  console.log('✅ Google OAuth configured');
} else {
  console.log('⚠️  Google OAuth not configured - GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET required');
}

passport.serializeUser((user: any, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;
