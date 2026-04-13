import "@testing-library/jest-dom";
import { TextEncoder, TextDecoder } from "util";
import React from "react";

// Make React available globally for JSX
const globalWithReact = globalThis as typeof globalThis & {
  React: typeof React;
};
globalWithReact.React = React;

// Polyfill for global objects
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as typeof global.TextDecoder;

class HeadersMock {
  private readonly headerMap = new Map<string, string>();

  constructor(init?: HeadersInit) {
    if (init) {
      if (init instanceof HeadersMock) {
        init.forEach((value, key) => this.set(key, value));
      } else if (Array.isArray(init)) {
        init.forEach(([key, value]) => this.set(key, value));
      } else {
        Object.entries(init).forEach(([key, value]) => this.set(key, value));
      }
    }
  }

  get(name: string): string | null {
    return this.headerMap.get(name.toLowerCase()) ?? null;
  }

  set(name: string, value: string): void {
    this.headerMap.set(name.toLowerCase(), value);
  }

  has(name: string): boolean {
    return this.headerMap.has(name.toLowerCase());
  }

  delete(name: string): void {
    this.headerMap.delete(name.toLowerCase());
  }

  forEach(
    callback: (value: string, key: string, parent: HeadersMock) => void,
  ): void {
    this.headerMap.forEach((value, key) => callback(value, key, this));
  }
}

class RequestMock {
  readonly url: string;
  readonly method: string;
  readonly headers: HeadersMock;
  private readonly bodyContent: BodyInit | null | undefined;

  constructor(input: string | URL, init?: RequestInit) {
    this.url = typeof input === "string" ? input : input.toString();
    this.method = init?.method || "GET";
    this.headers = new HeadersMock(init?.headers);
    this.bodyContent = init?.body;
  }

  async json(): Promise<unknown> {
    if (typeof this.bodyContent === "string") {
      return JSON.parse(this.bodyContent);
    }
    return this.bodyContent;
  }

  async text(): Promise<string> {
    return typeof this.bodyContent === "string" ? this.bodyContent : "";
  }
}

class ResponseMock {
  readonly body: BodyInit | null | undefined;
  readonly status: number;
  readonly statusText: string;
  readonly headers: HeadersMock;
  readonly ok: boolean;

  constructor(body?: BodyInit | null, init?: ResponseInit) {
    this.body = body;
    this.status = init?.status || 200;
    this.statusText = init?.statusText || "";
    this.headers = new HeadersMock(init?.headers);
    this.ok = this.status >= 200 && this.status < 300;
  }

  async json(): Promise<unknown> {
    return JSON.parse(typeof this.body === "string" ? this.body : "null");
  }

  async text(): Promise<string> {
    return typeof this.body === "string" ? this.body : "";
  }
}

// Mock fetch API if not available
if (typeof global.Request === "undefined") {
  global.Request = RequestMock as unknown as typeof Request;
}

if (typeof global.Response === "undefined") {
  global.Response = ResponseMock as unknown as typeof Response;
}

if (typeof global.Headers === "undefined") {
  global.Headers = HeadersMock as unknown as typeof Headers;
}

// Mock NextResponse
jest.mock("next/server", () => ({
  NextResponse: {
    json: (data: unknown, init?: ResponseInit) => {
      const response = new Response(JSON.stringify(data), {
        ...init,
        headers: {
          "content-type": "application/json",
          ...init?.headers,
        },
      });
      return response;
    },
  },
}));

// Mock mongoose to avoid ES module issues
jest.mock("mongoose", () => ({
  __esModule: true,
  default: {
    startSession: jest.fn(),
    Types: {
      ObjectId: jest.fn((id: unknown) => id),
    },
  },
  Types: {
    ObjectId: jest.fn((id: unknown) => id),
  },
}));
