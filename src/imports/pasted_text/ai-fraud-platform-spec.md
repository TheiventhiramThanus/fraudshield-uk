PROJECT TITLE
AI-Powered Fraud Detection & Scam Intelligence Platform for the UK

PROJECT PURPOSE

Build a professional full-stack AI-powered web platform focused on fraud detection, scam awareness, suspicious-message analysis, phishing URL risk analysis, fraud intelligence, reporting, analytics, and responsible AI.

The platform must be designed as an MSc-level Software Engineering + Data Science + Artificial Intelligence project.

The project should demonstrate:

- Full-stack software engineering
- Machine learning
- NLP
- Data analysis
- Data visualisation
- REST API architecture
- Database design
- Authentication
- Secure application development
- Responsible AI
- Research methodology
- Model evaluation
- Explainable predictions
- UK-focused fraud intelligence

The platform must NOT claim that any person, website, message, or transaction is definitely fraudulent.

Always present results as:

Low Risk
Medium Risk
High Risk
Very High Risk

Use wording such as:

“Potentially suspicious”
“Possible phishing indicators detected”
“This analysis is informational and should not replace official fraud reporting or professional advice.”

The system is a defensive fraud-awareness and detection platform only.

==================================================
1. TECHNOLOGY STACK
==================================================

FRONTEND

Use:

Next.js
TypeScript
React
Tailwind CSS
shadcn/ui
Lucide Icons
Recharts

Use App Router.

The frontend must be:

Responsive
Professional
Fast
Accessible
Modern
Mobile-friendly
SEO-friendly

BACKEND

Use:

Python
FastAPI
Pydantic
SQLAlchemy or Supabase Python client
scikit-learn
pandas
NumPy
joblib

Optional future support:

PyTorch
Hugging Face Transformers
SHAP

DATABASE

Use:

PostgreSQL

Prefer:

Supabase PostgreSQL

AUTHENTICATION

Use:

Supabase Auth

Support:

Email/password registration
Email verification
Login
Logout
Forgot password
Session management

DEPLOYMENT

Frontend:
Vercel

Backend:
Render or Railway

Database:
Supabase

Repository:
GitHub

==================================================
2. USER TYPES
==================================================

The system must support four logical user roles.

VISITOR

Can:

View homepage
Read fraud-awareness information
View public UK fraud dashboard
Try limited scam-message checks
Try limited URL checks
View research methodology
View project information

Cannot:

Save analysis history
Submit detailed reports
Access private dashboards

REGISTERED USER

Can:

Analyse suspicious messages
Analyse URLs
View analysis history
Save scam checks
Submit scam reports
Bookmark suspicious items
View personalised dashboard
Ask AI safety assistant questions
Delete own history
Manage account

RESEARCHER / ANALYST

Optional advanced role.

Can:

View anonymised aggregated fraud-report data
Export approved aggregated datasets
Compare model performance
View fraud trends

Must never see private identifiable user information.

ADMIN

Can:

Manage users
Review submitted scam reports
Approve/reject reports for aggregated statistics
Manage scam categories
View system analytics
Manage datasets
Manage ML model versions
View audit logs
Moderate unsafe or abusive submissions
Manage public fraud statistics

==================================================
3. MAIN WEBSITE STRUCTURE
==================================================

Create these pages:

/

Homepage

/analyse

Scam Message Analyzer

/url-checker

Suspicious URL Checker

/dashboard

UK Fraud Intelligence Dashboard

/report

Report a Scam

/history

User Analysis History

/saved

Saved Analyses

/assistant

AI Safety Assistant

/research

Research & Methodology

/model-performance

Machine Learning Model Evaluation

/about

About Project

/login

Login

/register

Register

/profile

User Profile

/admin

Admin Dashboard

/admin/reports

Scam Report Moderation

/admin/models

Model Management

/admin/analytics

Platform Analytics

==================================================
4. HOMEPAGE
==================================================

Create a premium modern cybersecurity / AI visual identity.

Headline:

Detect. Understand. Avoid Fraud.

Subheading:

AI-powered fraud and scam intelligence designed to help users identify potentially suspicious digital activity.

Primary CTA:

Analyse a Suspicious Message

Secondary CTA:

Check a URL

Homepage sections:

Hero

Live fraud intelligence preview

How It Works

Scam Message Detection

URL Risk Analysis

UK Fraud Dashboard

