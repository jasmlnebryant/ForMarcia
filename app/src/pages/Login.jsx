// Login.jsx — Marcia's one-time login screen
// She only ever sees this once. After that the app remembers her.

export default function Login() {
  return (
    <div className="page center">
      <h1>Welcome, Marcia</h1>
      <p>Let's get you set up.</p>
      {/* TODO: implement one-time Firebase auth setup */}
      <button>Get Started</button>
    </div>
  );
}
