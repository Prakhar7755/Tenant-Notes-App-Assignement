"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import NoteItem from "@/components/NoteItem";

export default function NotesPage() {
  const router = useRouter();
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [tenant, setTenant] = useState(null);
  const [user, setUser] = useState(null);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    if (!token) {
      router.push("/login");
      return;
    }

    const storedUser = JSON.parse(localStorage.getItem("user"));
    setUser(storedUser);

    fetchNotes();
    fetchTenant();
  }, []);

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/notes", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setNotes(data.notes || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTenant = async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/tenants/${user.tenantSlug}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      console.log("Fetched notes:", data);
      setTenant(data.tenant);
    } catch (err) {
      console.error(err);
    }
  };

  const createNote = async () => {
    if (!title.trim()) {
      alert("Title is required!");
      return;
    }

    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, content }),
      });

      const data = await res.json();

      if (!res.ok) {
        switch (res.status) {
          case 400:
            alert(data.error || "Invalid request");
            break;
          case 401:
            alert("Unauthorized. Please log in again.");
            router.push("/login");
            break;
          case 403:
            alert(data.error || "Free plan limit reached! Upgrade to Pro.");
            break;
          case 404:
            alert(data.error || "Tenant not found");
            break;
          default:
            alert(data.error || "Failed to create note");
        }
        return;
      }

      // success add new note to the list
      if (data.note) {
        setNotes([...notes, data.note]);
        setTitle("");
        setContent("");
      } else {
        alert("Failed to create note: No note returned from server");
      }
    } catch (err) {
      console.error(err);
      alert("An unexpected error occurred while creating the note");
    }
  };

  const deleteNote = async (id) => {
    try {
      await fetch(`/api/notes/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotes(notes.filter((n) => n._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const upgradeTenant = async () => {
    try {
      await fetch(`/api/tenants/${user.tenantSlug}/upgrade`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchTenant();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Notes</h1>

      {/* Create Note */}
      <div className="flex flex-col mb-4 gap-2">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Note Title"
          className="px-3 py-2 border rounded-md"
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Note Content (optional)"
          className="px-3 py-2 border rounded-md"
        />
        <button
          onClick={createNote}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500"
        >
          Add Note
        </button>
      </div>

      {/* Upgrade Button */}
      {tenant?.plan === "free" &&
        notes.length >= 3 &&
        user?.role === "admin" && (
          <div className="mb-4">
            <button
              onClick={upgradeTenant}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-500"
            >
              Upgrade to Pro
            </button>
          </div>
        )}

      {/* Notes List */}
      {loading ? (
        <p>Loading...</p>
      ) : notes.length === 0 ? (
        <p>No notes yet.</p>
      ) : (
        <ul className="space-y-2">
          {notes.map((note) => (
            <NoteItem
              key={note._id}
              note={note}
              onDelete={deleteNote}
              onUpdate={(updatedNote) =>
                setNotes(
                  notes.map((n) =>
                    n._id === updatedNote._id ? updatedNote : n
                  )
                )
              }
            />
          ))}
        </ul>
      )}
    </div>
  );
}
