import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Forward the request to your external API
    const response = await fetch('https://amapi-uz5a.onrender.com/api/v1/auth/register/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    const data = await response.json()

    // 🔥 Friendly error handling
    let friendlyData = { ...data }

    if (!data.success && data.message) {
      // Map common messages to user-friendly ones
      if (data.message.toLowerCase().includes('email')) {
        friendlyData.message = 'This email is already registered.'
      } else if (data.message.toLowerCase().includes('username')) {
        friendlyData.message = 'This username is already taken.'
      } else {
        friendlyData.message = data.message // fallback to whatever API returns
      }
    }

    // Return the response with proper CORS headers
    return NextResponse.json(friendlyData, {
      status: response.status,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    })
  } catch (error) {
    console.error('Register API Error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
