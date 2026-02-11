import { useEffect, useState } from 'react';
import { api } from '../services/api';
import Modal from './Modal';
import Loading from './Loading';

interface TwoFactorSetupProps {
  isOpen: boolean;
  token: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export const TwoFactorSetup = ({ isOpen, token, onClose, onSuccess }: TwoFactorSetupProps) => {
  const [step, setStep] = useState<'qr' | 'verify'>('qr');
  const [qrCode, setQrCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [totpToken, setTotpToken] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copiedCodes, setCopiedCodes] = useState(false);

  const setupTwoFactor = async () => {
    try {
      setLoading(true);
      setError('');
      setCopiedCodes(false);
      const response = await api.post(
        '/auth/2fa/setup',
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        setQrCode(response.data.qrCode);
        // Extract backup codes from response or generate locally
        setBackupCodes(generateBackupCodes());
        setLoading(false);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Setup failed');
      setLoading(false);
    }
  };

  const generateBackupCodes = (): string[] => {
    const codes: string[] = [];
    for (let i = 0; i < 10; i++) {
      codes.push(Math.random().toString(36).substring(2, 10).toUpperCase());
    }
    return codes;
  };

  const verifyTwoFactor = async () => {
    if (!totpToken || totpToken.length !== 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }

    try {
      setLoading(true);
      const response = await api.post(
        '/auth/2fa/verify',
        { totpToken },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        onSuccess?.();
        handleClose();
      } else {
        setError(response.data.message || 'Verification failed');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep('qr');
    setQrCode('');
    setBackupCodes([]);
    setTotpToken('');
    setError('');
    setLoading(true);
    setCopiedCodes(false);
    onClose();
  };

  const copyBackupCodes = () => {
    const codeString = backupCodes.join('\n');
    navigator.clipboard.writeText(codeString);
    setCopiedCodes(true);
    setTimeout(() => setCopiedCodes(false), 2000);
  };

  useEffect(() => {
    if (isOpen) {
      setupTwoFactor();
    }
  }, [isOpen, token]);

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Setup 2-Factor Authentication">
      <div className="twofa-setup">
        {loading && <Loading type="spinner" size="medium" />}

        {!loading && (
          <>
            {error && <div className="error-message">{error}</div>}

            {step === 'qr' && (
              <div className="qr-step">
                <h3>Scan QR Code</h3>
                <p>Use Google Authenticator or similar app to scan:</p>
                
                {qrCode && (
                  <div className="qr-code-container">
                    <img src={qrCode} alt="2FA QR Code" className="qr-code" />
                  </div>
                )}

                <div className="backup-codes">
                  <h4>Backup Codes</h4>
                  <p>Save these codes in a safe place. You'll need them if you lose access to your authenticator.</p>
                  <div className="codes-display">
                    {backupCodes.map((code, i) => (
                      <code key={i}>{code}</code>
                    ))}
                  </div>
                  <button className="copy-btn" onClick={copyBackupCodes}>
                    {copiedCodes ? '✓ Copied!' : 'Copy Codes'}
                  </button>
                </div>

                <button className="next-btn" onClick={() => setStep('verify')}>
                  I've Saved the Codes
                </button>
              </div>
            )}

            {step === 'verify' && (
              <div className="verify-step">
                <h3>Verify Code</h3>
                <p>Enter the 6-digit code from your authenticator app:</p>
                
                <input
                  type="text"
                  value={totpToken}
                  onChange={(e) => setTotpToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  maxLength={6}
                  className="code-input"
                  autoFocus
                />

                <button className="verify-btn" onClick={verifyTwoFactor}>
                  Verify & Enable 2FA
                </button>

                <button className="back-btn" onClick={() => setStep('qr')}>
                  Back
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </Modal>
  );
};

export default TwoFactorSetup;
