import { Box, useToast, Spinner, Center } from '@chakra-ui/react'
import { useState, useEffect } from 'react'
import ChallengeSetup from './components/ChallengeSetup'
import ChallengeTracker from './components/ChallengeTracker'
import ErrorBoundary from './components/ErrorBoundary'
import MusicPlayer from './components/MusicPlayer'
import { validateChallengeData, sanitizeChallengeData } from './utils/validation'
import { ChallengeData } from './types'
import './styles/calendar.css'

function App() {
  const toast = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [challengeData, setChallengeData] = useState<ChallengeData | null>(() => {
    const saved = localStorage.getItem('challengeData')
    if (!saved) return null
    
    try {
      const parsed = JSON.parse(saved)
      const { isValid, data, errors } = validateChallengeData(parsed)
      
      if (!isValid && errors.length > 0) {
        console.warn('Data validation warnings:', errors)
        toast({
          title: 'Data Recovery',
          description: 'Some of your challenge data was corrupted and has been fixed.',
          status: 'warning',
          duration: 5000,
          isClosable: true,
        })
      }
      
      return data
    } catch (error) {
      console.error('Error parsing challenge data:', error)
      toast({
        title: 'Data Error',
        description: 'Could not load your previous challenge data.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
      return null
    }
  })

  useEffect(() => {
    // Simulate initial data loading
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (challengeData) {
      setIsSaving(true)
      try {
        // Sanitize data before saving
        const sanitizedData = sanitizeChallengeData(challengeData)
        localStorage.setItem('challengeData', JSON.stringify(sanitizedData))
      } catch (error) {
        console.error('Error saving challenge data:', error)
        toast({
          title: 'Save Error',
          description: 'Failed to save your challenge progress.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        })
      } finally {
        setIsSaving(false)
      }
    }
  }, [challengeData, toast])

  const handleStart = async (days: number, startDate: string, userName: string) => {
    setIsLoading(true)
    try {
      const newChallengeData: ChallengeData = {
        days: Math.max(10, Math.min(365, days)),
        startDate,
        userName,
        completedDays: [],
        notes: {},
        lastLoggedDate: null
      }
      
      const { isValid, data, errors } = validateChallengeData(newChallengeData)
      if (!isValid) {
        console.error('Invalid challenge data:', errors)
        toast({
          title: 'Setup Error',
          description: 'Invalid challenge configuration. Please try again.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        })
        return
      }
      
      setChallengeData(data)
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = async () => {
    setIsLoading(true)
    try {
      localStorage.removeItem('challengeData')
      localStorage.removeItem('userName')
      setChallengeData(null)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <Center minH="100vh" bg="gray.900">
        <Spinner
          thickness="4px"
          speed="0.65s"
          emptyColor="gray.700"
          color="blue.500"
          size="xl"
        />
      </Center>
    )
  }

  return (
    <ErrorBoundary>
      <Box minH="100vh" bg="gray.900" position="relative">
        {!challengeData ? (
          <ChallengeSetup onStart={handleStart} />
        ) : (
          <ChallengeTracker
            challengeData={challengeData}
            onUpdate={(data) => setChallengeData(sanitizeChallengeData(data))}
            onReset={handleReset}
          />
        )}
        <Box position="fixed" bottom={4} right={4} zIndex={10}>
          <MusicPlayer />
        </Box>
        {isSaving && (
          <Box
            position="fixed"
            top={4}
            right={4}
            bg="whiteAlpha.200"
            px={3}
            py={1}
            borderRadius="md"
            fontSize="sm"
            color="whiteAlpha.900"
          >
            Saving...
          </Box>
        )}
      </Box>
    </ErrorBoundary>
  )
}

export default App
