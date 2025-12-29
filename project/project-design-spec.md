# GovSnap design spec

1. Visual Language & Branding

- Header: A solid GOV.UK Blue (#1d70b8) banner across the top of the application window.
- Typography: * Primary Font: GDS Transport (if available) or a clean, legible fallback like Inter, Roboto, or system-ui sans-serif.
- Scale: 19px for body text, 24px for sub-headings, 14px for metadata/labels.
- Corner Radius: 0px (GDS standard is very "square" and utilitarian, though 2px can be used for buttons to feel more like an app).

2. Color Palette
Element	Hex Code	Purpose
Primary Blue	#1d70b8	App Header, Primary Actions.
Success Green	#00703c	"Capture & Next" (The happy path).
Error Red	#d4351c	Validation errors, Failed Captures.
Text Black	#0b0c0c	All primary text.
Secondary Grey	#505a5f	Metadata, URL bar text, borders.
Background Grey	#f3f2f1	Side panel/Control background.

3. Layout: The "Split-Console" Grid

The app is divided into two primary sections using a 12-column grid:
A. The Browser View (8 Columns - Left)

- Chrome: A minimal URL bar at the top (Grey #f3f2f1).
- Viewport: A high-fidelity Playwright/Electron view that renders the form.
- Interaction: No custom styling; this is a raw window into the prototype.

B. The Control Panel (4 Columns - Right)

- Border: A 1px solid separator (#b1b4b6).
- Padding: 20px internal padding for all containers.
- Stacking: 1. Project Header: Project Name (Editable Input). 2. The Journey Log: A vertical list of captured steps. Each item shows a thumbnail + Page Title + Sanitized URL. 3. Data Profile Selector: A dropdown with the active mock data profile. 4. The Action Block: Sticky at the bottom. * Primary Button: "Capture & Next" (Green). * Secondary Button: "Manual Snapshot" (Grey). * Final Action: "Generate Map & Zip" (Blue).

4. Component Styles (React)
Buttons

- Base: Min-height 44px, bold text, white foreground.
- Hover State: Darken the background color by 10%.
- Focus State: 3px yellow outline (#ffdd00)—essential for accessibility and GDS feel.

Status Indicators

- Captured: A small green tick next to the step name.
- Interrupted: A small amber warning icon if the app detects a Radio/Checkbox list that needs user input.

URL Bar 

- Styling: Inset shadow, #ffffff background, 1px grey border.
- Logic: Shows the current live URL of the Playwright window; read-only during "Auto" mode.
