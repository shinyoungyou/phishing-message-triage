# Frontend

Browser application for the Phishing Message Triage API.
Owner: Member 1 (name to confirm), branch feature/frontend.
Planned stack: HTML, Tailwind CSS, JavaScript; hosted on GitHub Pages.

## Status

Completed for Milestone 1:
- Registration and login views using backend `/api/v1/auth/register` and `/api/v1/auth/login` with `credentials: "include"`.
- User landing page displaying current authenticated session (`GET /api/v1/users/me`), email triage form, and character counter.
- Quick demo login buttons for assignment demo accounts (`john@john.com / 123` user, `admin@admin.com / 111` admin).
- Pre-filled sample emails for testing (phishing sample and legitimate sample).
- Results card rendering overall verdict, status, reason codes, Gemini explanation and indicator tags, and Jev calibrated probability bars.
- Administrator console displaying user records from MongoDB (`GET /api/v1/admin/users`) with pagination controls.
- Separate messages file (`js/messages.js`) to centralize all user-facing copy.
- XSS-safe text rendering using DOM properties (`textContent`).

## Running Locally

Run a local HTTP server from the project root or the `frontend/` directory (must be served via HTTP/HTTPS so ES modules and credentials work):

```bash
# Option 1: Using Node's npx serve on port 5500 (matching backend ALLOWED_ORIGINS)
npx serve frontend -l 5500

# Option 2: Using Python
python3 -m http.server 5500 --directory frontend

# Option 3: VS Code "Live Server" extension on port 5500
```

Open `http://localhost:5500` in your browser.
Ensure the backend is running (`npm start` or `npm run dev` in `backend/`).

## Milestone 1 pages

- Registration/login using the team's own backend authentication endpoints
- User landing page showing the signed-in email and AI analysis form
- Email text input: subject, body, sender name/address
- Results panel with real AI classification, explanation, and failure states
- Administrator landing page displaying registered users from the database

Use regular-user and administrator roles. Employee/security-analyst roles,
file uploads, queues, human verdicts, and mailbox changes are not planned.
The API must enforce authorization; hiding admin buttons is insufficient.

## Milestone 2 pages and features

- Logout and clear expired-session handling
- Analysis history and individual stored results
- Proposed title-editing control and confirmed analysis-record deletion
- Personal API-consumption totals and free-call warning
- Administrator endpoint-statistics table: method, route, total requests
- Administrator user-consumption table: user/email, total requests
- Display Jev/Gemini comparisons and model probabilities when available
- Demonstrate every required API endpoint from the client

The administrator dashboard is required. A model-evaluation dashboard is optional.
Probabilities are model estimates, not measured accuracy.

## Integration agreement

See ../docs/api-contract.md. Proposed application routes use /api/v1/.
Member 3 supplies the deployed API URL, authentication behavior, response
shapes, usage information, and protected administrator endpoints.
Member 2 supplies validated AI results through that API.

Use credentialed fetch requests for cookie authentication, for example
credentials: "include" once the backend supports it. Do not read the HttpOnly
cookie in JavaScript or store JWTs in localStorage. Verify cookies in the
actual deployed browser environment with Member 3.

Provide the GitHub Pages origin to Member 3 early. Keep the public API base
URL in frontend configuration. Never include database credentials, JWT signing
keys, or AI provider keys in frontend code.

## UI behavior and safety

- Validate inputs before sending; the backend still validates independently.
- Show loading indicators, empty states, and descriptive success/error messages.
- Keep user-facing strings in a separate messages file.
- Safely render email text and AI output; do not insert untrusted HTML.
- Display partial/failed analysis explicitly, not as a legitimate verdict.
- Treat title editing as metadata only; preserve the email and original verdict.
- Show allowance warnings while keeping the service available after 20 calls.
- Refresh usage from server responses; never calculate authoritative counts locally.

## Development and verification

Start with clearly labeled sample responses agreed with Members 2 and 3.
Replace them with real API calls before the demonstration.
Test regular-user and admin flows, login/logout, CRUD persistence after
refresh, forbidden access, invalid input, network/provider failures,
loading states, and warning behavior around calls 19, 20, and 21.

Use the isolated assignment demonstration accounts supplied by Member 3.
Contribute deployed URLs, frontend source ZIP, UI test evidence, and report
screenshots. Do not claim functionality solely from mocked responses.
