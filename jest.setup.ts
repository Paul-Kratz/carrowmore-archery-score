import "@testing-library/jest-dom";
import { TextEncoder, TextDecoder } from "util";
import React from "react";

// Make React available globally for JSX
(global as any).React = React;

// Polyfill for global objects
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as typeof global.TextDecoder;

// Mock fetch API if not available
if (typeof global.Request === "undefined") {
  global.Request = class Request {
    url: string;
    method: string;
    headers: Headers;
    _body: any;

    constructor(input: string | URL, init?: RequestInit) {
      this.url = typeof input === "string" ? input : input.toString();
      this.method = init?.method || "GET";
      this.headers = new Headers(init?.headers);
      this._body = init?.body;
    }

    async json() {
      if (typeof this._body === "string") {
        return JSON.parse(this._body);
      }
      return this._body;
    }

    async text() {
      return this._body as string;
    }
  } as any;
}

if (typeof global.Response === "undefined") {
  global.Response = class Response {
    body: any;
    status: number;
    statusText: string;
    headers: Headers;
    ok: boolean;

    constructor(body?: BodyInit | null, init?: ResponseInit) {
      this.body = body;
      this.status = init?.status || 200;
      this.statusText = init?.statusText || "";
      this.headers = new Headers(init?.headers);
      this.ok = this.status >= 200 && this.status < 300;
    }

    async json() {
      return JSON.parse(this.body as string);
    }

    async text() {
      return this.body as string;
    }
  } as any;
}

if (typeof global.Headers === "undefined") {
  global.Headers = class Headers {
    private headers: Map<string, string>;

    constructor(init?: HeadersInit) {
      this.headers = new Map();
      if (init) {
        if (init instanceof Headers) {
          init.forEach((value, key) => this.set(key, value));
        } else if (Array.isArray(init)) {
          init.forEach(([key, value]) => this.set(key, value));
        } else {
          Object.entries(init).forEach(([key, value]) => this.set(key, value));
        }
      }
    }

    get(name: string): string | null {
      return this.headers.get(name.toLowerCase()) || null;
    }

    set(name: string, value: string): void {
      this.headers.set(name.toLowerCase(), value);
    }

    has(name: string): boolean {
      return this.headers.has(name.toLowerCase());
    }

    delete(name: string): void {
      this.headers.delete(name.toLowerCase());
    }

    forEach(
      callback: (value: string, key: string, parent: Headers) => void,
    ): void {
      this.headers.forEach((value, key) => callback(value, key, this));
    }
  } as any;
}

// Mock NextResponse
jest.mock("next/server", () => ({
  NextResponse: {
    json: (data: any, init?: ResponseInit) => {
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
