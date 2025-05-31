import React, { useState } from "react";
import axios from "axios";

const NotesForm = () => {
  const [note, setNote] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.post("/api/appointments/notes", { note })
      .then(response => alert("Note added!"))
      .catch(error => console.log(error));
  };

  return (
    <div className="mt-4">
      <h2 className="text-xl font-bold">Add Notes</h2>
      <textarea
        className="w-full p-2 mb-4 border rounded"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Insert your note here"
      />
      <button
        onClick={handleSubmit}
        className="bg-blue-500 text-white p-2 rounded"
      >
        Save Note
      </button>
    </div>
  );
};

export default NotesForm;
