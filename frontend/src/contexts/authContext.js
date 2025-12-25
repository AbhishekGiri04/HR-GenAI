import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../firebase/firebaseConfig';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('User data:', user); // Debug log
      if (user) {
        console.log('Photo URL:', user.photoURL); // Debug log
      }
      setUser(user);
      if (user) {
        // Get role from localStorage or user claims
        const role = localStorage.getItem('userRole') || 'candidate';
        setUserRole(role);
      } else {
        setUserRole(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const logout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem('userRole');
      setUserRole(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const setRole = (role) => {
    setUserRole(role);
    localStorage.setItem('userRole', role);
  };

  const updateUserProfile = (profileData) => {
    // Update user state with new profile data
    setUser(prevUser => ({
      ...prevUser,
      displayName: profileData.displayName || prevUser?.displayName,
      email: profileData.email || prevUser?.email,
      photoURL: profileData.photoURL || prevUser?.photoURL
    }));
  };

  const value = {
    user,
    userRole,
    loading,
    logout,
    setRole,
    updateUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;