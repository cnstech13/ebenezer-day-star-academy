# Firebase Save/Loading Fix

The previous build could start Firestore requests before Firebase Authentication had finished restoring the administrator session. On some devices/networks this made the SweetAlert loading spinner remain visible while the request waited or failed.

## What was fixed

1. Added `admin-guard.js`.
2. All administrator CRUD modules now wait for Firebase Auth before reading/writing Firestore.
3. Firestore calls are protected with a timeout so a network/configuration problem cannot leave the interface waiting forever.
4. Firestore rules were hardened so missing user profiles do not cause rule evaluation errors.
5. Added rules for both `attendance` and the legacy `attendanceRecords` collection.
6. Teacher class assignment checks now handle missing `assignedClassIds` safely.

## Important

Deploy the included `firestore.rules` to Firebase after replacing the old rules.

If a save still fails, the page will now show the actual Firebase error instead of leaving an endless loading spinner.

## Firebase Console

- Authentication → Sign-in method → Email/Password: Enabled
- Firestore Database → Rules: publish the included `firestore.rules`
- Authentication → Settings → Authorized domains: add your deployed website domain
