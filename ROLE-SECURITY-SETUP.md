# Ebenezer Day Star Academy — Role & Security Setup

## Roles
- `admin`: full school-management access.
- `teacher`: assigned classes; can enter/update results and attendance for assigned students.
- `parent`: sees only children linked to `parentUid`.
- `student`: sees only the student record linked by `studentUid`.

## Firebase setup
1. Enable Firebase Authentication > Sign-in method > Email/Password.
2. Create the first admin account with `cnstech0013@gmail.com` (or create a user profile with role `admin`).
3. Deploy `firestore.rules` in Firebase Console > Firestore Database > Rules.
4. Log in as admin and open `users.html` to create teacher/student accounts.
5. For a teacher account, set `Teacher ID` and `Assigned class IDs` (comma-separated).
6. For a student account, set `Student ID`.
7. Parent registration remains available through `parent-register.html`; match a student's `parentEmail` to the parent's Firebase email.

## Data model
`users/{uid}`: role, name, email, teacherUid/studentUid, assignedClassIds
`students/{id}`: student details, classId, parentUid/parentEmail, optional teacherUid
`results/{id}`: studentId, classId, teacherUid, subject, session, term, CA1, CA2, classWork1, classWork2, assignment1, assignment2, exam, total
`attendance/{id}`: studentId, classId, teacherUid, date, status, remark
`fees/{id}`: studentId, title, amount, status, session, term
`reportCards/{id}`: studentId, session, term, psychomotor, teacherComment, principalComment, etc.
`notifications/{id}`: title, message, audience array, optional classId, active, createdAt

## Important security note
The JavaScript page guards are for user experience only. Firestore Security Rules are the actual access control. Never rely on hidden links, sessionStorage, or HTML restrictions as security.
