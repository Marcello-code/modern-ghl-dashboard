import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Alert, AlertDescription } from '@/components/ui/alert.jsx'
import { 
  Users, 
  MessageCircle, 
  Calendar, 
  TrendingUp, 
  RefreshCw, 
  LogOut,
  Building2,
  Activity,
  BarChart3
} from 'lucide-react'
import { motion } from 'framer-motion'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'

export function Dashboard({ apiKey, proxyUrl, locationId, onLogout }) {
  const [data, setData] = useState({
    locations: [],
    selectedLocation: { id: locationId, name: 'Current Location' },
    metrics: null,
    chartData: [],
    loading: true,
    error: null
  })

  const fetchLocations = async () => {
    try {
      // Skip locations fetch since we have locationId directly
      setData(prev => ({
        ...prev,
        locations: [{ id: locationId, name: 'Current Location' }],
        selectedLocation: { id: locationId, name: 'Current Location' },
        loading: false
      }))
      
      // Fetch data for the provided location ID
      fetchMetrics(locationId)
    } catch (error) {
      setData(prev => ({
        ...prev,
        error: error.message,
        loading: false
      }))
    }
  }

  const fetchMetrics = async (locationId) => {
    if (!locationId) return
    
    setData(prev => ({ ...prev, loading: true }))
    
    try {
      // Fetch contacts data
      const response = await fetch(
        `${proxyUrl}?endpoint=contacts&locationId=${locationId}`,
        { headers: { 'x-api-key': apiKey } }
      )
      
      if (!response.ok) {
        throw new Error('Kunne ikke hente contacts data')
      }
      
      const result = await response.json()
      const contacts = result.contacts || []
      
      // Calculate metrics from contacts data
      const totalContacts = contacts.length
      const uniqueContacts = new Set(contacts.map(c => c.id)).size
      const recentContacts = contacts.filter(c => {
        const addedDate = new Date(c.dateAdded)
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        return addedDate > thirtyDaysAgo
      }).length
      
      // Generate chart data from contacts
      const chartData = generateChartData(contacts)
      
      setData(prev => ({
        ...prev,
        metrics: {
          uniqueMessagedContacts: uniqueContacts,
          totalConversations: totalContacts,
          outboundMessages: recentContacts
        },
        chartData,
        loading: false,
        error: null
      }))
    } catch (error) {
      setData(prev => ({
        ...prev,
        error: error.message,
        loading: false
      }))
    }
  }

  const generateChartData = (contacts) => {
    // Group contacts by date added for chart
    const dateGroups = {}
    contacts.forEach(contact => {
      const date = new Date(contact.dateAdded).toISOString().split('T')[0]
      dateGroups[date] = (dateGroups[date] || 0) + 1
    })
    
    // Convert to chart format
    return Object.entries(dateGroups)
      .sort(([a], [b]) => new Date(a) - new Date(b))
      .slice(-30) // Last 30 days
      .map(([date, count]) => ({
        date: new Date(date).toLocaleDateString('da-DK', { month: 'short', day: 'numeric' }),
        value: count
      }))
  }

  useEffect(() => {
    fetchLocations()
  }, [])

  const handleRefresh = () => {
    if (data.selectedLocation) {
      fetchMetrics(data.selectedLocation.id)
    }
  }

  const kpiCards = [
    {
      title: 'Unikke Kontakter',
      value: data.metrics?.uniqueMessagedContacts || 0,
      description: 'Antal leads skrevet til',
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700'
    },
    {
      title: 'Samtaler',
      value: data.metrics?.conversationsReplied || 0,
      description: 'Antal der har svaret',
      icon: MessageCircle,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      textColor: 'text-green-700'
    },
    {
      title: 'Beskeder Sendt',
      value: data.metrics?.totalOutboundMessages || 0,
      description: 'Totale udgående beskeder',
      icon: Activity,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-700'
    }
  ]

  if (data.loading && !data.metrics) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Henter dine data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">GHL AI Dashboard</h1>
                {data.selectedLocation && (
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    <Building2 className="w-3 h-3" />
                    {data.selectedLocation.name}
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={data.loading}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${data.loading ? 'animate-spin' : ''}`} />
                Opdater
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onLogout}
                className="flex items-center gap-2 text-red-600 hover:text-red-700"
              >
                <LogOut className="w-4 h-4" />
                Log ud
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {data.error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertDescription className="text-red-700">
              {data.error}
            </AlertDescription>
          </Alert>
        )}

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {kpiCards.map((kpi, index) => (
            <motion.div
              key={kpi.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">
                        {kpi.title}
                      </p>
                      <p className="text-3xl font-bold text-gray-900 mb-1">
                        {kpi.value.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-500">
                        {kpi.description}
                      </p>
                    </div>
                    <div className={`w-12 h-12 ${kpi.bgColor} rounded-xl flex items-center justify-center`}>
                      <kpi.icon className={`w-6 h-6 ${kpi.textColor}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Aktivitet Over Tid
              </CardTitle>
              <CardDescription>
                Daglig oversigt over udgående beskeder (sidste 30 dage)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.chartData}>
                    <defs>
                      <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="date" 
                      stroke="#6b7280"
                      fontSize={12}
                      tickFormatter={(value) => new Date(value).toLocaleDateString('da-DK', { 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    />
                    <YAxis stroke="#6b7280" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                      labelFormatter={(value) => new Date(value).toLocaleDateString('da-DK')}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      fill="url(#colorGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Status Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-8"
        >
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">System Status</h3>
                  <div className="flex items-center gap-4">
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      API Forbundet
                    </Badge>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      Data Synkroniseret
                    </Badge>
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  Sidst opdateret: {new Date().toLocaleString('da-DK')}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  )
}