AI Safety Assistant

Why This Project Matters

Responsible AI

Research & Methodology

Final CTA

Footer

Do not make the website look like a generic SaaS template.

Use:

Clean white / dark navy
Professional cybersecurity feel
Subtle gradients
Data visualisation
Large typography
Cards
Risk indicators
Charts
Minimal animation

==================================================
5. SCAM MESSAGE ANALYZER
==================================================

The main feature.

User pastes:

SMS
Email
WhatsApp message
Social media message
Online marketplace message
Investment message
Banking message
Delivery message

Example input:

“Your account has been suspended. Verify your identity immediately using the link below.”

Frontend sends:

POST /api/v1/analyse/message

Request:

{
    "text": "message content"
}

Backend processes:

Input validation

Text cleaning

Feature extraction

TF-IDF transformation

Machine learning prediction

Risk probability

Scam category prediction

Keyword/pattern analysis

Explanation generation

Return structured result.

Example response:

{
    "analysis_id": "uuid",
    "risk_score": 91,
    "risk_level": "VERY_HIGH",
    "prediction": "potential_scam",
    "category": "bank_impersonation",
    "confidence": 0.91,
    "signals": [
        "Urgent language detected",
        "Account verification request",
        "Suspicious financial wording"
    ],
    "recommendations": [
        "Do not click unknown links",
        "Contact the organisation through its official website",
        "Do not provide passwords or verification codes"
    ]
}

Frontend result page must show:

Risk percentage

Risk level

Possible scam category

Detected indicators

Explanation

Recommended next steps

Disclaimer

Save Analysis button

Report Scam button

==================================================
6. RISK LEVEL LOGIC
==================================================

Create configurable thresholds.

0–30

LOW RISK

31–60

MEDIUM RISK

61–80

HIGH RISK

81–100

VERY HIGH RISK

Do not hard-code thresholds throughout the application.

Create a central configuration.

==================================================
7. SCAM CATEGORIES
==================================================

Support categories such as:

Phishing

Bank Impersonation

Delivery Scam

Investment Scam

Online Shopping Scam

Employment Scam

Government Impersonation

Tech Support Scam

Account Verification Scam

Romance Scam

Advance Fee Scam

Cryptocurrency Scam

Unknown / Other

Store scam categories in a database table so admins can add or modify them.

==================================================
8. URL CHECKER
==================================================

Route:

/url-checker

API:

POST /api/v1/analyse/url

User submits a URL.

Do NOT automatically visit dangerous URLs during the MVP.

Analyse URL structure only.

Extract features such as:

URL length

HTTPS usage

Number of subdomains

Number of dots

Special characters

Hyphens

Suspicious keywords

IP-address based URLs

URL shortening

Encoded characters

Domain-like impersonation patterns

Excessive query parameters

Potential brand impersonation patterns

Return:

risk_score

risk_level

signals

explanation

recommendations

Example:

{
    "risk_score": 78,
    "risk_level": "HIGH",
    "signals": [
        "Unusually long domain",
        "Security-related keywords",
        "Multiple subdomains"
    ]
}

Add a clear disclaimer:

“This tool analyses URL characteristics and does not guarantee whether a website is safe.”

==================================================
9. UK FRAUD INTELLIGENCE DASHBOARD
==================================================

Create an interactive analytics dashboard.

Show:

Total reports

Reports over time

Fraud categories

Estimated reported losses

Fraud by region

Top scam categories

Monthly trends

Yearly trends

Most frequently reported scam types

Use:

Line chart

Bar chart

Donut chart

Area chart

UK map if appropriate

Do not fabricate live government data.

Create a data-source layer.

Support:

Official public datasets

CSV import

Admin dataset upload

Future API integration

Every statistic must contain:

source_name

source_url

dataset_date

last_updated

==================================================
10. REPORT A SCAM
==================================================

Registered users can submit an anonymous or account-linked report.

Fields:

scam_type

description

message_text

suspicious_url

amount_lost

currency

region

incident_date

contact_method

optional screenshot metadata

Do not request unnecessary sensitive information.

Never request:

Passwords

Bank PIN

Card security code

Authentication codes

Full bank account credentials

Allow anonymous public reporting where appropriate.

Reports must enter:

PENDING_REVIEW

Admin reviews them.

Possible statuses:

PENDING
APPROVED
REJECTED
DUPLICATE

