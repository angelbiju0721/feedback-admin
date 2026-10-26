
import { useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  NavLink,
  useNavigate,
  useLocation,
} from "react-router-dom";
import axios from "axios";
import "./App.css";

const API = "http://localhost:5000/api/feedback";

function Dashboard() {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function loadFeedback() {
    try {
      const response = await axios.get(API);
      setFeedback(response.data);
      setError("");
    } catch {
      setError("Could not load feedback. Check the backend server.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadFeedback();
  }, []);

  async function deleteFeedback(id) {
    if (!window.confirm("Are you sure you want to delete this feedback?")) {
      return;
    }

    try {
      await axios.delete(`${API}/${id}`);
      setFeedback((previous) =>
        previous.filter((item) => item._id !== id)
      );
    } catch {
      alert("Could not delete feedback.");
    }
  }

  return (
    <main className="page">
      <section className="welcome">
        <div>
          <span className="eyebrow">ADMINISTRATION</span>
          <h1>Feedback Dashboard</h1>
          <p>Review course feedback and manage student responses.</p>
        </div>
        <button
          className="primary-button"
          onClick={() => navigate("/add-feedback")}
        >
          + Add Feedback
        </button>
      </section>

      <section className="stats">
        <div className="stat-card">
          <span>Total Feedback</span>
          <strong>{feedback.length}</strong>
        </div>
        <div className="stat-card">
          <span>Average Rating</span>
          <strong>
            {feedback.length
              ? (
                  feedback.reduce((sum, item) => sum + item.rating, 0) /
                  feedback.length
                ).toFixed(1)
              : "0.0"}{" "}
            <span className="star">★</span>
          </strong>
        </div>
        <div className="stat-card">
          <span>Courses Reviewed</span>
          <strong>
            {new Set(feedback.map((item) => item.courseName)).size}
          </strong>
        </div>
      </section>

      <section className="panel">
        <div className="panel-heading">
          <div>
            <h2>Course Feedback</h2>
            <p>Manage all submitted feedback below.</p>
          </div>
          <span className="count">{feedback.length} entries</span>
        </div>

        {loading ? (
          <p className="message">Loading feedback...</p>
        ) : error ? (
          <p className="error">{error}</p>
        ) : feedback.length === 0 ? (
          <div className="empty">
            <span className="empty-icon">✦</span>
            <h3>No feedback yet</h3>
            <p>Add your first course feedback to get started.</p>
            <button
              className="primary-button"
              onClick={() => navigate("/add-feedback")}
            >
              Add First Feedback
            </button>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Course ID</th>
                  <th>Course Name</th>
                  <th>Duration</th>
                  <th>Rating</th>
                  <th>Comments</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {feedback.map((item) => (
                  <tr key={item._id}>
                    <td className="id-cell">
                      {item._id.slice(-6).toUpperCase()}
                    </td>
                    <td><strong>{item.courseName}</strong></td>
                    <td>{item.courseDuration || "Not specified"}</td>
                    <td>
                      <span className="rating">
                        ★ {item.rating}/5
                      </span>
                    </td>
                    <td className="comments">{item.comments}</td>
                    <td>
                      <div className="actions">
                        <button
                          className="edit-button"
                          onClick={() =>
                            navigate("/add-feedback", {
                              state: { feedback: item },
                            })
                          }
                        >
                          Update
                        </button>
                        <button
                          className="delete-button"
                          onClick={() => deleteFeedback(item._id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}

function FeedbackForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const existing = location.state?.feedback;

  const [courseName, setCourseName] = useState(existing?.courseName || "");
  const [comments, setComments] = useState(existing?.comments || "");
  const [rating, setRating] = useState(String(existing?.rating || "5"));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");

    const data = {
      courseName: courseName.trim(),
      comments: comments.trim(),
      rating: Number(rating),
      courseDuration: existing?.courseDuration || "Not specified",
    };

    try {
      if (existing) {
        await axios.put(`${API}/${existing._id}`, data);
      } else {
        await axios.post(API, data);
      }

      navigate("/");
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Could not save feedback. Check your backend connection."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="form-page">
      <section className="form-card">
        <span className="eyebrow">COURSE REVIEW</span>
        <h1>{existing ? "Update Feedback" : "Add Feedback"}</h1>
        <p className="form-intro">
          {existing
            ? "Edit the details of the submitted feedback."
            : "Share your thoughts and help us improve our courses."}
        </p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="courseName">Course Name</label>
          <input
            id="courseName"
            value={courseName}
            onChange={(event) => setCourseName(event.target.value)}
            placeholder="e.g. Full Stack Development"
            required
            maxLength={120}
          />

          <label htmlFor="comments">Feedback Comments</label>
          <textarea
            id="comments"
            value={comments}
            onChange={(event) => setComments(event.target.value)}
            placeholder="Write your feedback here..."
            rows="5"
            required
            maxLength={2000}
          />

          <label>Feedback Rating</label>
          <div className="rating-options">
            {[1, 2, 3, 4, 5].map((number) => (
              <button
                type="button"
                key={number}
                className={
                  Number(rating) >= number
                    ? "rating-star selected"
                    : "rating-star"
                }
                onClick={() => setRating(String(number))}
                aria-label={`${number} out of 5 stars`}
              >
                ★
              </button>
            ))}
            <span>{rating} out of 5</span>
          </div>

          {error && <p className="error">{error}</p>}

          <div className="form-actions">
            <button
              type="button"
              className="cancel-button"
              onClick={() => navigate("/")}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="primary-button"
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : existing
                ? "Save Changes"
                : "Submit Feedback"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}

function AppLayout() {
  return (
    <>
      <nav className="navbar">
        <NavLink to="/" className="brand">
          <span className="brand-icon">F</span>
          Feed<span>Panel</span>
        </NavLink>
        <div className="nav-links">
          <NavLink to="/" end>
            Dashboard
          </NavLink>
          <NavLink to="/add-feedback">
            Add Feedback
          </NavLink>
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/add-feedback" element={<FeedbackForm />} />
        <Route path="*" element={<Dashboard />} />
      </Routes>

      <footer>Feedback Management System · Admin Panel</footer>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}
