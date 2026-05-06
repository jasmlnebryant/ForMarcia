// FamilyRequest.jsx — Family member view
// This is ALL family members can see and do — request an item for the grocery list

import { useState } from "react";

export default function FamilyRequest() {
  const [name, setName] = useState("");
  const [item, setItem] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim() || !item.trim()) return;
    // TODO: write request to Firestore
    console.log("Request submitted:", { name, item });
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="page center">
        <h2>Request sent!</h2>
        <p>Marcia will review your request.</p>
        <button onClick={() => { setSubmitted(false); setItem(""); }}>
          Add another item
        </button>
      </div>
    );
  }

  return (
    <div className="page">
      <h1>Request an Item</h1>
      <form onSubmit={handleSubmit}>
        <label>Your name</label>
        <input
          type="text"
          placeholder="e.g. Jasmine"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <label>What do you need?</label>
        <input
          type="text"
          placeholder="e.g. Orange juice"
          value={item}
          onChange={(e) => setItem(e.target.value)}
          required
        />
        <button type="submit">Send Request</button>
      </form>
    </div>
  );
}
