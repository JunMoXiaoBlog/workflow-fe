// src/App.js - Modified
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import WorkflowEditor from "./WorkflowEditor";
import FlowListPage from "./FlowListPage";
import "./styles.css";
import "./tab-properties.css";
import "./resizable-panel.css";
import "./kv-table.css";
import "./flow-list.css";
import "semantic-ui-css/semantic.min.css";

export default function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Navigate to="/flows" />} />
          <Route path="/flows" element={<FlowListPage />} />
          <Route path="/editor" element={<WorkflowEditor />} />
          <Route path="/editor/:flowId" element={<WorkflowEditor />} />
        </Routes>
      </div>
    </Router>
  );
}
