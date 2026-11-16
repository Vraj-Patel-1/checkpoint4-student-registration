
import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Login failed.");
        return;
      }

      if (!data.token) {
        setError("No authentication token received.");
        return;
      }

      sessionStorage.setItem("studentToken", data.token);
      navigate("/dashboard");
    } catch {
      setError("Cannot connect to the backend server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-card">
        <header className="form-header">
          <h1>Student Login</h1>
          <p>Enter your account details to sign in.</p>
        </header>

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="login-email">Email Address</label>
            <input id="login-email" type="email"
              value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              autoComplete="email" required />
          </div>

          <div className="form-group">
            <label htmlFor="login-password">Password</label>
            <input id="login-password" type="password"
              value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              autoComplete="current-password" required />
          </div>

          {error && <p className="message error" role="alert">{error}</p>}

          <button className="submit-btn" type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="login-text">
          Don't have an account? <Link to="/">Register here</Link>
        </p>
      </section>
    </main>
  );
}

export default Login;
