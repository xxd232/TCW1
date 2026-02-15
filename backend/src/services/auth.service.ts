import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import { User, IUser } from '../models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRE = '7d';

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    isAdmin?: boolean;
    twoFactorEnabled: boolean;
  };
  token?: string;
  qrCode?: string;
}

class AuthService {
  async signup(email: string, password: string, firstName?: string, lastName?: string): Promise<AuthResponse> {
    try {
      // Check if user exists
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return { success: false, message: 'Email already registered' };
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const user = new User({
        email: email.toLowerCase(),
        password: hashedPassword,
        firstName,
        lastName,
        backupCodes: []
      });

      await user.save();

      // Generate token
      const token = this.generateToken(user._id.toString());

      // Send welcome email
      const { EmailService } = await import('./email.service');
      await EmailService.sendWelcomeEmail(user.email, firstName || 'User');

      return {
        success: true,
        message: 'Signup successful',
        user: {
          id: user._id.toString(),
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          isAdmin: user.isAdmin,
          twoFactorEnabled: user.twoFactorEnabled
        },
        token
      };
    } catch (error: any) {
      return { success: false, message: error.message || 'Signup failed' };
    }
  }

  async login(email: string, password: string, totpToken?: string): Promise<AuthResponse> {
    try {
      const user = await User.findOne({ email: email.toLowerCase() });

      if (!user) {
        return { success: false, message: 'Invalid credentials' };
      }

      // Check if user signed up with Google OAuth only
      if (user.authProvider === 'google' && !user.password) {
        return { success: false, message: 'Please sign in with Google' };
      }

      // Verify password
      if (!user.password || !(await bcrypt.compare(password, user.password))) {
        return { success: false, message: 'Invalid credentials' };
      }

      // Check 2FA if enabled
      if (user.twoFactorEnabled) {
        if (!totpToken) {
          return { success: false, message: '2FA_REQUIRED' };
        }

        const isValidToken = speakeasy.totp.verify({
          secret: user.twoFactorSecret!,
          encoding: 'base32',
          token: totpToken,
          window: 2
        });

        if (!isValidToken) {
          return { success: false, message: 'Invalid 2FA token' };
        }
      }

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      // Generate token
      const token = this.generateToken(user._id.toString());

      return {
        success: true,
        message: 'Login successful',
        user: {
          id: user._id.toString(),
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          isAdmin: user.isAdmin,
          twoFactorEnabled: user.twoFactorEnabled
        },
        token
      };
    } catch (error: any) {
      return { success: false, message: error.message || 'Login failed' };
    }
  }

  async setupTwoFactor(userId: string): Promise<AuthResponse> {
    try {
      const user = await User.findById(userId);
      if (!user) {
        return { success: false, message: 'User not found' };
      }

      // Generate secret
      const secret = speakeasy.generateSecret({
        name: `TCW1 (${user.email})`,
        issuer: 'TCW1'
      });

      // Generate QR code
      const qrCode = await QRCode.toDataURL(secret.otpauth_url!);

      // Generate backup codes
      const backupCodes = this.generateBackupCodes(10);

      // Save temporarily (not confirmed until verified)
      user.twoFactorSecret = secret.base32;
      user.backupCodes = backupCodes.map(code => bcrypt.hashSync(code, 10));
      await user.save();

      return {
        success: true,
        message: '2FA setup initiated',
        qrCode,
        user: {
          id: user._id.toString(),
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          isAdmin: user.isAdmin,
          twoFactorEnabled: user.twoFactorEnabled
        }
      };
    } catch (error: any) {
      return { success: false, message: error.message || '2FA setup failed' };
    }
  }

  async verifyAndEnableTwoFactor(userId: string, totpToken: string): Promise<AuthResponse> {
    try {
      const user = await User.findById(userId);
      if (!user || !user.twoFactorSecret) {
        return { success: false, message: 'Setup not initiated' };
      }

      const isValidToken = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: 'base32',
        token: totpToken,
        window: 2
      });

      if (!isValidToken) {
        return { success: false, message: 'Invalid 2FA token' };
      }

      user.twoFactorEnabled = true;
      await user.save();

      // Send email notification
      const { EmailService } = await import('./email.service');
      await EmailService.send2FAEnabledEmail(user.email);

