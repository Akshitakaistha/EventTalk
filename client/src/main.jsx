// import { createRoot } from "react-dom/client";
// import App from "./App";
// import "./index.css";
// import { AuthProvider } from "./contexts/AuthContext";
// import { FormBuilderProvider } from "./contexts/FormBuilderContext";

// createRoot(document.getElementById("root")!).render(
//   <AuthProvider>
//     <FormBuilderProvider>
//       <App />
//     </FormBuilderProvider>
//   </AuthProvider>
// );

import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { AuthProvider } from "./contexts/AuthContext";
import { FormBuilderProvider } from "./contexts/FormBuilderContext";

const rootElement = document.getElementById("root");

if (rootElement) {
  const root = createRoot(rootElement);
  root.render(
    <AuthProvider>
      <FormBuilderProvider>
        <App />
      </FormBuilderProvider>
    </AuthProvider>
  );
} else {
  console.error("Root element not found");
}
