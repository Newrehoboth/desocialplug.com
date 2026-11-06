interface RegisterData {
  username: string
  email: string
  password: string
}

interface LoginData {
  email: string
  password: string
}

interface AuthResponse {
  success: boolean
  message: string
  data?: any
}

export async function registerUser(data: RegisterData): Promise<AuthResponse> {
  try {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    const result = await response.json()

    if (response.ok) {
      return {
        success: true,
        message: result.message || 'Registration successful!',
        data: result
      }
    } else {
      return {
        success: false,
        message: result.message || 'Registration failed'
      }
    }
  } catch (error) {
    return {
      success: false,
      message: 'Network error. Please try again.'
    }
  }
}

export async function loginUser(data: LoginData): Promise<AuthResponse> {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    const result = await response.json()

    if (response.ok) {
      return {
        success: true,
        message: result.message || 'Login successful!',
        data: result
      }
    } else {
      return {
        success: false,
        message: result.message || 'Login failed'
      }
    }
  } catch (error) {
    return {
      success: false,
      message: 'Network error. Please try again.'
    }
  }
}