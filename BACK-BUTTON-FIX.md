# Back Button Fix

Portal back buttons now use smart history navigation.

- If the user came from another page on the same site, the button uses browser history to return to the actual previous page.
- If the page was opened directly, it falls back to the relevant dashboard.
- This works with Android browser back/history and avoids repeatedly forcing a fixed dashboard URL.
