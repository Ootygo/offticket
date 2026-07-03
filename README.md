# OFFTICKET

Marketplace that matches empty return-trip commercial vehicles (trucks,
mini-trucks, pickups, cabs) with customers who need to move goods or
passengers at discounted prices. Launch corridor: Coimbatore ↔ Ooty, India.

## Tech stack

| Layer     | Choice |
|-----------|--------|
| Frontend  | React (Vite) + Tailwind CSS + React Router v6 |
| Backend   | AWS API Gateway (HTTP API) + Lambda (Node.js 20) |
| Database  | AWS DynamoDB |
| Auth      | AWS Cognito — separate user pools for vehicle owners and customers |
| Storage   | AWS S3 (vehicle photos, via presigned upload URLs) |
| Hosting   | AWS Amplify (frontend) + API Gateway (backend, deployed with SAM) |

## Project structure

```
offticket/
  src/                    # frontend (Vite + React)
    pages/                # Home, Search, Booking, dashboards, About, Login
    components/           # shared UI (Navbar, Footer, cards, buttons)
    context/AuthContext.jsx
    lib/api.js            # API client — mock data until VITE_API_BASE_URL is set
    lib/cognito.js         # Cognito wrapper — mock login until pool env vars are set
    data/mockData.js       # seed data matching the DynamoDB schema
  backend/                # AWS SAM app
    template.yaml         # API Gateway, Lambda, DynamoDB, Cognito, S3
    src/handlers/          # one file per Lambda function
```

The frontend is built to run standalone against mock data first — every
page works with no AWS account at all. Setting the env vars below switches
each part (API, then auth) over to the real backend without touching any
page code, since pages only ever call through `src/lib/api.js` and
`AuthContext`.

## Local development (frontend only, mock data)

```bash
npm install
npm run dev
```

Opens on `http://localhost:5173`. No `.env` file needed — `src/lib/api.js`
and `src/lib/cognito.js` both fall back to mock implementations when their
respective env vars are absent.

## Deploying the backend

Prerequisites: [AWS CLI](https://docs.aws.amazon.com/cli/) configured with
credentials (`aws sts get-caller-identity` should return your account).

You can deploy either with the **AWS SAM CLI** (if installed) or with
**plain AWS CLI** (no extra tooling — this is what was actually used for
the reference deployment below, since SAM CLI wasn't on the box).

**Option A — SAM CLI:**
```bash
cd backend
npm install
sam build
sam deploy --guided
```
On first run it asks for stack name, region, and the `AllowedOrigin` /
`Stage` parameters (see below).

**Option B — plain AWS CLI:**
```bash
cd backend
npm install

# One-time: an S3 bucket to hold packaged Lambda code (not the app's own
# vehicle-photos bucket — the stack creates that itself)
aws s3api create-bucket --bucket offticket-sam-artifacts-<account-id>-ap-south-1 \
  --region ap-south-1 --create-bucket-configuration LocationConstraint=ap-south-1

aws cloudformation package \
  --template-file template.yaml \
  --s3-bucket offticket-sam-artifacts-<account-id>-ap-south-1 \
  --output-template-file packaged.yaml \
  --region ap-south-1

aws cloudformation deploy \
  --template-file packaged.yaml \
  --stack-name offticket-backend-dev \
  --region ap-south-1 \
  --capabilities CAPABILITY_IAM CAPABILITY_AUTO_EXPAND \
  --parameter-overrides AllowedOrigin="*" Stage=dev
```
`CAPABILITY_AUTO_EXPAND` is required because the template uses the SAM
transform. Set `AllowedOrigin` to your real frontend URL once it's live
instead of `*`.

Either way, this provisions:
- 4 DynamoDB tables (`Users`, `Vehicles`, `Listings`, `Bookings`) with the
  GSIs needed for route search, "my listings", and "my bookings" queries
- 9 Lambda functions behind an HTTP API (see table below)
- 2 Cognito User Pools (`offticket-customers-*`, `offticket-owners-*`) with
  email-based sign-in — Cognito sends verification codes via its own
  default email sender, no SNS/SES setup needed
- An S3 bucket for vehicle photos, with presigned-upload support

After deploy, copy the stack `Outputs` (`ApiUrl`, `CustomerUserPoolId`,
`CustomerUserPoolClientId`, `OwnerUserPoolId`, `OwnerUserPoolClientId`) —
via `aws cloudformation describe-stacks --stack-name offticket-backend-dev
--query "Stacks[0].Outputs"` — into the frontend's `.env` (copy
`.env.example` to `.env` first):

```bash
VITE_API_BASE_URL=<ApiUrl output>
VITE_CUSTOMER_USER_POOL_ID=<CustomerUserPoolId output>
VITE_CUSTOMER_USER_POOL_CLIENT_ID=<CustomerUserPoolClientId output>
VITE_OWNER_USER_POOL_ID=<OwnerUserPoolId output>
VITE_OWNER_USER_POOL_CLIENT_ID=<OwnerUserPoolClientId output>
```

Restart `npm run dev` after editing `.env` — the app now talks to the real
API and Cognito pools instead of mock data.

### API routes

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | `/listings?from=&to=&date=&type=` | none | search available listings |
| GET | `/listings/{id}` | none | fetch one listing |
| POST | `/listings` | owner pool | create a listing |
| POST | `/bookings` | customer pool | create a booking request |
| PUT | `/bookings/{id}/confirm` | owner pool | owner confirms a booking |
| GET | `/users/{id}/bookings[?role=owner]` | none | customer's bookings, or owner's incoming requests |
| GET | `/users/{id}/listings` | none | an owner's listings |
| GET | `/stats` | none | homepage "trips completed" counter |
| POST | `/uploads/presign` | owner pool | get a presigned S3 URL for a vehicle photo |

## Deploying the frontend (AWS Amplify)

1. Push this repo to GitHub/GitLab/CodeCommit.
2. In the Amplify console, **New app → Host web app**, connect the repo.
3. Build settings (Amplify usually detects Vite automatically):
   ```yaml
   version: 1
   frontend:
     phases:
       preBuild:
         commands:
           - npm install
       build:
         commands:
           - npm run build
     artifacts:
       baseDirectory: dist
       files:
         - '**/*'
     cache:
       paths:
         - node_modules/**/*
   ```
4. Add the same `VITE_*` variables from `.env` under **App settings →
   Environment variables**.
5. Once deployed, update the backend's `AllowedOrigin` parameter to the
   Amplify domain and re-run `sam deploy` so CORS allows it.

## Known limitations / next steps

- **Payments**: the booking confirmation screen simulates a UPI payment.
  Wire a real Razorpay/PhonePe order + webhook (updating `paymentStatus` in
  the Bookings table) before going live.
- **KYC / vehicle verification**: `verified` on Vehicles and `kycStatus` on
  Users exist in the schema but there's no admin review flow yet.
- **`/stats`** does a full table scan over Bookings — fine at MVP volume,
  but swap for a DynamoDB counter (or a scheduled aggregation) before scale.
- **e-pass / heavy-vehicle rules** are shown as informational banners
  linking to `epass.tnega.org` — there's no automated e-pass status check.
