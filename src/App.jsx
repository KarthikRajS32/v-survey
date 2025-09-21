import { useState, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import TopBar from './components/TopBar'
import SurveyPersonnel from './components/CreateUsers'
import Surveys from './components/CreateQuestion'
import CreateSurvey from './components/CreateSurveys'
import SetPassword from './components/SetPassword'
import { supabase } from './lib/supabaseClient'


function App() {
  const [activeTab, setActiveTab] = useState('personnel')

  const [session, setSession] = useState(true)
  const [showPasswordScreen, setShowPasswordScreen] = useState(false)

  useEffect(() => {
    // Check if coming from email link (including hash parameters)
    const urlParams = new URLSearchParams(window.location.search)
    const hashParams = new URLSearchParams(window.location.hash.substring(1))
    const hasAuthParams = urlParams.has('access_token') || urlParams.has('refresh_token') || 
                         hashParams.has('access_token') || hashParams.has('refresh_token') ||
                         hashParams.has('error')
    
    if (hasAuthParams) {
      setShowPasswordScreen(true)
      setSession(false)
      // Clear URL parameters
      window.history.replaceState({}, document.title, window.location.pathname)
    }

    // Listen for auth changes (email link clicks)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        setShowPasswordScreen(true)
        setSession(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const renderContent = () => {
    switch (activeTab) {
      case 'Users':
        return <SurveyPersonnel />
      case 'Questions':
        return <Surveys />
      case 'surveys':
        return <CreateSurvey />
      default:
        return <SurveyPersonnel />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {session && !showPasswordScreen ? (
        <>
          <TopBar setActiveTab={setActiveTab} />
          <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
          <main className="lg:ml-64 pt-16 sm:pt-20 md:pt-24 p-4 sm:p-6 md:p-8 mt-10">
            {renderContent()}
          </main>
        </>
      ) : (
        <SetPassword onPasswordSet={() => {
          setSession(true)
          setShowPasswordScreen(false)
        }} />
      )}
    </div>
  )
}

export default App
