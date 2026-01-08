import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

export const SettingsContext = createContext();

// export const SettingsProvider = ({ children }) => {
//   const [theme, setTheme] = useState("dark");
//   const [alternative, setAlternative] = useState(0); // 0 = multi-task, 1 = single-task
//   const [loading, setLoading] = useState(true);

//   const API_URL = "http://127.0.0.1:3010/options/1";

//   // Load options on mount
//   useEffect(() => {
//     const fetchOptions = async () => {
//       try {
//         const res = await axios.get(API_URL);
//         if (res.data && res.data._id) {
//           setTheme(res.data.theme || "dark");
//           setAlternative(res.data.alternative ?? 0);
//         } else {
//           await axios.post("http://127.0.0.1:3010/options", {
//             theme: "dark",
//             alternative: 0,
//             own_textual_data: ""
//           });
//         }
//       } catch (error) {
//         try {
//           await axios.post("http://127.0.0.1:3010/options", {
//             theme: "dark",
//             alternative: 0,
//             own_textual_data: ""
//           });
//         } catch (err) {
//           console.error("Cannot create default options", err);
//         }
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchOptions();
//   }, []);

//   const toggleTheme = async () => {
//     const newTheme = theme === "dark" ? "light" : "dark";
//     setTheme(newTheme);
//     try {
//       await axios.patch(API_URL, { theme: newTheme });
//     } catch (error) {
//       console.error("Failed to update theme", error);
//     }
//   };

//   const toggleAlternative = async () => {
//     const newAlt = alternative === 0 ? 1 : 0;
//     setAlternative(newAlt);
//     try {
//       await axios.patch(API_URL, { alternative: newAlt });
//     } catch (error) {
//       console.error("Failed to update alternative mode", error);
//     }
//   };

//   return (
//     <SettingsContext.Provider
//       value={{ theme, toggleTheme, alternative, toggleAlternative, loading }}
//     >
//       {children}
//     </SettingsContext.Provider>
//   );
// };

export const SettingsProvider = ({ children }) => {
  const [theme, setTheme] = useState("dark");
  const [alternative, setAlternative] = useState(0); // 0 = multi-task, 1 = single-task
  const [loading, setLoading] = useState(false); // không fetch nữa

  const toggleTheme = () => setTheme(prev => (prev === "dark" ? "light" : "dark"));
  const toggleAlternative = () => setAlternative(prev => (prev === 0 ? 1 : 0));

  return (
    <SettingsContext.Provider
      value={{ theme, toggleTheme, alternative, toggleAlternative, loading }}
    >
      {children}
    </SettingsContext.Provider>
  );
};
