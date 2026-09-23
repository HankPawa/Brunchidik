export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export const noEncontrado = (mensaje = "No encontrado") => new ApiError(404, mensaje);