Only approved anonymised reports may contribute to public statistics.

==================================================
11. AI SAFETY ASSISTANT
==================================================

Create an AI assistant focused only on fraud-awareness and safe next steps.

Examples:

“I received a parcel text asking me to pay £1.99.”

“Someone claiming to be my bank asked for my verification code.”

“An investment account promises guaranteed returns.”

Assistant must:

Explain suspicious indicators

Recommend safe verification methods

Recommend official reporting routes where appropriate

Never contact scammers

Never generate phishing content

Never provide fraud techniques

Never provide methods to bypass fraud detection

Never instruct users to investigate dangerous systems

Do not allow financial-transfer instructions.

==================================================
12. MACHINE LEARNING PIPELINE
==================================================

Create an ML folder.

Example:

backend/
    ml/
        datasets/
        preprocessing/
        models/
        training/
        evaluation/
        inference/
        explainability/

Initial scam-message classifier:

TF-IDF

Compare:

Logistic Regression

Multinomial Naive Bayes

Random Forest

Evaluate using:

Accuracy

Precision

Recall

F1-score

Confusion Matrix

ROC-AUC if suitable

Because scam detection may involve imbalanced classes, focus strongly on:

Precision
Recall
F1

Do not select the final model using accuracy alone.

Save trained model with:

joblib

Example:

models/
    scam_classifier_v1.joblib
    tfidf_vectorizer_v1.joblib

Create model metadata:

model_name

version

training_date

dataset

metrics

threshold

status

==================================================
13. EXPLAINABLE AI
==================================================

Users should understand why a message received a risk score.

Implement explainability.

Initial MVP explanation:

Keyword indicators

Suspicious language patterns

Urgency indicators

Financial request indicators

Credential request indicators

Link indicators

Later upgrade:

SHAP

Feature importance

Do not expose internal model information that would materially help attackers bypass the detector.

==================================================
14. DATABASE SCHEMA
==================================================

Create proper PostgreSQL migrations.

TABLE: profiles

id UUID PK

auth_user_id UUID UNIQUE

full_name

role

country

created_at

updated_at

TABLE: message_analyses

id UUID PK

user_id UUID FK profiles.id NULLABLE

raw_text

prediction

risk_score

risk_level

category_id UUID FK scam_categories.id

confidence

model_version_id UUID FK model_versions.id

created_at

TABLE: url_analyses

id UUID PK

user_id UUID FK profiles.id NULLABLE

url

risk_score

risk_level

prediction

model_version_id

created_at

TABLE: analysis_signals

id UUID PK

message_analysis_id UUID NULLABLE

url_analysis_id UUID NULLABLE

signal_type

signal_description

signal_weight

TABLE: scam_categories

id UUID PK

name

slug

description

active

TABLE: scam_reports

id UUID PK

user_id UUID FK profiles.id NULLABLE

category_id UUID FK scam_categories.id

description

message_text

url

amount_lost

currency

region

incident_date

contact_method

status

created_at

reviewed_at

reviewed_by UUID FK profiles.id

TABLE: saved_analyses

id UUID PK

user_id UUID FK profiles.id

message_analysis_id UUID NULLABLE

url_analysis_id UUID NULLABLE

created_at

TABLE: fraud_statistics

id UUID PK

category_id UUID FK scam_categories.id

region

period_start

period_end

report_count

loss_amount

source_id UUID FK data_sources.id

TABLE: data_sources

id UUID PK

name

source_url

dataset_name

published_date

last_updated

TABLE: model_versions

id UUID PK

name

version

algorithm

training_dataset

accuracy

precision

recall

f1_score

roc_auc

active

created_at

TABLE: audit_logs

id UUID PK

user_id

action

entity_type

entity_id

metadata JSONB

created_at

==================================================
15. DATABASE RELATIONSHIPS
==================================================

profiles
1 → many message_analyses

profiles
1 → many url_analyses

profiles
1 → many scam_reports

profiles
1 → many saved_analyses

scam_categories
1 → many message_analyses

scam_categories
1 → many scam_reports

scam_categories
1 → many fraud_statistics

model_versions
1 → many message_analyses

model_versions
1 → many url_analyses

message_analyses
1 → many analysis_signals

url_analyses
1 → many analysis_signals

data_sources
1 → many fraud_statistics

Admin profile
1 → many reviewed scam_reports

Create foreign-key constraints.

