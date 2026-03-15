/**
 * Base Error Class
 * 
 * All custom errors extend this base class to ensure consistent
 * error handling throughout the application.
 * Follows RFC 7807 – Problem Details for HTTP APIs
 */

export class BaseError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly timestamp: string;
  public readonly type: string;
  public readonly title: string;

  constructor(
    message: string,
    statusCode: number = 500,
    isOperational: boolean = true,
    type?: string,
    title?: string
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.timestamp = new Date().toISOString();
    
    // RFC 7807 fields
    // this.type = type || `https://api.example.com/problems/${this.constructor.name.toLowerCase()}`;
    this.type = type || this.constructor.name.toLowerCase();
    this.title = title || this.constructor.name.replace(/([A-Z])/g, ' $1').trim();

    // Maintains proper stack trace for where our error was thrown
    Error.captureStackTrace(this, this.constructor);
  }
}

