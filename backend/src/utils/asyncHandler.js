// asyncHandler — wraps an async controller function so that any rejected
// promise (a thrown error inside an `await`) is automatically passed to
// next(err) instead of crashing the process or requiring a try/catch block
// in every single controller.
//
// Usage:
//   export const login = asyncHandler(async (req, res) => { ... });

export function asyncHandler(fn) {
  return function wrapped(req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
