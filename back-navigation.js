// Smart back navigation for portal pages.
export function goBackOr(fallback) {
  const ref = document.referrer || "";
  const sameOrigin = ref.startsWith(window.location.origin);
  if (window.history.length > 1 && sameOrigin) {
    window.history.back();
  } else {
    window.location.href = fallback;
  }
}
