import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, sendEmailVerification } from 'firebase/auth';
import { auth } from '../firebase/firebaseConfig';
import { useAuth } from '../contexts/authContext';
import Spline from '@splinetool/react-spline';

const SignUp = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('candidate');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const { user, setRole: setUserRole } = useAuth();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleEmailSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await sendEmailVerification(userCredential.user);
      setUserRole(role); // Set the selected role
      setSuccess('Account created! Please check your email to verify your account.');
      setTimeout(() => navigate('/dashboard'), 3000);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setLoading(true);
    setError('');

    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      setUserRole(role); // Set the selected role
      navigate('/dashboard');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '20px',
      fontFamily: "'Poppins', sans-serif",
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background Spline Animation */}
      <div style={{
        position: 'absolute',
        inset: '0',
        zIndex: '0',
        transform: 'scale(1.2)'
      }}>
        <Spline scene="https://prod.spline.design/XTr3eUSBa6wvpsWZ/scene.splinecode" />
      </div>
      <div style={{
        backgroundColor: '#fff',
        borderRadius: '20px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        position: 'relative',
        overflow: 'hidden',
        width: '850px',
        maxWidth: '100%',
        minHeight: '550px',
        display: 'flex',
        zIndex: '10'
      }}>
        {/* Left Panel */}
        <div style={{
          width: '50%',
          background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 100%)',
          color: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          padding: '0 50px',
          textAlign: 'center'
        }}>
          <h1 style={{
            fontWeight: '700',
            margin: '0',
            fontSize: '28px'
          }}>Welcome Back!</h1>
          <p style={{
            fontSize: '15px',
            fontWeight: '300',
            lineHeight: '24px',
            letterSpacing: '0.5px',
            margin: '20px 0 30px'
          }}>Stay connected by logging in with your credentials and continue your experience</p>
          <Link to="/signin">
            <button style={{
              background: 'transparent',
              border: '2px solid #FFFFFF',
              borderRadius: '25px',
              color: '#FFFFFF',
              fontSize: '13px',
              fontWeight: '600',
              padding: '14px 50px',
              letterSpacing: '1px',
              textTransform: 'uppercase',
              transition: 'all 0.3s ease',
              cursor: 'pointer'
            }}
            onMouseOver={(e) => {
              e.target.style.background = 'rgba(255, 255, 255, 0.1)';
            }}
            onMouseOut={(e) => {
              e.target.style.background = 'transparent';
            }}>
              Sign In
            </button>
          </Link>
        </div>

        {/* Sign Up Form */}
        <div style={{
          width: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          padding: '0 50px',
          textAlign: 'center'
        }}>
          <form onSubmit={handleEmailSignUp} style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            width: '100%'
          }}>
            <h1 style={{
              fontWeight: '700',
              margin: '0 0 10px 0',
              fontSize: '24px',
              color: '#333'
            }}>Create Account</h1>

            {/* Social Links */}
            <div style={{ margin: '15px 0' }}>
              <button
                type="button"
                onClick={handleGoogleSignUp}
                disabled={loading}
                style={{
                  border: '2px solid #e0e0e0',
                  borderRadius: '50%',
                  display: 'inline-flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  margin: '0 8px',
                  height: '45px',
                  width: '45px',
                  transition: 'all 0.3s ease',
                  color: '#4285f4',
                  background: 'transparent',
                  cursor: 'pointer'
                }}
                onMouseOver={(e) => {
                  e.target.style.borderColor = '#4285f4';
                  e.target.style.background = '#4285f4';
                  e.target.style.color = '#fff';
                  e.target.style.transform = 'translateY(-3px)';
                  e.target.style.boxShadow = '0 5px 15px rgba(66, 133, 244, 0.4)';
                }}
                onMouseOut={(e) => {
                  e.target.style.borderColor = '#e0e0e0';
                  e.target.style.background = 'transparent';
                  e.target.style.color = '#4285f4';
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                <i className="fab fa-google"></i>
              </button>
            </div>

            <span style={{
              fontSize: '12px',
              color: '#666',
              marginBottom: '15px'
            }}>or use your email for registration</span>

            {/* Role Selection */}
            <div style={{
              display: 'flex',
              gap: '8px',
              marginBottom: '15px',
              width: '100%'
            }}>
              <button
                type="button"
                onClick={() => setRole('candidate')}
                style={{
                  flex: 1,
                  padding: '12px',
                  border: `2px solid ${role === 'candidate' ? '#000' : '#e0e0e0'}`,
                  borderRadius: '12px',
                  background: role === 'candidate' ? '#000' : 'transparent',
                  color: role === 'candidate' ? '#fff' : '#666',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                Candidate
              </button>
              <button
                type="button"
                onClick={() => setRole('hr')}
                style={{
                  flex: 1,
                  padding: '12px',
                  border: `2px solid ${role === 'hr' ? '#000' : '#e0e0e0'}`,
                  borderRadius: '12px',
                  background: role === 'hr' ? '#000' : 'transparent',
                  color: role === 'hr' ? '#fff' : '#666',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                HR Professional
              </button>
            </div>

            {error && (
              <div style={{
                color: '#e74c3c',
                backgroundColor: '#fdf2f2',
                padding: '10px',
                borderRadius: '8px',
                marginBottom: '15px',
                width: '100%',
                fontSize: '14px'
              }}>
                {error}
              </div>
            )}

            {success && (
              <div style={{
                color: '#27ae60',
                backgroundColor: '#f2fdf2',
                padding: '10px',
                borderRadius: '8px',
                marginBottom: '15px',
                width: '100%',
                fontSize: '14px'
              }}>
                {success}
              </div>
            )}

            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={{
                backgroundColor: '#f3f4f6',
                border: '2px solid transparent',
                borderRadius: '12px',
                padding: '10px 15px',
                margin: '6px 0',
                width: '100%',
                fontSize: '14px',
                transition: 'all 0.3s ease'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#000000';
                e.target.style.backgroundColor = '#fff';
                e.target.style.boxShadow = '0 0 0 3px rgba(0, 0, 0, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'transparent';
                e.target.style.backgroundColor = '#f3f4f6';
                e.target.style.boxShadow = 'none';
              }}
            />

            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                backgroundColor: '#f3f4f6',
                border: '2px solid transparent',
                borderRadius: '12px',
                padding: '10px 15px',
                margin: '6px 0',
                width: '100%',
                fontSize: '14px',
                transition: 'all 0.3s ease'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#000000';
                e.target.style.backgroundColor = '#fff';
                e.target.style.boxShadow = '0 0 0 3px rgba(0, 0, 0, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'transparent';
                e.target.style.backgroundColor = '#f3f4f6';
                e.target.style.boxShadow = 'none';
              }}
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                backgroundColor: '#f3f4f6',
                border: '2px solid transparent',
                borderRadius: '12px',
                padding: '10px 15px',
                margin: '6px 0',
                width: '100%',
                fontSize: '14px',
                transition: 'all 0.3s ease'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#000000';
                e.target.style.backgroundColor = '#fff';
                e.target.style.boxShadow = '0 0 0 3px rgba(0, 0, 0, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'transparent';
                e.target.style.backgroundColor = '#f3f4f6';
                e.target.style.boxShadow = 'none';
              }}
            />

            <button
              type="submit"
              disabled={loading}
              style={{
                borderRadius: '25px',
                border: 'none',
                background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 100%)',
                color: '#FFFFFF',
                fontSize: '13px',
                fontWeight: '600',
                padding: '14px 50px',
                letterSpacing: '1px',
                textTransform: 'uppercase',
                transition: 'all 0.3s ease',
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.4)',
                opacity: loading ? 0.7 : 1,
                marginTop: '15px'
              }}
              onMouseOver={(e) => {
                if (!loading) {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.6)';
                }
              }}
              onMouseOut={(e) => {
                if (!loading) {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.4)';
                }
              }}
            >
              {loading ? 'Creating Account...' : 'Sign Up'}
            </button>

            {/* Mobile Switch */}
            <div style={{
              display: 'none',
              marginTop: '20px',
              color: '#000000',
              fontSize: '14px'
            }} className="mobile-switch">
              <p style={{ margin: '10px 0', fontSize: '14px' }}>Already have an account?</p>
              <Link to="/signin">
                <button style={{
                  background: 'transparent',
                  color: '#000000',
                  border: '2px solid #000000',
                  padding: '10px 30px',
                  marginTop: '10px',
                  boxShadow: 'none',
                  borderRadius: '25px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: '600',
                  letterSpacing: '1px',
                  textTransform: 'uppercase'
                }}>Sign In</button>
              </Link>
            </div>
          </form>
        </div>
      </div>

      {/* Font Awesome for icons */}
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      
      {/* Google Fonts */}
      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&display=swap" rel="stylesheet" />
      
      {/* Mobile Responsive Styles */}
      <style jsx>{`
        @media (max-width: 768px) {
          .mobile-switch {
            display: block !important;
          }
        }
      `}</style>
    </div>
  );
};

export default SignUp;