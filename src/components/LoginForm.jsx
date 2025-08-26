import { useState } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Alert, AlertDescription } from '@/components/ui/alert.jsx'
import { Loader2, Key, Shield } from 'lucide-react'
import { motion } from 'framer-motion'

export function LoginForm({ onLogin, isLoading, error }) {
  const [apiKey, setApiKey] = useState('')
  
  // Use Vercel serverless function for proxy
  const PROXY_URL = '/api/ghl-proxy'

  const handleSubmit = (e) => {
    e.preventDefault()
    if (apiKey.trim()) {
      onLogin(apiKey.trim(), PROXY_URL)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur">
          <CardHeader className="text-center space-y-4 pb-8">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, duration: 0.3 }}
              className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-lg"
            >
              <Shield className="w-8 h-8 text-white" />
            </motion.div>
            <div>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                GHL AI Dashboard
              </CardTitle>
              <CardDescription className="text-gray-600 mt-2">
                Log ind med din GoHighLevel API key for at få adgang til dine analytics
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="apiKey" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Key className="w-4 h-4" />
                  GoHighLevel API Key
                </Label>
                <Input
                  id="apiKey"
                  type="password"
                  placeholder="Indtast din GHL API key..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                  required
                />
                <p className="text-xs text-gray-500">
                  Find din API key i GHL under Settings → API Keys
                </p>
              </div>

              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertDescription className="text-red-700">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                disabled={isLoading || !apiKey.trim()}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Logger ind...
                  </>
                ) : (
                  'Log ind til Dashboard'
                )}
              </Button>
            </form>

            <div className="text-center pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-500">
                Sikker forbindelse • Dine data forbliver private
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

