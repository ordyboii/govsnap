Project Specification: GovSnap

1. Vision & Purpose

GovSnap is a native desktop utility designed to automate the documentation of "As-Is" user journeys for GOV.UK-style forms and prototypes. It captures a sequential path through a web form, handles complex user interactions via a "Human-in-the-Loop" model, and uses AI to generate a structured journey map and documentation.

2. Core Tech Stack

- Framework: Electron (for native desktop access and browser manipulation) and Vite (frontend components).
- Language: Typescript with React
- Styling: Sass with BEM
- Automation Engine: Playwright (to drive the "Observer" browser).
- Intelligence: OpenAI API (GPT-4o Vision) for screenshot analysis and Mermaid.js generation.
- Data Handling: Node.js for file system operations (screenshots, zipping).
- Accessibility: WCAG 2.2 compliant HTML structure in Electron 

3. Functional Requirements
A. The "Observer" Browser

- The app must provide a split-view: A live browser window (left) and a control panel (right).
- Smart Navigation: Detects primary actions (e.g., .govuk-button).
- Persistence: Support for session storage/cookies to handle Auth screens (e.g., Gov Gateway) without re-logging every session.

B. Screenshot & Naming Convention

- Screenshots must be saved sequentially.
- Naming Pattern: [Sequence_No]__[Sanitized_URL_Slug]__[Timestamp].png
  - Example: 04__check-your-answers__20231027.png
- The full URL of every screen must be captured in a manifest.json file for technical reference.

C. Human-in-the-Loop (HITL) Logic

The app pauses and prompts the user for the following "Control Statements":

- Radio/Checkboxes: "Select an option and click Capture."
- Inputs: Detects either a single input or multiple inputs (pages using complex question pattern) and asks user to fill in AI generated dummy data based on the label or input manually
- File Upload: "Upload your file manually, then click Capture."
- Task List: Detects govuk-task-list links and asks the user which task to start
- Error State: Detects .govuk-error-summary and highlights the capture as a "Failure Path."

D. Data Profile Injection

- A side-panel to manage a JSON profile (Name, Address, NINO, etc.).
- A "Fill Form" button that attempts to auto-populate the current page based on field labels.

E. AI Journey Mapping

Post-journey, the app sends all screenshots + metadata to GPT-4o-Vision.

Output: A Markdown file containing:
- A Mermaid.js sequence diagram or flowchart.
- A table summarizing each step (User Goal, Page Title, Action Taken).
