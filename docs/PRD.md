# GovSnap - Project Requirements Document

## Overview
GovSnap is a native desktop app that automates documentation of user journeys through GOV.UK-style forms. It captures sequential interactions, handles complex form patterns with human oversight, and generates AI-powered journey maps.

---

## Tech Stack

- **Framework**: Electron + Vite
- **Language**: TypeScript
- **UI Library**: React
- **Styling**: Sass with BEM methodology
- **Browser Automation**: Playwright
- **Local Storage**: SQLite (better-sqlite3) for journey and profile management
- **Diagram Generation**: Cytoscape.js with Dagre layout (for flowchart rendering)
- **PDF Export**: Playwright page.pdf() to convert Cytoscape diagrams to PDF
- **File Operations**: Node.js fs module

---

## Coding Style

- **TypeScript**: Strict mode enabled, explicit typing for all functions and components
- **React**: Functional components with hooks, no class components
- **CSS Architecture**: BEM naming convention (Block__Element--Modifier)
- **Code Organization**: Feature-based folder structure
- **Naming Conventions**: 
  - Components: PascalCase
  - Files: kebab-case
  - Functions/variables: camelCase
  - Constants: UPPER_SNAKE_CASE
- **Accessibility**: WCAG 2.2 Level AA compliant

---

## Core Features

### 1. Split-View Observer Browser
- Live browser window (left) + control panel (right)
- Playwright-driven browser automation with session persistence
- **Auto-navigation mode**:
  - Automatically clicks primary action buttons (`.govuk-button`)
  - Auto-fills form inputs using selected Profile Manager data
  - Auto-uploads files using default test file
  - Takes screenshots at every page automatically
- **Pauses for**:
  - Radio buttons/checkboxes requiring user selection
  - Task lists (`.govuk-task-list`) requiring user choice
  - Error summaries (`.govuk-error-summary`) - shows alert notification
- **Auto-stops when**:
  - GOV.UK confirmation page detected (`.govuk-panel--confirmation`, "complete/submitted" text, or `/confirmation` URL pattern)
  - User manually clicks "End Journey" button

### 4. Journey Management System
- **Multi-journey support**: Users can manage multiple journeys within the app
- **Journey creation**:
  - User enters starting URL
  - Selects profile from dropdown
  - Journey auto-named: `[Service Name] - [Date]` (editable by user)
- **Journey states**:
  - `in_progress` - Active capturing
  - `paused_error` - Stopped at error page
  - `complete` - Journey finished
- **Pause and resume**:
  - Save progress at any point
  - Resume journey restores:
    - Full browser context (cookies, localStorage, sessionStorage)
    - Opens at last captured URL
    - Loads previously selected profile
    - Shows existing screenshot timeline
  - Error page resume: User can fix issue or document error path
- **Journey list view**: Shows all saved journeys with name, date, step count, status
- **Local storage**: All data stored in SQLite database

### 5. Screenshot & Naming Convention
- **Naming**: `[Sequence]__[URL-Slug]__[Timestamp].png`
- **Metadata**: `manifest.json` with full URLs and timestamps
- Sequential numbering (01, 02, 03...)

### 3. Data Profile Manager
- Standalone UI panel for creating and managing multiple profiles
- Each profile contains structured dummy data (Name, Address, NINO, etc.)
- Profiles stored in SQLite and reusable across all journeys
- **Field matching logic**: Matches form inputs by `<label>` text and input `name` attribute
  - Example: "First name" / `firstName` → `profile.firstName`
  - Example: "Postcode" / `postcode` → `profile.address.postcode`
- **Journey workflow**:
  - User selects profile when starting new journey
  - Profile can be switched mid-journey (previous steps retain original data)
  - Selected profile used for auto-filling subsequent form fields

### 6. PDF Journey Documentation
User-triggered PDF generation (on-demand):
- **When**: User clicks "Generate Journey Map" after journey completion or manual stop
- **Technology**: Cytoscape.js (free, open-source MIT license) for diagram rendering
- **Layout**: Dagre algorithm for automatic horizontal left-to-right flow
- **Visual flowchart** containing:
  - Embedded screenshot thumbnails (dynamically sized based on image aspect ratio)
  - Nodes with GOV.UK blue labels showing step number and page title
  - Arrows connecting sequential steps
  - Decision diamonds for user choices (radio/checkbox selections, task lists)
  - Labels on branches ("Yes", "No", or option text)
  - Alternative/error paths clearly marked
