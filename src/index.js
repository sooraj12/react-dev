// import React from "react";
import ReactDOM from "react-dom/client";
// import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { createRoot } from "./dom:v0.1";

const root = createRoot(document.getElementById("root"));
const root2 = ReactDOM.createRoot(document.getElementById("root"));
// console.log(root);
// console.log(root2);
// root.render(
//   <React.StrictMode>
//     <App />
//   </React.StrictMode>
// );
root.render(<App />);

const NoContext = 0b000;
const RenderContext = 0b010;
const CommitContext = 0b100;

console.log(NoContext & (RenderContext | CommitContext));

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
