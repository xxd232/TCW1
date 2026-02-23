import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import '../styles/SignUp.css';

interface SignUpProps {
  onSignUp?: (userId: string, email: string) => void;
  onShowLogin?: () => void;
}

const SignUp = ({ onSignUp, onShowLogin }: SignUpProps) => {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!email.trim()) {
      setError('Email is required');
      return;
    }
    if (!password) {
      setError('Password is required');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/api/auth/signup', {
        email,
        password,
        firstName,
        lastName
      });

      if (response.data.success) {
        // Save token and user
        localStorage.setItem('tcw1_token', response.data.token);
        localStorage.setItem('tcw1_user', JSON.stringify(response.data.user));
        localStorage.setItem('isAdmin', response.data.user.isAdmin ? 'true' : 'false');
        const userId =
          response.data.user?._id ||
          response.data.user?.id ||
          response.data.user?.email ||
          email;
        onSignUp?.(userId, email);
        navigate('/');
      } else {
        setError(response.data.message || 'Signup failed');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '40px auto', padding: 16, background: '#fff', color: '#222', borderRadius: 8, boxShadow: '0 2px 8px #eee' }}>
      <h2 style={{ textAlign: 'center', marginBottom: 16 }}>Sign Up</h2>
      <form onSubmit={handleSubmit}>
        {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
        <div style={{ marginBottom: 8 }}>
          <label>First Name</label>
          <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} disabled={loading} style={{ width: '100%', padding: 6 }} />
        </div>
        <div style={{ marginBottom: 8 }}>
          <label>Last Name</label>
          <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} disabled={loading} style={{ width: '100%', padding: 6 }} />
        </div>
        <div style={{ marginBottom: 8 }}>
          <label>Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} disabled={loading} style={{ width: '100%', padding: 6 }} />
        </div>
        <div style={{ marginBottom: 8 }}>
          <label>Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} disabled={loading} style={{ width: '100%', padding: 6 }} />
        </div>
        <div style={{ marginBottom: 8 }}>
          <label>Confirm Password</label>
          <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} disabled={loading} style={{ width: '100%', padding: 6 }} />
        </div>
        <button type="submit" style={{ width: '100%', padding: 10, background: '#222', color: '#fff', border: 'none', borderRadius: 4 }} disabled={loading}>
          {loading ? 'Creating Account...' : 'Create Account'}
        </button>
      </form>
      <div style={{ marginTop: 16, textAlign: 'center' }}>
        <span>Already have an account?</span>
        <button type="button" style={{ background: 'none', border: 'none', color: '#007bff', cursor: 'pointer', marginLeft: 4 }} onClick={onShowLogin}>Login</button>
      </div>
    </div>
  );
};

export default SignUp;
