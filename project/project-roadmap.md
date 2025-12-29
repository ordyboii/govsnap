Agile Implementation Plan: JourneySnap AI

This roadmap follows an incremental build strategy suitable for an AI Agent to execute in steps.
Sprint 1: The "Observer" Shell (MVP)

- [ ] Initialize Electron with a Playwright-controlled Webview or BrowserView.
- [ ] Implement a "Capture" button that takes a screenshot of the current view.
- [ ] Feature: Logic to sanitize the current URL path and use it in the filename (e.g., /apply/name becomes 01_apply-name.png).
- [ ] Save files to a local timestamped directory.

Sprint 2: Navigation & Data Injection

- [ ] Implement "Capture & Continue": App finds .govuk-button, clicks it, and waits for the next page load.
- [ ] Create the "Data Profile" sidebar.
- [ ] Logic: Implement a function to map JSON keys to HTML form labels/IDs to auto-fill inputs.

Sprint 3: Handling Interruptions

- [ ] Add "State Detection": App detects if the page has radios, checkboxes, or file uploads.
- [ ] UI: Show a "User Action Required" banner when these elements are present.
- [ ] Add a "Manual Pause" toggle to allow for Auth/Login (Gov Gateway) flows without interference.

Sprint 4: The AI Documentation Engine

- [ ] Integrate OpenAI SDK.
- [ ] Create the Vision Prompt Template: "Analyze these sequential images from a GOV.UK service. Extract the H1, the user's primary task, and the data entered. Output a Mermaid.js flowchart string."
- [ ] Generate journey_map.md in the local project folder.

Sprint 5: Packaging & Export

- [ ] Implement the adm-zip library to bundle the screenshots and Markdown files.
- [ ] Add a "Project Complete" screen that opens the final .zip file in the user's file explorer.

🔍 Notes for the AI Agent

- Selectors: Focus on the GDS (Government Design System) standard classes: .govuk-button, .govuk-heading-xl, .govuk-task-list.
- Error Handling: If Playwright fails to find a button, do not crash; provide a "Manual Capture" fallback for the user.
- Security: Do not hardcode API keys; provide a settings field for the user to input their own OpenAI Key.