      return {
        success: true,
        message: '2FA enabled successfully',
        user: {
          id: user._id.toString(),
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          isAdmin: user.isAdmin,
          twoFactorEnabled: user.twoFactorEnabled
        }
      };
    } catch (error: any) {
      return { success: false, message: error.message || '2FA verification failed' };
    }
  }

  async disableTwoFactor(userId: string, password: string): Promise<AuthResponse> {
    try {
      const user = await User.findById(userId);
      if (!user || !user.password || !(await bcrypt.compare(password, user.password))) {
        return { success: false, message: 'Invalid password' };
      }

      user.twoFactorEnabled = false;
      user.twoFactorSecret = undefined;
      user.backupCodes = [];
      await user.save();

      // Send email notification
      const { EmailService } = await import('./email.service');
      await EmailService.send2FADisabledEmail(user.email);

      return {
        success: true,
        message: '2FA disabled successfully',
        user: {
          id: user._id.toString(),
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          isAdmin: user.isAdmin,
          twoFactorEnabled: user.twoFactorEnabled
        }
      };
    } catch (error: any) {
      return { success: false, message: error.message || '2FA disable failed' };
    }
  }

  async changePassword(userId: string, oldPassword: string, newPassword: string): Promise<AuthResponse> {
    try {
      const user = await User.findById(userId);
      if (!user || !user.password || !(await bcrypt.compare(oldPassword, user.password))) {
        return { success: false, message: 'Invalid current password' };
      }

      if (newPassword.length < 8) {
        return { success: false, message: 'Password must be at least 8 characters' };
      }

      user.password = await bcrypt.hash(newPassword, 10);
      await user.save();

      // Send email notification
      const { EmailService } = await import('./email.service');
      await EmailService.sendPasswordChangedEmail(user.email);

      return {
        success: true,
        message: 'Password changed successfully'
      };
    } catch (error: any) {
      return { success: false, message: error.message || 'Password change failed' };
    }
  }

  async adminLogin(email: string, password: string, totpToken?: string): Promise<AuthResponse> {
    try {
      const user = await User.findOne({ email: email.toLowerCase() });

      if (!user || !user.password || !(await bcrypt.compare(password, user.password))) {
        return { success: false, message: 'Invalid credentials' };
      }

      if (!user.isAdmin) {
        return { success: false, message: 'Admin access required' };
      }

      // Check 2FA if enabled
      if (user.twoFactorEnabled) {
        if (!totpToken) {
          return { success: false, message: '2FA_REQUIRED' };
        }

        const isValidToken = speakeasy.totp.verify({
          secret: user.twoFactorSecret!,
          encoding: 'base32',
          token: totpToken,
          window: 2
        });

        if (!isValidToken) {
          return { success: false, message: 'Invalid 2FA token' };
        }
      }

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      const token = this.generateToken(user._id.toString());

      return {
        success: true,
        message: 'Admin login successful',
        user: {
          id: user._id.toString(),
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          isAdmin: user.isAdmin,
          twoFactorEnabled: user.twoFactorEnabled
        },
        token
      };
    } catch (error: any) {
      return { success: false, message: error.message || 'Admin login failed' };
    }
  }

  async googleAuth(user: IUser): Promise<AuthResponse> {
    try {
      // Update last login
      user.lastLogin = new Date();
      await user.save();

      // Generate token
      const token = this.generateToken(user._id.toString());

      return {
        success: true,
        message: 'Google authentication successful',
        user: {
          id: user._id.toString(),
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          isAdmin: user.isAdmin,
          twoFactorEnabled: user.twoFactorEnabled
        },
        token
      };
    } catch (error: any) {
      return { success: false, message: error.message || 'Google authentication failed' };
    }
  }

  private generateToken(userId: string): string {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRE });
  }

  verifyToken(token: string): { userId: string } | null {
    try {
      return jwt.verify(token, JWT_SECRET) as { userId: string };
    } catch (error) {
      return null;
    }
  }

  private generateBackupCodes(count: number): string[] {
    const codes: string[] = [];
    for (let i = 0; i < count; i++) {
      codes.push(Math.random().toString(36).substring(2, 10).toUpperCase());
    }
    return codes;
  }
}

export const authService = new AuthService();
