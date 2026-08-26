// Paging bounds for GET /api/test-emails, shared by the route handler and
// its OpenAPI registration (which must not import route.ts itself).
export const DEFAULT_TEST_EMAILS_PAGE_SIZE = 50;
export const MAX_TEST_EMAILS_PAGE_SIZE = 200;
