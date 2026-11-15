import React from "react";
import "./css/PageLoader.css";

// Shown while a page's code is downloading, so visitors never see a blank screen.
const PageLoader = ({ inline = false }) => (
  <div
    className={inline ? "page-loader page-loader--inline" : "page-loader"}
    role="status"
    aria-live="polite"
  >
    <span className="page-loader__spinner" aria-hidden="true" />
    <span className="page-loader__text">Loading…</span>
  </div>
);

export default PageLoader;
