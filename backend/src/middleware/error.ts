import type { ErrorRequestHandler } from 'express';

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  console.error(err);
  const status = Number(err?.statusCode) || 500;
  res.status(status).json({ message: status === 500 ? 'Internal server error.' : err.message });
};
