import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAndValidateToken();
  }, []);

  const checkAndValidateToken = async () => {
    try {
      const savedToken = localStorage.getItem("admin_token");
      
      if (!savedToken) {
        setLoading(false);
        return;
      }

      // Verify token with backend
      const isValid = await verifyToken(savedToken);
      
      if (isValid) {
        setToken(savedToken);
      } else {
        // Token invalid or expired - clear it
        localStorage.removeItem("admin_token");
        setToken(null);
      }
    } catch (e) {
      console.error("AuthContext init error:", e);
      localStorage.removeItem("admin_token");
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  const verifyToken = async (tokenToVerify) => {
    try {
      const response = await fetch("http://localhost:5000/auth/verify", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${tokenToVerify}`,
          "Content-Type": "application/json"
        }
      });

      return response.ok;
    } catch (error) {
      console.error("Token verification failed:", error);
      return false;
    }
  };

  const login = (jwtToken) => {
    localStorage.setItem("admin_token", jwtToken);
    setToken(jwtToken);
  };

  const logout = () => {
    localStorage.removeItem("admin_token");
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}