import '@testing-library/jest-dom/vitest';

// jsdom defines window.scrollTo but flags it as "not implemented" (noisy stderr).
// Override unconditionally to a no-op.
window.scrollTo = () => {};

// Cart state is persisted to sessionStorage; ensure each test starts with a
// clean slate so rehydration never leaks state across cases.
beforeEach(() => {
  sessionStorage.clear();
});
