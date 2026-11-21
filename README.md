# Phishing Message Triage — Web Client

Browser client for the Phishing Message Triage API (COMP 4537, Team prjT3, Group 3).

- Live site: https://shinyoungyou.github.io/phishing-message-triage/
- API: https://phishing-message-triage-api.onrender.com

Sign in or register, submit an email's subject, body and sender, and view the
AI analysis. Administrators can view registered users.

Demo accounts (test data only):
- User: john@john.com / 123
- Administrator: admin@admin.com / 111

The first request after a period of inactivity can take up to a minute while
the API server starts.

## Run locally

Serve this folder over HTTP on port 5500 (for example
`python3 -m http.server 5500`) with the API running on http://localhost:3000.

## Notes

All authentication and authorization are enforced by the API; this site holds
no secrets. Source and full documentation are maintained in the team's main
repository.

Team: Calvin Nguyen (frontend), Nicolas Agostini (AI service and integration),
Shinyoung You (backend foundation).
