# Bug Report

## Bug 1: Incorrect Pagination Offset

### Expected Behavior

The API documents pagination using 1-based page numbers.

For example:

GET /tasks?page=1&limit=2

should return the first two tasks.

### Actual Behavior

The original implementation calculated the pagination offset as:

```javascript
const offset = page * limit;