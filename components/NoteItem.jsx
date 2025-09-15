"use client";

import React, { useState } from "react";

export default function NoteItem({ note, onDelete, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content || "");
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    if (!title.trim()) {
      alert("Title cannot be empty");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/notes/${note._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, content }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to update note");
        return;
      }

      onUpdate(data); 
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      alert("An unexpected error occurred while updating the note");
    } finally {
      setLoading(false);
    }
  };

  return (
    <li className="flex flex-col md:flex-row justify-between items-start md:items-center bg-gray-700 p-3 rounded-md">
      {isEditing ? (
        <div className="flex-1 flex flex-col gap-2 w-full">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="px-2 py-1 rounded-md bg-gray-800 text-white"
          />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="px-2 py-1 rounded-md bg-gray-800 text-white"
          />
        </div>
      ) : (
        <div className="flex-1 w-full">
          <span className="font-semibold">{note.title}</span>
          {note.content && <p>{note.content}</p>}
        </div>
      )}

      <div className="flex gap-2 mt-2 md:mt-0">
        {isEditing ? (
          <>
            <button
              onClick={handleUpdate}
              disabled={loading}
              className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-500"
            >
              {loading ? "Saving..." : "Save"}
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="px-3 py-1 bg-gray-600 text-white rounded-md hover:bg-gray-500"
            >
              Cancel
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setIsEditing(true)}
              className="px-3 py-1 bg-yellow-600 text-white rounded-md hover:bg-yellow-500"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete(note._id)}
              className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-500"
            >
              Delete
            </button>
          </>
        )}
      </div>
    </li>
  );
}