Use cascading deletes carefully.

Do NOT delete public statistical data when a user deletes their personal account.

Anonymise appropriate records instead.

==================================================
16. BACKEND ARCHITECTURE
==================================================

Use layered architecture.

backend/

app/
    main.py

    api/
        v1/
            auth.py
            message_analysis.py
            url_analysis.py
            reports.py
            dashboard.py
            assistant.py
            admin.py

    core/
        config.py
        security.py
        logging.py

    models/

    schemas/

    repositories/

    services/

    ml/

    database/

    middleware/

    tests/

Controller/API layer

↓

Service layer

↓

Repository layer

↓

Database

For AI analysis:

API

↓

AnalysisService

↓

PreprocessingService

↓

MLInferenceService

↓

ExplanationService

↓

DatabaseRepository

↓

API Response

Do not put business logic directly inside API route files.

==================================================
17. BACKEND REQUEST FLOW
==================================================

Example message analysis flow:

User types message

↓

Next.js validates basic form

↓

POST /api/v1/analyse/message

↓

FastAPI validates Pydantic schema

↓

Rate-limit check

↓

Text sanitisation

↓

ML preprocessing

↓

TF-IDF transformation

↓

Model inference

↓

Probability generated

↓

Risk level calculated

↓

Explanation signals generated

↓

Result stored in PostgreSQL

↓

Structured JSON returned

↓

Next.js displays results

↓

User may save or report

==================================================
18. AUTHENTICATION CONNECTION
==================================================

Use Supabase Auth.

Frontend:

User login

↓

Supabase returns authenticated session

↓

JWT included when calling protected FastAPI endpoints

↓

FastAPI verifies Supabase JWT

↓

Extract user ID

↓

Load profile

↓

Perform role-based authorisation

Roles:

user

researcher

admin

Never trust frontend role values.

Backend always verifies permissions.

==================================================
19. FRONTEND/BACKEND CONNECTION
==================================================

Create typed API service.

frontend/

lib/
    api/
        client.ts
        message.ts
        url.ts
        reports.ts
        dashboard.ts
        admin.ts

Use environment variable:

NEXT_PUBLIC_API_URL

Example:

NEXT_PUBLIC_API_URL=https://api.example.com

FastAPI:

CORS should only allow approved frontend origins.

Do not use * in production.

==================================================
20. USER DASHBOARD
==================================================

Show:

Total analyses

High-risk analyses

Saved checks

Submitted reports

Recent activity

Risk distribution

Recent scam categories

User can:

View details

Delete analysis

Save analysis

Report analysis

==================================================
21. ADMIN DASHBOARD
==================================================

Admin dashboard should show:

Registered users

Analyses today

High-risk analyses

Pending scam reports

Approved reports

Model usage

System errors

Fraud categories

Dataset status

Model version

Admin actions:

Review reports

Approve/reject reports

Manage scam categories

Activate ML model version

Deactivate old models

Upload public dataset

View audit history

==================================================
22. RESEARCH PAGE
==================================================

This page is very important for university interviews and MSc portfolio presentation.

Include:

Project Background

Problem Statement

Research Question

Objectives

Dataset Description

Data Preprocessing

Feature Engineering

Algorithms Compared

Model Evaluation

Ethical Considerations

Bias

Privacy

Limitations

Future Improvements

Research Question example:

“How effectively can machine learning and natural language processing techniques identify potentially fraudulent digital messages?”

==================================================
23. MODEL PERFORMANCE PAGE
==================================================

Show actual model results only.

Example table:

Model

Accuracy

Precision

Recall

F1

Do not use fake results.

Read metrics from stored model metadata.

Display:

Confusion matrix

Model comparison graph

Training dataset details

Current active model

Model version

==================================================
24. RESPONSIBLE AI
==================================================

Create a dedicated section explaining:

False positives

False negatives

Algorithmic bias

Data quality

Privacy

Human judgement

Model limitations

Explain:

The system does not make legal determinations.

The system does not accuse individuals or organisations of criminal activity.

Predictions are probabilistic risk assessments.

==================================================
25. SECURITY
==================================================

Implement:

Input validation

Rate limiting

JWT verification

Role-based access

Secure environment variables

SQL parameterisation

CORS restrictions

CSRF protection where relevant

XSS prevention

Logging

No secrets in GitHub

API request size limits

Do not store passwords manually.

