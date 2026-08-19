import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  ArrowLeft,
  Paperclip,
  Clock,
  Undo2,
  Redo2,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  List,
  ListOrdered,
  Type,
  CalendarDays,
} from "lucide-react";

const API_URL = "http://localhost:5000";

function Compose() {
  const navigate = useNavigate();
  const editorRef = useRef<HTMLDivElement>(null);

  const [showSchedule, setShowSchedule] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState("");
  const [customDateTime, setCustomDateTime] = useState("");

  const [sender] = useState("juana62@ethereal.email");
  const [recipient, setRecipient] = useState("");
  const [subject, setSubject] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const executeCommand = (command: string) => {
    editorRef.current?.focus();
    document.execCommand(command);
  };

  const selectSchedule = (schedule: string) => {
    setSelectedSchedule(schedule);
    setCustomDateTime("");
  };

  const getScheduledDate = () => {
    if (customDateTime) {
      return new Date(customDateTime).toISOString();
    }

    const now = new Date();

    if (selectedSchedule === "Tomorrow") {
      now.setDate(now.getDate() + 1);
      now.setHours(9, 0, 0, 0);
      return now.toISOString();
    }

    if (selectedSchedule === "Tomorrow, 10:00 AM") {
      now.setDate(now.getDate() + 1);
      now.setHours(10, 0, 0, 0);
      return now.toISOString();
    }

    if (selectedSchedule === "Tomorrow, 11:00 AM") {
      now.setDate(now.getDate() + 1);
      now.setHours(11, 0, 0, 0);
      return now.toISOString();
    }

    if (selectedSchedule === "Tomorrow, 3:00 PM") {
      now.setDate(now.getDate() + 1);
      now.setHours(15, 0, 0, 0);
      return now.toISOString();
    }

    return null;
  };

  const handleDone = async () => {
    if (!selectedSchedule) {
      alert("Please select a date and time.");
      return;
    }

    if (!recipient.trim()) {
      alert("Please enter a recipient email.");
      return;
    }

    if (!subject.trim()) {
      alert("Please enter a subject.");
      return;
    }

    const messageBody = editorRef.current?.innerHTML || "";

    if (!messageBody.trim()) {
      alert("Please enter an email message.");
      return;
    }

    const scheduledAt = getScheduledDate();

    if (!scheduledAt) {
      alert("Please select a valid date and time.");
      return;
    }

    try {
      setIsLoading(true);

      const response = await fetch(
        `${API_URL}/emails/schedule`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sender,
            recipient,
            subject,
            body: messageBody,
            scheduledAt,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to schedule email"
        );
      }

      alert("Email scheduled successfully!");

      console.log("Scheduled email:", data);

      setShowSchedule(false);

      setRecipient("");
      setSubject("");
      setSelectedSchedule("");
      setCustomDateTime("");

      if (editorRef.current) {
        editorRef.current.innerHTML = "";
      }

    } catch (error) {
      console.error(error);

      alert(
        error instanceof Error
          ? error.message
          : "Failed to schedule email"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="compose-page">

      <div className="compose-header">

        <button
          className="back-button"
          onClick={() => navigate("/home")}
        >
          <ArrowLeft size={20} />
          <span>Compose New Email</span>
        </button>

        <div className="compose-header-actions">

          <button
            type="button"
            className="icon-button"
            aria-label="Attach file"
          >
            <Paperclip size={17} />
          </button>

          <button
            type="button"
            className="icon-button"
            aria-label="Schedule email"
            onClick={() => setShowSchedule(!showSchedule)}
          >
            <Clock size={17} />
          </button>

          <button
            type="button"
            className="send-later-button"
            onClick={() => setShowSchedule(!showSchedule)}
          >
            Send Later
          </button>

          {showSchedule && (
            <div className="schedule-popup">

              <h3>Send Later</h3>

              <div className="custom-date-container">

                <label className="pick-date-button">

                  <span>
                    {customDateTime
                      ? new Date(
                          customDateTime
                        ).toLocaleString()
                      : "Pick date & time"}
                  </span>

                  <CalendarDays size={18} />

                  <input
                    type="datetime-local"
                    value={customDateTime}
                    onChange={(event) => {
                      setCustomDateTime(event.target.value);
                      setSelectedSchedule(event.target.value);
                    }}
                  />

                </label>

              </div>

              <button
                className={`schedule-item ${
                  selectedSchedule === "Tomorrow"
                    ? "selected"
                    : ""
                }`}
                onClick={() =>
                  selectSchedule("Tomorrow")
                }
              >
                Tomorrow
              </button>

              <button
                className={`schedule-item ${
                  selectedSchedule === "Tomorrow, 10:00 AM"
                    ? "selected"
                    : ""
                }`}
                onClick={() =>
                  selectSchedule("Tomorrow, 10:00 AM")
                }
              >
                Tomorrow, 10:00 AM
              </button>

              <button
                className={`schedule-item ${
                  selectedSchedule === "Tomorrow, 11:00 AM"
                    ? "selected"
                    : ""
                }`}
                onClick={() =>
                  selectSchedule("Tomorrow, 11:00 AM")
                }
              >
                Tomorrow, 11:00 AM
              </button>

              <button
                className={`schedule-item ${
                  selectedSchedule === "Tomorrow, 3:00 PM"
                    ? "selected"
                    : ""
                }`}
                onClick={() =>
                  selectSchedule("Tomorrow, 3:00 PM")
                }
              >
                Tomorrow, 3:00 PM
              </button>

              <div className="schedule-popup-footer">

                <button
                  className="schedule-cancel-button"
                  onClick={() =>
                    setShowSchedule(false)
                  }
                >
                  Cancel
                </button>

                <button
                  className="schedule-done-button"
                  onClick={handleDone}
                  disabled={isLoading}
                >
                  {isLoading
                    ? "Scheduling..."
                    : "Done"}
                </button>

              </div>

            </div>
          )}

        </div>

      </div>

      <div className="compose-content">

        <div className="email-row">

          <label>From</label>

          <div className="from-select">
            <span>{sender}</span>
            <span className="from-arrow">⌄</span>
          </div>

        </div>

        <div className="email-row">

          <label>To</label>

          <input
            type="email"
            placeholder="recipient@example.com"
            value={recipient}
            onChange={(event) =>
              setRecipient(event.target.value)
            }
          />

          <button
            type="button"
            className="upload-list-button"
          >
            Upload List
          </button>

        </div>

        <div className="email-row">

          <label>Subject</label>

          <input
            type="text"
            placeholder="Subject"
            value={subject}
            onChange={(event) =>
              setSubject(event.target.value)
            }
          />

        </div>

        <div className="delay-row">

          <span>Delay between 2 emails</span>

          <input
            type="number"
            placeholder="00"
          />

          <span>Hourly Limit</span>

          <input
            type="number"
            placeholder="00"
          />

        </div>

        <div className="message-section">

          <div
            ref={editorRef}
            className="message-editor"
            contentEditable
            suppressContentEditableWarning
            data-placeholder="Type Your Reply..."
          ></div>

          <div className="editor-toolbar">

            <button
              type="button"
              onClick={() =>
                executeCommand("undo")
              }
            >
              <Undo2 size={16} />
            </button>

            <button
              type="button"
              onClick={() =>
                executeCommand("redo")
              }
            >
              <Redo2 size={16} />
            </button>

            <div className="toolbar-divider"></div>

            <button type="button">
              <Type size={16} />
            </button>

            <button
              type="button"
              onClick={() =>
                executeCommand("bold")
              }
            >
              <Bold size={16} />
            </button>

            <button
              type="button"
              onClick={() =>
                executeCommand("italic")
              }
            >
              <Italic size={16} />
            </button>

            <button
              type="button"
              onClick={() =>
                executeCommand("underline")
              }
            >
              <Underline size={16} />
            </button>

            <div className="toolbar-divider"></div>

            <button
              type="button"
              onClick={() =>
                executeCommand("justifyLeft")
              }
            >
              <AlignLeft size={17} />
            </button>

            <button
              type="button"
              onClick={() =>
                executeCommand(
                  "insertOrderedList"
                )
              }
            >
              <ListOrdered size={17} />
            </button>

            <button
              type="button"
              onClick={() =>
                executeCommand(
                  "insertUnorderedList"
                )
              }
            >
              <List size={17} />
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Compose;