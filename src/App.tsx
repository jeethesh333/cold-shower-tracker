import { Container, VStack } from '@chakra-ui/react'
import { useState, useEffect } from 'react'
import ChallengeSetup from './components/ChallengeSetup'
import ChallengeTracker from './components/ChallengeTracker'
import { ChallengeData } from './types'
import './styles/calendar.css'

function App() {
  const [challengeData, setChallengeData] = useState<ChallengeData | null>(() => {
    const saved = localStorage.getItem('challengeData')
    return saved ? JSON.parse(saved) : null
  })

  useEffect(() => {
    if (challengeData) {
      localStorage.setItem('challengeData', JSON.stringify(challengeData))
    }
  }, [challengeData])

  const handleStartChallenge = (days: number, startDate: string) => {
    setChallengeData({
      startDate: startDate,
      totalDays: days,
      completedDates: [],
      notes: []
    })
  }

  const handleReset = () => {
    localStorage.removeItem('challengeData')
    setChallengeData(null)
  }

  return (
    <Container maxW="container.lg" py={8}>
      <VStack gap={8}>
        {!challengeData ? (
          <ChallengeSetup onStart={handleStartChallenge} />
        ) : (
          <ChallengeTracker
            challengeData={challengeData}
            setChallengeData={setChallengeData}
            onReset={handleReset}
          />
        )}
      </VStack>
    </Container>
  )
}

export default App