Use Supabase Auth.

Sanitise submitted text.

Do not automatically browse suspicious websites.

==================================================
26. PRIVACY
==================================================

Minimise data collection.

Allow users to delete their analysis history.

Never log:

Passwords

Authentication tokens

Full payment credentials

Private bank credentials

Sensitive authentication codes

Provide:

Privacy notice

Data retention policy

Delete-account workflow

==================================================
27. API ENDPOINTS
==================================================

Create REST endpoints.

Public:

GET /api/v1/health

GET /api/v1/categories

GET /api/v1/dashboard/public

POST /api/v1/analyse/message

POST /api/v1/analyse/url

Protected:

GET /api/v1/me

GET /api/v1/history

GET /api/v1/history/{id}

DELETE /api/v1/history/{id}

POST /api/v1/saved

GET /api/v1/saved

DELETE /api/v1/saved/{id}

POST /api/v1/reports

GET /api/v1/reports/my

Assistant:

POST /api/v1/assistant/chat

Admin:

GET /api/v1/admin/reports

PATCH /api/v1/admin/reports/{id}

GET /api/v1/admin/users

GET /api/v1/admin/models

POST /api/v1/admin/models/activate/{id}

GET /api/v1/admin/audit

POST /api/v1/admin/datasets

==================================================
28. ANALYTICS PIPELINE
==================================================

Design:

Official/public fraud dataset

↓

Data ingestion

↓

Validation

↓

Cleaning

↓

Normalisation

↓

PostgreSQL fraud_statistics

↓

FastAPI analytics API

↓

Next.js dashboard

Create scheduled ingestion architecture that can later run daily/weekly/monthly.

Do not assume a live API exists.

Support CSV upload first.

==================================================
29. FRONTEND COMPONENTS
==================================================

Create reusable components:

Navbar

Footer

Hero

RiskGauge

RiskBadge

AnalysisForm

URLForm

SignalCard

RecommendationCard

FraudTrendChart

CategoryChart

StatCard

DashboardSidebar

AnalysisHistoryTable

ScamReportForm

ModelMetricCard

ResearchSection

AdminTable

LoadingSkeleton

EmptyState

ErrorState

ConfirmationDialog

==================================================
30. DESIGN SYSTEM
==================================================

Professional design.

Avoid childish cybersecurity styling.

Use:

Large whitespace

Readable typography

Strong hierarchy

Responsive cards

Subtle shadows

Minimal gradients

Accessible contrast

Risk status colours should come from design tokens.

Do not hard-code risk colours throughout individual components.

Create semantic tokens:

risk-low

risk-medium

risk-high

risk-critical

==================================================
31. TESTING
==================================================

Frontend:

Vitest

React Testing Library

Playwright for critical flows

Backend:

pytest

Test:

Authentication

Permissions

Analysis API

Model inference

Risk thresholds

Report submission

Admin moderation

Database relationships

Invalid input

Rate limiting

Create ML evaluation tests.

==================================================
32. ERROR HANDLING
==================================================

Never expose Python stack traces in production.

Return structured errors:

{
    "error": {
        "code": "INVALID_MESSAGE",
        "message": "Please provide a valid message for analysis."
    }
}

Frontend must show human-friendly errors.

==================================================
33. LOGGING
==================================================

Use structured backend logging.

Include:

request_id

endpoint

response_status

processing_time

model_version

Do not log private message content by default.

==================================================
34. PERFORMANCE
==================================================

Use:

Async FastAPI endpoints where appropriate

Database indexes

Pagination

Lazy loading

API caching for dashboard statistics

Server-side fetching where appropriate in Next.js

==================================================
35. FOLDER STRUCTURE
==================================================

Root:

fraud-intelligence-platform/

frontend/

backend/

ml-notebooks/

datasets/

docs/

database/

README.md

docker-compose.yml

.env.example

Frontend:

app/

components/

features/

hooks/

lib/

types/

services/

Backend:

app/

api/

services/

repositories/

models/

schemas/

ml/

core/

database/

tests/

==================================================
36. README
==================================================

Create an excellent GitHub README.

Include:

Project overview

Problem

Features

Architecture

Technology stack

Installation

Environment variables

Database setup

ML model

API

Screenshots

Research methodology

Security

Limitations

Future work

Author

==================================================
37. ARCHITECTURE DIAGRAM
==================================================

