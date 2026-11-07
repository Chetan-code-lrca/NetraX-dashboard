import { useEffect, useRef, useState } from 'react'
import './App.css'
import AnalysisProgress from './components/AnalysisProgress'
import AlertDetails from './components/AlertDetails'
import Header from './components/Header'
import NetworkPath from './components/NetworkPath'
import RecentAlerts from './components/RecentAlerts'
import SecuritySummary from './components/SecuritySummary'
import TrafficAnalysisView from './components/TrafficAnalysisView'
import TrafficInput from './components/TrafficInput'
import ThreatActivity from './components/ThreatActivity'
import ThreatModelGrid from './components/ThreatModelGrid'
import { threatModels } from './data/threatModels'
import { normalizeAnalysisResponse } from './models/analysis'
import { analyzeTraffic, checkApiHealth } from './services/api'
import { validateTrafficFile } from './services/file-validation'

function App() {
  const [trafficFile, setTrafficFile] = useState(null)
  const [analysisStatus, setAnalysisStatus] = useState('idle')
  const [backendStatus, setBackendStatus] = useState('checking')
  const [analysis, setAnalysis] = useState(null)
  const [error, setError] = useState('')
  const [selectedAlertId, setSelectedAlertId] = useState(null)
  const abortRef = useRef(null)
  const healthCheckRef = useRef(null)

  useEffect(() => () => abortRef.current?.abort(), [])

  useEffect(() => {
    const controller = new AbortController()
    healthCheckRef.current = controller
    checkApiHealth(controller.signal)
      .then((available) => setBackendStatus(available ? 'online' : 'offline'))
      .catch((requestError) => {
        if (requestError.name !== 'AbortError') setBackendStatus('offline')
      })
      .finally(() => {
        if (healthCheckRef.current === controller) healthCheckRef.current = null
      })
    return () => controller.abort()
  }, [])

  const alerts = analysisStatus === 'complete' ? analysis?.alerts ?? [] : []
  const selectedAlert = alerts.find((alert) => alert.flow_id === selectedAlertId)

  const handleFile = (file) => {
    abortRef.current?.abort()
    setAnalysis(null)
    setError('')
    setSelectedAlertId(null)

    if (!file) {
      setTrafficFile(null)
      setAnalysisStatus('idle')
      return
    }

    const validationError = validateTrafficFile(file)
    if (validationError) {
      setTrafficFile(null)
      setError(validationError)
      setAnalysisStatus('error')
      return
    }

    setTrafficFile(file)
    setAnalysisStatus('ready')
  }

  const startAnalysis = async () => {
    if (!trafficFile) return
    setError('')
    setAnalysisStatus('uploading')
    healthCheckRef.current?.abort()
    healthCheckRef.current = null
    abortRef.current = new AbortController()
    try {
      setAnalysisStatus('analyzing')
      const response = await analyzeTraffic(trafficFile, abortRef.current.signal)
      const normalized = normalizeAnalysisResponse(response, trafficFile)
      setAnalysis(normalized)
      setBackendStatus('online')
      if (normalized.status === 'complete') {
        setAnalysisStatus('complete')
        setSelectedAlertId(normalized.alerts[0]?.flow_id ?? null)
      }
    } catch (requestError) {
      if (requestError.name === 'AbortError') { setAnalysisStatus('ready'); return }
      setError(requestError.message)
      setBackendStatus(requestError.backendOffline ? 'offline' : 'online')
      setAnalysisStatus(requestError.backendOffline ? 'backend_offline' : 'error')
    }
  }

  const stopAnalysis = () => abortRef.current?.abort()
  const resetAnalysis = () => { abortRef.current?.abort(); setTrafficFile(null); setAnalysisStatus('idle'); setAnalysis(null); setError(''); setSelectedAlertId(null) }
  const headerStatus = backendStatus === 'checking' ? 'CHECKING API' : backendStatus === 'online' ? 'API ONLINE' : 'API OFFLINE'

  return (
    <div className="app-shell">
      <Header systemStatus={headerStatus} />
      <main className="dashboard">
        <TrafficInput file={trafficFile} status={analysisStatus} error={error} onFile={handleFile} onStart={startAnalysis} onStop={stopAnalysis} onReset={resetAnalysis} />
        <NetworkPath alert={selectedAlert} />
        <AnalysisProgress status={analysisStatus} analysis={analysis} />
        <SecuritySummary alerts={alerts} totalFlows={analysis?.flows_processed ?? null} isComplete={analysisStatus === 'complete'} />
        <ThreatActivity alerts={alerts} models={threatModels} />
        <section className="event-workflow" aria-label="Security event workflow">
          <RecentAlerts alerts={alerts} selectedAlertId={selectedAlertId} onSelectAlert={setSelectedAlertId} />
          <AlertDetails alert={selectedAlert} />
          <TrafficAnalysisView alert={selectedAlert} />
        </section>
        <ThreatModelGrid models={threatModels} alerts={alerts} analysisStatus={analysisStatus} />
        <footer className="footer">NetraX · Passive one-way detection · Evidence-aware results for unidirectional traffic</footer>
      </main>
    </div>
  )
}

export default App
