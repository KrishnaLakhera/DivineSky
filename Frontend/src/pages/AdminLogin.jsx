import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/Admin/AdminLogin.css";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!email || !password) {
      alert("Email and password required");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("https://divinesky.onrender.com/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Login failed");
      }

      login(data.token);
      navigate("/admin");
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-card">
        <h2>Admin Login</h2>

        <input
          type="email"
          placeholder="Admin email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          name="email"
          disabled={loading}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          name="password"
          disabled={loading}
        />

        <button name="button" onClick={handleLogin} disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </div>
    </div>
  );
}