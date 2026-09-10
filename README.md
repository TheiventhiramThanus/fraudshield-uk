# FraudShield UK

A defensive fraud-awareness platform that presents explainable risk assessments
for suspicious messages and URLs. It does not determine that a person, message,
or website is definitively fraudulent.

## Local development

The project currently has two local services:

| Service | Technology | Address |
| --- | --- | --- |
| Web interface | React, TypeScript, Vite, Tailwind CSS | http://127.0.0.1:8443 |
| API | Python, FastAPI, SQLAlchemy | http://127.0.0.1:8000/docs |

### Frontend

```powershell
pnpm install --trust-lockfile
pnpm run dev
```

### Backend

```powershell
python -m venv backend/.venv
backend/.venv/Scripts/python -m pip install -r backend/requirements.txt
backend/.venv/Scripts/python -m uvicorn app.main:app --app-dir backend --host 127.0.0.1 --port 8000
```

The API uses `backend/fraudshield.db` locally. For deployment, set
`DATABASE_URL` to a PostgreSQL/Supabase database connection string and set
`ALLOWED_ORIGINS` to the deployed frontend URL.

## Current API

- `GET /api/v1/health`
- `GET /api/v1/categories`
- `POST /api/v1/analyse/message`
- `POST /api/v1/analyse/url`
- `GET /api/v1/history`

The analysis endpoints use transparent rule-based indicators as their first
baseline. Their responses contain a risk band, detected indicators,
recommendations, and a responsible-AI disclaimer. A reviewed ML model can be
combined with those rules only after it passes the activation quality gate.

## Firebase authentication and Firestore

The React client is configured for Firebase Authentication and Cloud Firestore.
Copy `.env.example` to `.env.local` and add the Firebase web-app settings.
Enable **Email/Password** in the Firebase Authentication console, create a
Firestore database in locked mode, and deploy the supplied `firestore.rules`.
The project’s Firebase configuration belongs in `.env.local`, which is ignored
by Git. A Firebase Admin service account is additionally needed before the
FastAPI service can validate Firebase ID tokens.

### Roles

- **Visitor:** can access public pages and run unsaved checks.
- **Registered user:** can sign in, submit a report, save an analysis, and view
  or delete only their own saved analyses.
- **Admin:** can access `/admin` and approve or reject submitted scam reports.

Users can optionally contribute a de-identified message or URL sample to the
`training_candidates` queue. Admins must approve and label each candidate before
it can be exported for offline model training. These candidates are not used to
change live predictions automatically.

## ML model training

An admin can export approved training candidates as CSV from `/admin`. Copy the
downloaded file to `backend/data/approved_training_samples.csv`, then run:

```powershell
backend/.venv/Scripts/python backend/scripts/train_models.py --input backend/data/approved_training_samples.csv --data-version "UK-approved-2026-09" --activate
```

The dashboard export is already de-identified. Before using an external,
approved dataset, clean it and inspect the printed audit summary:

```powershell
backend/.venv/Scripts/python backend/scripts/clean_training_data.py --input backend/data/raw_approved.csv --output backend/data/approved_training_samples.csv
```

The script trains separate message and URL models, prints held-out accuracy,
precision, recall, and F1 metrics, and writes model bundles under
`backend/models/`. It only activates a bundle when `--activate` is supplied and
the held-out F1 reaches 0.75 (or the supplied `--minimum-f1`). Restart the API
after a successfully activated run. Do not use demo, unreviewed, insufficient,
or weak data in a production decision flow.

## Automatic training

The API includes an automatic Firestore training worker. User-consented samples
are cleaned and auto-approved in the web app. The worker checks Firestore every
five minutes, retrains only after the approved dataset changes, and activates a
candidate only when it has at least 100 samples of each applicable type, both
labels, and a held-out F1 of at least 0.75. A weak model is retained only as a
rejected training attempt; it never replaces the live model.

Create a Firebase service-account JSON key in Firebase Console, keep it outside
the repository, and set `FIREBASE_SERVICE_ACCOUNT_PATH` plus the `AUTO_TRAINING_*`
variables shown in `backend/.env.example` before starting the API. Check
`GET /api/v1/training/status` to see its configuration, sample counts, and last
quality-gate result.

## Firebase Hosting + Cloud Run deployment

The production frontend is hosted by Firebase Hosting. Its `/api/**` rewrite
proxies API requests to the `fraudshield-api` Cloud Run service in
`europe-west2`, so production builds use `/api/v1` without exposing a separate
API URL in browser configuration.

Deploy `backend/` as the `fraudshield-api` Cloud Run service using its Dockerfile.
Set `AUTO_TRAINING_ENABLED=false` on that API service, attach a Google service
account that can read Firestore and read/write its Cloud Storage bucket, and set
`MODEL_STORAGE_BUCKET`. Deploy the same image as a Cloud Run Job with the command
`python -m app.training_job`, `AUTO_TRAINING_ENABLED=true`, and a schedule of
every 15 minutes or longer. The Job only promotes a model that reaches the
configured held-out F1 threshold; Cloud Storage makes promoted models available
to fresh API instances.

New accounts are deliberately created with the `user` role. To promote a
trusted account, use the Firebase Console with project-owner access to change
that account's `profiles/{uid}.role` value to `admin`. Do not loosen the
Firestore rules or allow this change from the browser; those rules prevent a
user from assigning themselves the admin role.
