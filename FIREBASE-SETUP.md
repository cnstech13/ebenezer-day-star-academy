# Ebenezer Day Star Academy — Functional Setup

## What was fixed

- Admin login now uses Firebase Authentication correctly.
- The old `myschool` username is mapped to the configured Firebase admin email.
- Only an administrator account can enter the admin dashboard.
- Parent accounts are rejected from the admin area.
- Unauthenticated visitors are redirected to `admin-login.html`.
- Admin logout now signs out from the same Firebase project/configuration.
- Settings is now protected by the same admin authentication guard.
- Broken links to missing pages were removed/fixed.
- `students.html` was added as a compatibility URL for the existing `student.html` page.
- Broken `main.js` references were replaced.
- Firestore security rules are included in `firestore.rules`.
- JavaScript syntax was checked for every `.js` file in the project.

## Firebase checklist

In the Firebase project used by this website:

1. Open **Authentication → Sign-in method**.
2. Enable **Email/Password**.
3. Make sure the administrator Firebase Authentication account exists.
4. Add the production domain to **Authentication → Settings → Authorized domains**.
5. Open **Firestore Database → Rules** and publish the contents of `firestore.rules`.

## Administrator

The project has one configured first administrator account. The password is intentionally NOT stored in the website code.

To create/change the administrator password, use Firebase Authentication rather than putting a password in JavaScript.

Additional administrators can be created by giving their Firebase user document:

`users/{UID}`

the field:

`role: "admin"`

The included client and Firestore rules support this role model.

## Parent portal

Parent registration creates:

`users/{parentUID}`

with:

`role: "parent"`

It then links matching student records using `parentUid`.

For the automatic matching to work, the student's `parentEmail` field must exactly match the email the parent uses during registration.

## Important Firestore collection names

The application expects these collections where applicable:

- `users`
- `students`
- `teachers`
- `classes`
- `subjects`
- `results`
- `attendance`
- `fees`
- `reportCards`
- `settings`
- `notifications`

## Deployment

This is a static Firebase web application and can be deployed to Vercel or another static host.

After deployment, add the exact deployed hostname to Firebase Authentication's authorized domains.

## Security note

The Firebase web API key in `firebase-config.js` is a client-side identifier and is not a password. The important protection is Firebase Authentication plus Firestore Security Rules.

Do not put Firebase service-account credentials, private keys, or administrator passwords into this website.