- **Export process**:
  1. Load journey data from SQLite (screenshots, metadata, step sequence)
  2. Render flowchart in headless browser window using Cytoscape.js
  3. Use Playwright's `page.pdf()` to export as PDF
- **Summary page** with journey metadata:
  - Journey name
  - Total steps
  - Start/end URLs
  - Completion time/date
  - Profile used
  - Date captured
- Export as `.pdf` file with journey name

---

## Design System

### GOV.UK Design System Replica

**Typography**
- Font family: GDS Transport, Arial, sans-serif
- Base font size: 19px (desktop), 16px (mobile)
- Headings: Bold weight, appropriate hierarchy

**Colors**
- Primary: `#1d70b8` (GOV.UK Blue)
- Text: `#0b0c0c` (Black)
- Background: `#ffffff` (White)
- Secondary background: `#f3f2f1` (Light grey)
- Error: `#d4351c` (Red)
- Success: `#00703c` (Green)

**Spacing**
- Base unit: 4px
- Standard margins: 15px, 20px, 30px
- Section padding: 20px (mobile), 30px (desktop)

**Components**
- Buttons: 19px text, 10px vertical padding, 15px horizontal padding
- Inputs: 40px height, 4px border width when focused
- Panels: 15px padding, 5px left border for highlights
- Layout: Max-width 960px for content, responsive grid

**Accessibility**
- Focus states: 3px yellow outline (`#ffdd00`) with 0px offset
- Minimum touch target: 44x44px
- Color contrast: Minimum 4.5:1 for text

**References**: https://design-system.service.gov.uk/

---


## Database Schema (SQLite)

**journeys**
- `id` (INTEGER PRIMARY KEY)
- `name` (TEXT) - User-editable journey name
- `service_url` (TEXT) - Starting URL
- `status` (TEXT) - 'in_progress' | 'paused_error' | 'complete'
- `profile_id` (INTEGER FK) - References profiles table
- `last_url` (TEXT) - Last captured URL for resume
- `browser_context` (TEXT) - Serialized Playwright session data
- `created_at` (DATETIME)
- `updated_at` (DATETIME)

**steps**
- `id` (INTEGER PRIMARY KEY)
- `journey_id` (INTEGER FK) - References journeys table
- `sequence_no` (INTEGER) - Step number in journey
- `screenshot_path` (TEXT) - Path to PNG file
- `page_url` (TEXT) - Full URL of captured page
- `page_title` (TEXT) - Extracted page title
- `action_type` (TEXT) - 'button' | 'radio' | 'checkbox' | 'input' | 'upload' | 'error'
- `user_input` (TEXT) - Data entered or choice made
- `timestamp` (DATETIME)

**profiles**
- `id` (INTEGER PRIMARY KEY)
- `name` (TEXT) - Profile name (e.g., "Test User 1")
- `data` (TEXT) - JSON blob of form data
- `created_at` (DATETIME)

---

## Technical Implementation Notes

### Diagram Generation Approach
- **Cytoscape.js** chosen over alternatives (Canvas API, Mermaid.js, GoJS):
  - Free and open source (MIT license) vs GoJS commercial licensing
  - Automatic layout algorithms vs manual Canvas positioning
  - Better image handling than Mermaid.js
  - Dagre layout provides clean horizontal flow with automatic branching
- **Dynamic node sizing**: Calculate image dimensions at load time, set node width/height to match screenshot aspect ratios (prevents cropping)
- **Rendering workflow**:
  1. Create Cytoscape instance with journey data
  2. Apply Dagre layout (`rankDir: 'LR'` for left-to-right)
  3. Render to hidden browser window
  4. Export via Playwright screenshot/PDF functionality

### Interactive Controls (for preview in app)
- Built-in Cytoscape zoom/pan controls
- Keyboard shortcuts: `+/-` zoom, `F` fit, `0` reset
- Mouse: scroll wheel zoom, click-drag pan
- Zoom buttons for accessibility

---

## Output Artifacts

**Per journey:**
1. **Screenshots** folder: `screenshots/journey-[id]/[sequence]__[url-slug]__[timestamp].png`
2. **Journey data** stored in SQLite database
3. **Generated PDF**: `journey-maps/[journey-name]__[date].pdf` (on-demand)

**Export options:**
- Individual journey PDF
- Zipped package (screenshots + PDF + JSON export of metadata)