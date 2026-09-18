import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import AuthProvider from "./Features/Auth/auth.context.jsx";
import InterviewProvider from "./Features/Interview/interview.context.jsx";

createRoot(document.getElementById("root")).render(
  <AuthProvider>
    <InterviewProvider>
      <App />
    </InterviewProvider>
  </AuthProvider>,
);
