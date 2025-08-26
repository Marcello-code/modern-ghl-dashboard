import { useState } from 'react'
import { LoginForm } from './components/LoginForm.jsx'
import { Dashboard } from './components/Dashboard.jsx'
import './App.css'

function App() {
  const [auth, setAuth] = useState({
    isAuthenticated: false,
    apiKey: null,
    proxyUrl: null,
    loading: false,
    error: null
  })

  const handleLogin = async (apiKey, proxyUrl) => {
    setAuth(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      // Test API connection using serverless function
      const response = await fetch(`${proxyUrl}?endpoint=locations`, {
        headers: { 'x-api-key': apiKey }
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Ugyldig API key')
      }
      
      setAuth({
        isAuthenticated: true,
        apiKey,
        proxyUrl,
        loading: false,
        error: null
      })
    } catch (error) {
      setAuth(prev => ({
        ...prev,
        loading: false,
        error: error.message
      }))
    }
  }

  const handleLogout = () => {
    setAuth({
      isAuthenticated: false,
      apiKey: null,
      proxyUrl: null,
      loading: false,
      error: null
    })
  }

  if (auth.isAuthenticated) {
    return (
      <Dashboard
        apiKey={auth.apiKey}
        proxyUrl={auth.proxyUrl}
        onLogout={handleLogout}
      />
    )
  }

  return (
    <LoginForm
      onLogin={handleLogin}
      isLoading={auth.loading}
      error={auth.error}
    />
  )
}

export default App