Document this architecture:

USER

↓

NEXT.JS FRONTEND

↓

FASTAPI REST API

↓

SERVICE LAYER

↓

-------------------------------
|                             |
ML INFERENCE             POSTGRESQL
|                             |
SCIKIT-LEARN              SUPABASE
-------------------------------

↓

ANALYSIS RESPONSE

Also:

PUBLIC DATASETS

↓

DATA PIPELINE

↓

FRAUD STATISTICS

↓

ANALYTICS API

↓

DASHBOARD

==================================================
38. FUTURE ADVANCED FEATURES
==================================================

Do NOT build all of these in MVP.

Design architecture so these can be added later:

BERT scam-message classification

Explainable AI using SHAP

Multilingual scam detection

Tamil scam detection

Sinhala scam detection

Email-header analysis

Image scam detection

QR-code risk analysis

Brand impersonation detection

Real-time fraud trend monitoring

Fraud clustering

Anomaly detection

Graph-based fraud relationships

Browser extension

Mobile app

Organisation dashboard

==================================================
39. MVP PRIORITY
==================================================

Build in this exact order:

PHASE 1

Next.js UI

Authentication

Database

PHASE 2

Scam Message Analyzer

FastAPI

Initial ML classifier

Risk scoring

PHASE 3

Analysis History

Save feature

Report Scam

PHASE 4

UK Fraud Dashboard

Public datasets

Charts

PHASE 5

URL Checker

PHASE 6

Research page

Model performance page

PHASE 7

Admin panel

PHASE 8

AI Safety Assistant

==================================================
40. INTERVIEW DEMO FLOW
==================================================

Design the application so the developer can demonstrate it in approximately 3–5 minutes.

Demo:

1.

Open homepage.

Explain:

“This project addresses digital fraud and scam awareness using Data Science and Artificial Intelligence.”

2.

Open Scam Analyzer.

Paste a suspicious message.

3.

System returns:

Risk score
Category
Indicators
Recommendations

4.

Open UK Fraud Dashboard.

Show data visualisations.

5.

Open Model Performance.

Explain model comparison.

6.

Open Research page.

Explain methodology.

7.

Explain architecture:

“Next.js and TypeScript provide the frontend, FastAPI and Python provide the backend, PostgreSQL stores application data, and machine-learning models analyse suspicious text.”

==================================================
41. UNIVERSITY INTERVIEW EXPLANATION
==================================================

The project should support this explanation:

“My academic background is in Software Engineering, and I am progressing towards Data Science and Artificial Intelligence.

I therefore developed an AI-powered fraud and scam intelligence platform.

The system uses machine learning and natural language processing to analyse suspicious digital messages, identify scam indicators, calculate a risk score and provide explainable safety recommendations.

I developed the frontend using TypeScript and Next.js, while Python and FastAPI handle backend services and machine-learning inference.

PostgreSQL is used for structured data storage.

The project also includes fraud analytics, responsible AI considerations, model evaluation and a research methodology section.

This project helped me combine Software Engineering with Data Science, Machine Learning and AI, which directly relates to my postgraduate studies.”

==================================================
42. CODING QUALITY REQUIREMENTS
==================================================

Use:

Clean architecture

SOLID principles where appropriate

Reusable components

Type-safe TypeScript

Pydantic schemas

Dependency injection where useful

Repository pattern

Service layer

Proper error handling

Database migrations

Environment variables

Docstrings for complex logic

API documentation

No giant files

No duplicated business logic

No fake implementation

No placeholder ML results

==================================================
43. IMPORTANT DEVELOPMENT RULE
==================================================

Build a real working application.

Do not create only static UI screens.

The following must genuinely work:

Registration

Login

Authentication

Message analysis

Machine-learning inference

Risk scoring

Database persistence

History

Saving analyses

Scam reporting

Dashboard analytics

Admin moderation

Model metrics

API communication

==================================================
44. FINAL DELIVERABLE
==================================================

Deliver:

Working Next.js frontend

Working FastAPI backend

PostgreSQL/Supabase schema

Authentication

Machine-learning model

Training script

Evaluation script

API documentation

Responsive frontend

Admin panel

Research page

Model-performance page

Tests

Docker support

.env.example

Database migrations

Professional README

Deployment instructions

Architecture documentation

Do not stop after creating the frontend.

Implement the complete frontend → backend → ML → database connection.