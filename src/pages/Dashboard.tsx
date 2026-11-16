
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface Student {
  id: string;
  name: string;
  email: string;
  contact: string;
  gender: string;
}

function Dashboard() {
  const navigate = useNavigate();
  const [student, setStudent] = useState<Student | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    const token = sessionStorage.getItem("studentToken");

    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    const loadStudent = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/profile", {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });

        if (response.status === 401 || response.status === 403) {
          sessionStorage.removeItem("studentToken");
          navigate("/login", { replace: true });
          return;
        }

        if (!response.ok) {
          throw new Error("Unable to load profile");
        }

        const data: Student = await response.json();
        setStudent(data);
      } catch {
        if (!controller.signal.aborted) {
          setError("Could not load student information.");
        }
      }
    };

    loadStudent();
    return () => controller.abort();
  }, [navigate]);

  const logout = () => {
    sessionStorage.removeItem("studentToken");
    navigate("/login", { replace: true });
  };

  return (
    <main className="auth-page">
      <section className="auth-card">
        <header className="form-header">
          <h1>Student Dashboard</h1>
          <p>Your registered student information.</p>
        </header>

        {error && <p className="message error">{error}</p>}
        {!student && !error && <p>Loading student details...</p>}

        {student && (
          <div className="student-details">
            <h2>Welcome, {student.name}</h2>
            <p><strong>Name:</strong> {student.name}</p>
            <p><strong>Email:</strong> {student.email}</p>
            <p><strong>Contact:</strong> {student.contact}</p>
            <p><strong>Gender:</strong> {student.gender}</p>
            <button className="submit-btn" onClick={logout}>Logout</button>
          </div>
        )}
      </section>
    </main>
  );
}

export default Dashboard;
