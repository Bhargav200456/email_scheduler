import {
  Search,
  Filter,
  RotateCw,
  Clock,
  Send,
  ChevronDown,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

import logo from "../assets/logo.png";
import avatar from "../assets/avatar.jpg";

const API_URL = "http://localhost:5000";

interface Email {
  id: string;
  sender: string;
  recipient: string;
  subject: string;
  body: string;
  scheduledAt: string;
  status: string;
  createdAt?: string;
}

function Home() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<"scheduled" | "sent">(
    "scheduled"
  );

  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchEmails = async () => {
    try {
      setLoading(true);
      setError("");

      const status =
        activeTab === "scheduled" ? "SCHEDULED" : "SENT";

      const response = await fetch(
        `${API_URL}/emails?status=${status}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch emails");
      }

      const data = await response.json();

      setEmails(data.emails || data);
    } catch (error) {
      console.error(error);
      setError("Unable to load emails");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmails();
  }, [activeTab]);

  return (
    <div className="home-page">

      <aside className="sidebar">

        <div className="logo">
          <img src={logo} alt="ONE Logo" />
        </div>

        <div className="profile">

          <div className="avatar">
            <img src={avatar} alt="Avatar" />
          </div>

          <div className="profile-info">

            <span className="profile-name">
              Oliver Brown
            </span>

            <span className="profile-email">
              oliver.brown@domain.io
            </span>

          </div>

          <ChevronDown className="profile-arrow" />

        </div>

        <button
          className="compose-button"
          onClick={() => navigate("/compose")}
        >
          Compose
        </button>

        <div className="menu-section">

          <p className="menu-heading">CORE</p>

          <button
            className={`menu-item ${
              activeTab === "scheduled" ? "active" : ""
            }`}
            onClick={() => setActiveTab("scheduled")}
          >
            <div className="menu-left">
              <Clock size={13} />
              <span>Scheduled</span>
            </div>
          </button>

          <button
            className={`menu-item ${
              activeTab === "sent" ? "active" : ""
            }`}
            onClick={() => setActiveTab("sent")}
          >
            <div className="menu-left">
              <Send size={13} />
              <span>Sent</span>
            </div>
          </button>

        </div>

      </aside>

      <main className="main-content">

        <header className="top-bar">

          <div className="search-container">

            <Search size={14} />

            <input
              type="text"
              placeholder="Search"
            />

          </div>

          <div className="header-actions">

            <button type="button" aria-label="Filter">
              <Filter size={14} />
            </button>

            <button
              type="button"
              aria-label="Refresh"
              onClick={fetchEmails}
            >
              <RotateCw size={14} />
            </button>

          </div>

        </header>

        <div className="content-area">

          {loading && (
            <p>Loading emails...</p>
          )}

          {error && (
            <p>{error}</p>
          )}

          {!loading &&
            !error &&
            emails.length === 0 && (
              <p>
                No {activeTab} emails found.
              </p>
            )}

          {!loading &&
            !error &&
            emails.map((email) => (
              <div
                key={email.id}
                className="email-card"
              >

                <div className="email-card-main">

                  <div className="email-subject">
                    {email.subject}
                  </div>

                  <div className="email-recipient">
                    To: {email.recipient}
                  </div>

                </div>

                <div className="email-card-details">

                  <span>
                    {activeTab === "scheduled"
                      ? "Scheduled: "
                      : "Sent: "}

                    {new Date(
                      email.scheduledAt
                    ).toLocaleString()}
                  </span>

                  <span className="email-status">
                    {email.status}
                  </span>

                </div>

              </div>
            ))}

        </div>

      </main>

    </div>
  );
}

export default Home;