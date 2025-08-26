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
      // Test API connection
      const response = await fetch(`${proxyUrl}/locations`, {
        headers: { 'x-api-key': apiKey }
      })
      
      if (!response.ok) {
        throw new Error('Ugyldig API key eller proxy URL')
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
