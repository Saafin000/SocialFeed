import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load user from localStorage on app start
    const stored = localStorage.getItem('socialfeed_user');
    if (stored) {
      setUser(JSON.parse(stored));
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    // Ensure following list is always an array
    const normalized = { ...userData, following: userData.following || [] };
    setUser(normalized);
    localStorage.setItem('socialfeed_user', JSON.stringify(normalized));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('socialfeed_user');
  };

  // Update following list after follow/unfollow
  const updateFollowing = (followingList) => {
    setUser((prev) => {
      const updated = { ...prev, following: followingList };
      localStorage.setItem('socialfeed_user', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, updateFollowing }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
