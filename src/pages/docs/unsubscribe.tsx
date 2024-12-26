import { useState } from 'react';
import { NextPage } from 'next';

const styles = {
  pageContainer: {
    height: 'calc(100vh - 300px)',
    display: 'flex',
    alignItems: 'center',
  },
  container: {
    width: '100%',
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 20px',
  },
  contentWrapper: {
    width: '100%',
  },
  title: {
    fontSize: '32px',
    fontWeight: 600,
    color: '#1A1A1A',
    marginBottom: '8px',
  },
  subtitle: {
    fontSize: '16px',
    color: '#666666',
    marginBottom: '40px',
  },
  formSection: {
    marginTop: '24px',
  },
  inputGroup: {
    display: 'flex',
    gap: '12px',
    maxWidth: '600px',
  },
  input: {
    flex: 1,
    height: '40px',
    padding: '0 16px',
    border: '1px solid #E5E5E5',
    borderRadius: '4px',
    fontSize: '14px',
    color: '#1A1A1A',
  },
  button: {
    height: '40px',
    padding: '0 24px',
    backgroundColor: '#1B3947',
    border: 'none',
    borderRadius: '4px',
    color: 'white',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  message: {
    marginTop: '12px',
    fontSize: '14px',
  },
  successMessage: {
    color: '#22C55E',
  },
  errorMessage: {
    color: '#EF4444',
  },
} as const;

const UnsubscribePage: NextPage = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    try {
      const response = await fetch('/api/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) throw new Error('Unsubscribe failed');
      setStatus('success');
      setEmail('');
    } catch (error) {
      setStatus('error');
      console.error(error);
    }
  };

  return (
    <div style={styles.pageContainer}>
      <div style={styles.container}>
        <div style={styles.contentWrapper}>
          <h1 style={styles.title}>Unsubscribe from Newsletter</h1>
          <p style={styles.subtitle}>
            We&apos;re sorry to see you go. Enter your email to unsubscribe.
          </p>

          <div style={styles.formSection}>
            <form onSubmit={handleSubmit}>
              <div style={styles.inputGroup}>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  style={styles.input}
                />
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  style={{
                    ...styles.button,
                    opacity: status === 'loading' ? 0.5 : 1,
                    cursor: status === 'loading' ? 'not-allowed' : 'pointer',
                  }}
                >
                  {status === 'loading' ? 'Processing...' : 'Unsubscribe'}
                </button>
              </div>

              {status === 'success' && (
                <p style={{ ...styles.message, ...styles.successMessage }}>
                  You have been successfully unsubscribed.
                </p>
              )}

              {status === 'error' && (
                <p style={{ ...styles.message, ...styles.errorMessage }}>
                  An error occurred. Please try again.
                </p>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnsubscribePage;
