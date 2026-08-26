# Auth Testing Playbook — TUDO MAIS FÁCIL

## Auth flow overview
Two coexisting methods, both produce the same session_token httpOnly cookie:
1. Email/password → POST /api/auth/register or /api/auth/login
2. Google OAuth (Emergent-managed) → POST /api/auth/google {session_id}

Both create/read users in the `users` collection with `user_id` (uuid), email, name, password_hash (nullable), google_id (nullable), plan, plan_expires_at, created_at.

## Admin seed
Seeded on backend startup:
- email=admin@tudomaisfacil.com, password=admin123, plan=pro_annual (unlimited walls)

## Step 1 - Backend curl tests

```bash
API="https://sketch-toolkit-1.preview.emergentagent.com"

# Register
curl -c cookies.txt -X POST "$API/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email":"newuser@x.com","password":"senha1234","name":"New User"}'

# Login
curl -c cookies.txt -X POST "$API/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"newuser@x.com","password":"senha1234"}'

# /me
curl -b cookies.txt "$API/api/auth/me"

# Limits
curl -b cookies.txt "$API/api/limits"

# Walls without auth -> 401
curl "$API/api/walls"

# Create wall (authed)
curl -b cookies.txt -X POST "$API/api/walls" \
  -H "Content-Type: application/json" \
  -d '{"altura_pe_direito":260,"largura_total":350}'

# Logout
curl -b cookies.txt -X POST "$API/api/auth/logout"
```

## Step 2 - Freemium enforcement
- Register a NEW free user
- Create 3 walls (all succeed)
- Attempt 4th wall -> expect HTTP 402 with detail mentioning PRO/assinatura
- Login as admin (pro_annual) and create 4+ walls -> all succeed

## Step 3 - Stripe checkout
```bash
# Get plans (public)
curl "$API/api/payments/plans"

# Create checkout (authed)
curl -b cookies.txt -X POST "$API/api/payments/checkout" \
  -H "Content-Type: application/json" \
  -d '{"lookup_key":"tmf_pro_monthly","origin_url":"'$API'"}'
# returns {checkout_url, session_id}. Do not follow the checkout_url in tests.
```

## Step 4 - Frontend flows
Playwright must:
- Set viewport 390x844 (mobile) and 1440x900 (desktop)
- Verify /login shows [data-testid=login-card] and has btn-google-login + login-form + input-email + input-password + btn-submit-login + link-cadastro
- Verify /cadastro shows register-card + input-name/email/password + btn-submit-register
- Fill register form -> should navigate to `/` and show user-bar with the user name
- Test that logout button clears session and navigates to /login
- /precos accessible without login; when authed shows "SEU PLANO" tag on Starter (free); has btn-subscribe-pro_monthly / btn-subscribe-pro_annual
- After creating 3 walls as free user, the 4th create attempt shows an error toast with "Assinar PRO" action

## User isolation test
- User A creates wall X
- Login as User B
- GET /api/walls/{X} -> 404
- GET /api/walls -> should NOT include X
