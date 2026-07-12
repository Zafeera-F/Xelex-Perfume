// ApiResponse — the standard success response shape.
// -----------------------------------------------------------------------------
// Every controller returns this instead of hand-building { success, message,
// data } inline, e.g.:
//   res.status(200).json(new ApiResponse("Logged in successfully", { user }));

export class ApiResponse {
  constructor(message, data = null) {
    this.success = true;
    this.message = message;
    this.data = data;
  }
}
