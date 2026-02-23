// Proxy API requests to backend
import { NextRequest, NextResponse } from 'next/server';

const API_BACKEND_URL = process.env.API_BACKEND_URL || 'http://localhost:4000';

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return proxyRequest(request, params.path, 'GET');
}

export async function POST(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return proxyRequest(request, params.path, 'POST');
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return proxyRequest(request, params.path, 'PUT');
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return proxyRequest(request, params.path, 'DELETE');
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return proxyRequest(request, params.path, 'PATCH');
}

async function proxyRequest(
  request: NextRequest,
  pathSegments: string[],
  method: string
) {
  const path = pathSegments.join('/');
  // Forward query string parameters (critical for filtering/pagination)
  const search = request.nextUrl.search || '';
  const url = `${API_BACKEND_URL}/api/${path}${search}`;

  console.log(`[Proxy] ${method} ${url}`);

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  // Forward authorization header
  const authHeader = request.headers.get('Authorization');
  if (authHeader) {
    headers['Authorization'] = authHeader;
  }

  try {
    const fetchOptions: RequestInit = {
      method,
      headers,
    };

    // Add body for non-GET requests
    if (method !== 'GET') {
      const body = await request.text();
      if (body) {
        fetchOptions.body = body;
      }
    }

    const response = await fetch(url, fetchOptions);

    // Forward the response as-is (handle non-JSON from backend)
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const data = await response.json();
      return NextResponse.json(data, { status: response.status });
    } else {
      const text = await response.text();
      console.error(`[Proxy] Non-JSON response from backend: ${text.substring(0, 200)}`);
      return NextResponse.json(
        { success: false, error: `Backend error (${response.status})` },
        { status: response.status }
      );
    }
  } catch (error) {
    console.error('[Proxy] Backend unreachable:', error);
    return NextResponse.json(
      { success: false, error: 'Backend API unavailable — сервер ажиллахгүй байна' },
      { status: 502 }
    );
  }
}
