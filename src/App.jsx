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
      const response = await fetch(`${proxyUrl}?endpoint=contacts`, {
        headers: { 'x-api-key': apiKey }
      })
      
      let errorData;
      try {
        errorData = await response.json()
      } catch (e) {
        errorData = { error: 'Uventet fejl fra serveren' }
      }
      
      if (!response.ok) {
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
      }
      
      // Check if we got valid data
      if (!errorData || typeof errorData !== 'object') {
        throw new Error('Ugyldig response fra GoHighLevel API')
      }
      
      setAuth({
        isAuthenticated: true,
        apiKey,
        proxyUrl,
        loading: false,
        error: null
      })
    } catch (error) {
      console.error('Login error:', error)
      setAuth(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Ukendt fejl opstod'
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
