import { 
  Box, 
  Button, 
  Grid, 
  Heading, 
  Text, 
  Textarea, 
  useToast, 
  VStack, 
  IconButton, 
  useDisclosure, 
  Modal, 
  ModalOverlay, 
  ModalContent, 
  ModalHeader, 
  ModalBody, 
  ModalFooter, 
  ModalCloseButton, 
  Input, 
  Flex, 
  Tooltip, 
  NumberInput, 
  NumberInputField, 
  NumberInputStepper, 
  NumberIncrementStepper, 
  NumberDecrementStepper 
} from '@chakra-ui/react'
import { Global as EmotionGlobal } from '@emotion/react'
import { useState, useEffect } from 'react'
import ReactConfetti from 'react-confetti'
import { differenceInDays, format, isAfter, isBefore, parseISO } from 'date-fns'
import { DeleteIcon, EditIcon, CheckIcon, CalendarIcon } from '@chakra-ui/icons'
import { ChallengeData, SessionNote } from '../types'
import ChallengeGrid from './ChallengeGrid'
import confetti from "canvas-confetti"

interface ChallengeTrackerProps {
  challengeData: ChallengeData;
  setChallengeData: (data: ChallengeData) => void;
  onReset: () => void;
}

const motivationalQuotes = [
  { text: "Growth begins at the end of your comfort zone", author: "Neale Donald Walsch" },
  { text: "Do something today that your future self will thank you for", author: "Sean Patrick Flanery" },
  { text: "The harder you push, the stronger you become", author: "Anonymous" },
  { text: "Comfort is the enemy of progress", author: "P.T. Barnum" },
  { text: "What doesn't challenge you doesn't change you", author: "Fred DeVito" },
  { text: "The only easy day was yesterday", author: "Navy SEALs" },
  { text: "Your comfort zone is a beautiful place, but nothing ever grows there", author: "Roy T. Bennett" },
  { text: "Life begins where fear ends", author: "Osho" },
  { text: "The hard path is the right path", author: "Anonymous" },
  { text: "Strength through adversity", author: "Anonymous" },
  { text: "Face the challenge, embrace the growth", author: "Anonymous" },
  { text: "Do hard things, get strong results", author: "Anonymous" },
  { text: "Challenge yourself every single day", author: "Anonymous" },
  { text: "Discomfort today, strength tomorrow", author: "Anonymous" },
  { text: "Push your limits, find your strength", author: "Anonymous" }
]

const ChallengeTracker = ({ challengeData, setChallengeData, onReset }: ChallengeTrackerProps) => {
  const [showConfetti, setShowConfetti] = useState(false)
  const [currentQuote, setCurrentQuote] = useState<{ text: string; author: string } | null>(null)
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  })
  const [note, setNote] = useState('')
  const [editingNote, setEditingNote] = useState<SessionNote | null>(null)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const toast = useToast()
  const [selectedPastDate, setSelectedPastDate] = useState('')
  const [pastDateNote, setPastDateNote] = useState('')
  const { isOpen: isPastDateOpen, onOpen: onPastDateOpen, onClose: onPastDateClose } = useDisclosure()
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [dateToDelete, setDateToDelete] = useState<string | null>(null)
  const [showResetModal, setShowResetModal] = useState(false)
  const [isNoteSaved, setIsNoteSaved] = useState(false)
  const [showDurationModal, setShowDurationModal] = useState(false)
  const [newDuration, setNewDuration] = useState(challengeData.totalDays)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const completedDays = challengeData.completedDates.length
  const progress = (completedDays / challengeData.totalDays) * 100
  const daysLeft = challengeData.totalDays - completedDays
  const currentStreak = calculateStreak(challengeData.completedDates)

  function calculateStreak(dates: string[]): number {
    if (dates.length === 0) return 0
    
    const sortedDates = [...dates].sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
    const today = new Date()
    const lastDate = new Date(sortedDates[0])
    
    if (differenceInDays(today, lastDate) > 1) return 0
    
    let streak = 1
    for (let i = 0; i < sortedDates.length - 1; i++) {
      const curr = new Date(sortedDates[i])
      const next = new Date(sortedDates[i + 1])
      if (differenceInDays(curr, next) === 1) {
        streak++
      } else {
        break
      }
    }
    return streak
  }

  const triggerConfetti = () => {
    // Background layer (slower, larger particles)
    const backgroundLayer = () => {
      confetti({
        particleCount: 50,
        spread: 100,
        origin: { x: 0.5, y: 0.5 },
        gravity: 0.3,
        scalar: 2,
        ticks: 400,
        startVelocity: 15,
        shapes: ['circle'],
        colors: ['#87CEEB', '#98FB98'],
        zIndex: 100,
        drift: 1,
        angle: 270,
      });
    };

    // Middle layer (medium speed and size)
    const middleLayer = (x: number, y: number) => {
      confetti({
        particleCount: 40,
        spread: 70,
        origin: { x, y },
        gravity: 0.5,
        scalar: 1.2,
        startVelocity: 35,
        ticks: 300,
        shapes: ['square'],
        colors: ['#FFD700', '#DDA0DD'],
        zIndex: 110,
        drift: 0.2,
        angle: x < 0.5 ? 60 : 120,
      });
    };

    // Foreground layer (fast, small particles)
    const foregroundLayer = (x: number, y: number) => {
      confetti({
        particleCount: 30,
        spread: 45,
        origin: { x, y },
        gravity: 0.7,
        scalar: 0.8,
        startVelocity: 45,
        ticks: 200,
        shapes: ['star'],
        colors: ['#F0E68C', '#FF69B4'],
        zIndex: 120,
        drift: 0,
        angle: x < 0.5 ? 45 : 135,
      });
    };

    // Initial burst from corners
    const corners = [
      { x: 0, y: 0 },   // Top left
      { x: 1, y: 0 },   // Top right
      { x: 0, y: 0.8 }, // Bottom left
      { x: 1, y: 0.8 }, // Bottom right
    ];

    corners.forEach(({ x, y }) => {
      middleLayer(x, y);
      foregroundLayer(x, y);
    });

    // Center background effect
    backgroundLayer();

    // Continuous gentle animation
    const end = Date.now() + 5000;
    const gentleConfetti = () => {
      const remaining = end - Date.now();
      if (remaining < 0) return;

      // Alternate between left and right sides
      const side = Math.random() > 0.5;
      confetti({
        particleCount: 2,
        angle: side ? 60 : 120,
        spread: 80,
        origin: { x: side ? 0 : 1, y: 0.7 },
        gravity: 0.3,
        scalar: 0.9,
        drift: side ? 0.5 : -0.5,
        ticks: 300,
        shapes: ['circle', 'square'],
        zIndex: 115,
        colors: ['#FFD700', '#87CEEB', '#98FB98', '#DDA0DD', '#F0E68C'],
      });

      requestAnimationFrame(gentleConfetti);
    };
    gentleConfetti();
  };

  const handleLogSession = () => {
    const today = new Date();
    const localDate = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString().split('T')[0];
    if (challengeData.completedDates.includes(localDate)) {
      toast({
        title: "Already logged",
        description: "You've already logged a session for today!",
        status: "warning",
        duration: 3000,
        isClosable: true,
      })
      return
    }

    setIsAnimating(true);
    const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]
    setCurrentQuote(randomQuote)
    setShowConfetti(true)
    triggerConfetti()

    setTimeout(() => {
      setShowConfetti(false)
      setIsAnimating(false)
    }, 5000)

    setChallengeData({
      ...challengeData,
      completedDates: [...challengeData.completedDates, localDate],
      notes: note ? [...challengeData.notes, { date: localDate, note }] : challengeData.notes,
    })

    setNote('')
  }

  const handleEditNote = (noteToEdit: SessionNote) => {
    setEditingNote(noteToEdit)
    onOpen()
  }

  const handleSaveEdit = () => {
    if (!editingNote) return

    const updatedNotes = challengeData.notes.map(n => 
      n.date === editingNote.date ? editingNote : n
    )

    setChallengeData({
      ...challengeData,
      notes: updatedNotes
    })

    toast({
      title: "Note updated",
      status: "success",
      duration: 2000,
    })

    onClose()
    setEditingNote(null)
  }

  const handleLogPastDate = () => {
    const pastDate = selectedPastDate
    const startDateObj = parseISO(challengeData.startDate + 'T00:00:00')
    const selectedDateObj = parseISO(pastDate + 'T00:00:00')
    const today = new Date()

    if (isBefore(selectedDateObj, startDateObj)) {
      toast({
        title: "Invalid date",
        description: "Cannot log dates before the challenge start date",
        status: "error",
        duration: 3000,
        isClosable: true,
      })
      return
    }

    if (isAfter(selectedDateObj, today)) {
      toast({
        title: "Invalid date",
        description: "Cannot log future dates",
        status: "error",
        duration: 3000,
        isClosable: true,
      })
      return
    }

    if (challengeData.completedDates.includes(pastDate)) {
      toast({
        title: "Already logged",
        description: "This date has already been logged",
        status: "warning",
        duration: 3000,
        isClosable: true,
      })
      return
    }

    setChallengeData({
      ...challengeData,
      completedDates: [...challengeData.completedDates, pastDate],
      notes: pastDateNote ? [...challengeData.notes, { date: pastDate, note: pastDateNote }] : challengeData.notes,
    })

    toast({
      title: "Past date logged",
      description: `Successfully logged ${format(selectedDateObj, 'MMMM d, yyyy')}`,
      status: "success",
      duration: 3000,
      isClosable: true,
    })

    setSelectedPastDate('')
    setPastDateNote('')
    onPastDateClose()
  }

  const handleDeleteDate = (date: string) => {
    setDateToDelete(date)
    setShowDeleteModal(true)
  }

  const confirmDelete = () => {
    if (!dateToDelete) return

    const updatedCompletedDates = challengeData.completedDates.filter(d => d !== dateToDelete)
    const updatedNotes = challengeData.notes.filter(n => n.date !== dateToDelete)

    setChallengeData({
      ...challengeData,
      completedDates: updatedCompletedDates,
      notes: updatedNotes
    })

    toast({
      title: "Date removed",
      description: `Successfully removed ${format(parseISO(dateToDelete + 'T00:00:00'), 'MMMM d, yyyy')}`,
      status: "success",
      duration: 3000,
      isClosable: true,
    })

    setShowDeleteModal(false)
    setDateToDelete(null)
  }

  const handleResetClick = () => {
    setShowResetModal(true)
  }

  const confirmReset = () => {
    onReset()
    setShowResetModal(false)
  }

  const handleSaveNote = () => {
    if (!note.trim()) return
    
    const today = new Date().toISOString().split('T')[0]
    const existingNoteIndex = challengeData.notes.findIndex(n => n.date === today)
    
    let updatedNotes = [...challengeData.notes]
    if (existingNoteIndex >= 0) {
      updatedNotes[existingNoteIndex] = { date: today, note: note.trim() }
    } else {
      updatedNotes.push({ date: today, note: note.trim() })
    }
    
    setChallengeData({
      ...challengeData,
      notes: updatedNotes
    })
    
    setIsNoteSaved(true)
    toast({
      title: "Note saved",
      status: "success",
      duration: 2000,
    })
    
    setTimeout(() => setIsNoteSaved(false), 2000)
  }

  const handleDurationChange = () => {
    if (newDuration < completedDays) {
      toast({
        title: "Invalid duration",
        description: "New duration cannot be less than completed days",
        status: "error",
        duration: 3000,
        isClosable: true,
      })
      return
    }

    setChallengeData({
      ...challengeData,
      totalDays: newDuration
    })

    toast({
      title: "Challenge duration updated",
      description: `Challenge duration is now set to ${newDuration} days`,
      status: "success",
      duration: 3000,
      isClosable: true,
    })

    setShowDurationModal(false)
  }

  const sortedNotes = [...challengeData.notes].sort((prev: SessionNote, next: SessionNote) => {
    return parseISO(next.date).getTime() - parseISO(prev.date).getTime();
  })

  return (
    <Box
      width="100vw"
      minHeight="100vh"
      bgGradient="linear(135deg, blue.900 0%, blue.700 50%, blue.600 100%)"
      py={{ base: 4, md: 8 }}
      display="flex"
      justifyContent="center"
      alignItems="flex-start"
      color="white"
      overflowX="hidden"
      overflowY="auto"
      position="absolute"
      top="0"
      left="0"
      margin="0"
      padding="0"
      _before={{
        content: '""',
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        bgGradient: "radial(circle at 20% 20%, whiteAlpha.100 0%, transparent 50%)",
        pointerEvents: "none",
        zIndex: 0
      }}
    >
      {isAnimating && (
        <Box
          position="fixed"
          top={0}
          left={0}
          right={0}
          bottom={0}
          zIndex={9999}
          cursor="not-allowed"
          onClick={(e) => e.preventDefault()}
          onKeyDown={(e) => e.preventDefault()}
          tabIndex={0}
        />
      )}

      {showConfetti && (
        <>
          <ReactConfetti
            width={windowSize.width}
            height={windowSize.height}
            recycle={true}
            numberOfPieces={200}
            gravity={0.2}
            wind={0.01}
            opacity={0.8}
            colors={['#FFD700', '#87CEEB', '#98FB98', '#DDA0DD', '#F0E68C']}
            drawShape={ctx => {
              // Create custom rotating shapes
              const rotation = (Date.now() / 500) % (Math.PI * 2);
              ctx.beginPath();
              if (Math.random() > 0.5) {
                // Star shape
                for (let i = 0; i < 5; i++) {
                  const angle = (i * Math.PI * 2) / 5 - Math.PI / 2 + rotation;
                  const radius = i % 2 === 0 ? 4 : 8;
                  const x = Math.cos(angle) * radius;
                  const y = Math.sin(angle) * radius;
                  if (i === 0) ctx.moveTo(x, y);
                  else ctx.lineTo(x, y);
                }
              } else {
                // Rotating rectangle
                ctx.save();
                ctx.rotate(rotation);
                ctx.rect(-3, -3, 6, 6);
                ctx.restore();
              }
              ctx.closePath();
              ctx.fill();
            }}
            tweenFunction={(_, currentValue, targetValue) => {
              // Add smooth easing to particle movement
              return currentValue + (targetValue - currentValue) * 0.1;
            }}
          />
          <Box
            position="fixed"
            top="50%"
            left="50%"
            transform="translate(-50%, -50%)"
            textAlign="center"
            zIndex={1000}
            pointerEvents="none"
            backdropFilter="blur(8px)"
            bg="whiteAlpha.100"
            p={8}
            borderRadius="2xl"
            boxShadow="0 8px 32px rgba(0, 0, 0, 0.2)"
            sx={{
              animation: "quoteReveal 5s ease-in-out",
              "@keyframes quoteReveal": {
                "0%": { 
                  opacity: 0, 
                  transform: "translate(-50%, -60%) scale(0.9)",
                  filter: "blur(10px)"
                },
                "15%": { 
                  opacity: 1, 
                  transform: "translate(-50%, -50%) scale(1)",
                  filter: "blur(0px)"
                },
                "85%": { 
                  opacity: 1, 
                  transform: "translate(-50%, -50%) scale(1)",
                  filter: "blur(0px)"
                },
                "100%": { 
                  opacity: 0, 
                  transform: "translate(-50%, -40%) scale(0.9)",
                  filter: "blur(10px)"
                }
              }
            }}
          >
            <Text
              fontSize={{ base: "4xl", md: "6xl" }}
              fontWeight="bold"
              bgGradient="linear(to-r, blue.100, white)"
              bgClip="text"
              textShadow="0 2px 10px rgba(255,255,255,0.3)"
              mb={6}
              letterSpacing="wide"
              sx={{
                animation: "shimmer 2s ease-in-out infinite"
              }}
            >
              ✨ Great job! ✨
            </Text>
            {currentQuote && (
              <VStack spacing={4}>
                <Text
                  fontSize={{ base: "xl", md: "2xl" }}
                  fontWeight="medium"
                  color="whiteAlpha.900"
                  textShadow="0 2px 8px rgba(0,0,0,0.3)"
                  maxW="600px"
                  mx="auto"
                  px={4}
                  fontStyle="italic"
                  lineHeight="1.6"
                >
                  "{currentQuote.text}"
                </Text>
              </VStack>
            )}
          </Box>
        </>
      )}

      <Box
        width="100%"
        maxW={{ base: "95%", lg: "1200px" }}
        mx="auto"
        p={{ base: 4, md: 8 }}
        position="relative"
        zIndex={1}
        opacity={isAnimating ? 0.7 : 1}
        pointerEvents={isAnimating ? "none" : "auto"}
        transition="opacity 0.3s"
      >
        <VStack gap={{ base: 4, md: 6 }} width="100%" mb={6}>
          <Box textAlign="center" width="100%">
            <Heading 
              size={{ base: "md", md: "lg" }}
              bgGradient="linear(to-r, blue.100, white)"
              bgClip="text"
              mb={{ base: 2, md: 3 }}
              letterSpacing="tight"
              fontWeight="extrabold"
              textShadow="0 1px 5px rgba(0,0,0,0.2)"
            >
              ❄️Cold Shower Challenge
            </Heading>
            <Text 
              fontSize={{ base: "sm", md: "md" }}
              fontWeight="medium"
              color="whiteAlpha.900"
              letterSpacing="wide"
              textShadow="0 1px 2px rgba(0,0,0,0.1)"
            >
              Let's do this!
            </Text>
          </Box>
        </VStack>

        <Grid
          templateColumns={{ base: "1fr", lg: "1fr 450px" }}
          gap={{ base: 4, lg: 6 }}
        >
          <VStack gap={{ base: 4, md: 6 }}>
            <Grid 
              templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }}
              gap={{ base: 3, md: 4 }}
              width="100%"
            >
              <Box 
                p={{ base: 4, md: 5 }}
                borderRadius="xl"
                bg="whiteAlpha.200"
                backdropFilter="blur(8px)"
                boxShadow="md"
                textAlign="center"
                transform="translateY(0)"
                transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                position="relative"
                overflow="hidden"
                _before={{
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  bgGradient: currentStreak >= 10 ? "linear(to-r, blue.200, blue.500, purple.500)" : "linear(to-br, whiteAlpha.100, transparent)",
                  opacity: currentStreak >= 10 ? 0.8 : 0,
                  transition: "opacity 0.3s",
                  animation: currentStreak >= 10 ? "glow 1.5s infinite alternate" : "none",
                  borderRadius: "xl",
                  zIndex: -1
                }}
                _hover={{
                  transform: "translateY(-2px)",
                  boxShadow: "lg",
                  _before: {
                    opacity: 1
                  }
                }}
              >
                <Box position="relative" zIndex={1}>
                  <Text 
                    fontSize={{ base: "2xl", md: "3xl" }} 
                    fontWeight="bold" 
                    bgGradient={currentStreak > 0 ? "linear(to-r, blue.100, blue.300)" : "linear(to-r, whiteAlpha.900, whiteAlpha.600)"}
                    bgClip="text"
                    mb={1} 
                    textShadow="0 1px 2px rgba(0,0,0,0.1)"
                  >
                    {currentStreak}
                  </Text>
                  <Text color="whiteAlpha.900" fontWeight="medium" letterSpacing="wide">Day Streak</Text>
                </Box>
              </Box>
              <Box 
                p={{ base: 4, md: 5 }}
                borderRadius="xl"
                bg="whiteAlpha.200"
                backdropFilter="blur(8px)"
                boxShadow="md"
                textAlign="center"
                transform="translateY(0)"
                transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                position="relative"
                overflow="hidden"
                _before={{
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  bgGradient: "linear(to-br, whiteAlpha.100, transparent)",
                  opacity: 0,
                  transition: "opacity 0.3s"
                }}
                _hover={{
                  transform: "translateY(-2px)",
                  boxShadow: "lg",
                  _before: {
                    opacity: 1
                  }
                }}
              >
                <Box position="relative" zIndex={1}>
                  <Text 
                    fontSize={{ base: "2xl", md: "3xl" }} 
                    fontWeight="bold" 
                    bgGradient="linear(to-r, blue.100, blue.300)"
                    bgClip="text"
                    mb={1} 
                    textShadow="0 1px 2px rgba(0,0,0,0.1)"
                  >
                    {completedDays}
                  </Text>
                  <Text color="whiteAlpha.900" fontWeight="medium" letterSpacing="wide">Days Completed</Text>
                </Box>
              </Box>
              <Box 
                p={{ base: 4, md: 5 }}
                borderRadius="xl"
                bg="whiteAlpha.200"
                backdropFilter="blur(8px)"
                boxShadow="md"
                textAlign="center"
                transform="translateY(0)"
                transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                position="relative"
                overflow="hidden"
                _before={{
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  bgGradient: "linear(to-br, whiteAlpha.100, transparent)",
                  opacity: 0,
                  transition: "opacity 0.3s"
                }}
                _hover={{
                  transform: "translateY(-2px)",
                  boxShadow: "lg",
                  _before: {
                    opacity: 1
                  }
                }}
              >
                <Box position="relative" zIndex={1}>
                  <Text 
                    fontSize={{ base: "2xl", md: "3xl" }} 
                    fontWeight="bold" 
                    bgGradient={daysLeft > 0 ? "linear(to-r, blue.100, blue.300)" : "linear(to-r, green.200, green.400)"}
                    bgClip="text"
                    mb={1} 
                    textShadow="0 1px 2px rgba(0,0,0,0.1)"
                  >
                    {daysLeft}
                  </Text>
                  <Text color="whiteAlpha.900" fontWeight="medium" letterSpacing="wide">Days Left</Text>
                </Box>
              </Box>
            </Grid>

            <Box 
              width="100%" 
              bg="whiteAlpha.200"
              backdropFilter="blur(8px)"
              p={{ base: 4, md: 5 }}
              borderRadius="xl"
              boxShadow="md"
              position="relative"
              overflow="hidden"
              _before={{
                content: '""',
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                bgGradient: "linear(to-br, whiteAlpha.100, transparent)",
                opacity: 0,
                transition: "opacity 0.3s"
              }}
              _hover={{
                _before: {
                  opacity: 1
                }
              }}
            >
              <Flex justify="space-between" align="center" mb={3}>
                <Text fontWeight="semibold" color="white" fontSize={{ base: "sm", md: "md" }} letterSpacing="wide">
                  Progress
                </Text>
                <Flex align="center" gap={3}>
                  <Tooltip label="Change challenge duration" placement="top">
                    <IconButton
                      aria-label="Change duration"
                      icon={<CalendarIcon />}
                      size="sm"
                      variant="ghost"
                      color="white"
                      onClick={() => setShowDurationModal(true)}
                      _hover={{
                        bg: "whiteAlpha.200",
                        transform: "scale(1.05)"
                      }}
                      transition="all 0.2s"
                    />
                  </Tooltip>
                  <Text 
                    fontWeight="bold" 
                    fontSize={{ base: "lg", md: "xl" }}
                    bgGradient={
                      progress >= 100 ? "linear(to-r, green.200, green.400)" :
                      progress >= 75 ? "linear(to-r, blue.200, blue.400)" :
                      progress >= 50 ? "linear(to-r, cyan.200, cyan.400)" :
                      progress >= 25 ? "linear(to-r, purple.200, purple.400)" :
                      "linear(to-r, pink.200, pink.400)"
                    }
                    bgClip="text"
                  >
                    {Math.round(progress)}%
                  </Text>
                </Flex>
              </Flex>
              <Box
                width="100%"
                height="16px"
                bg="whiteAlpha.200"
                borderRadius="full"
                overflow="hidden"
                position="relative"
                boxShadow="inset 0 1px 2px rgba(0,0,0,0.1)"
              >
                <Box
                  width={`${progress}%`}
                  height="100%"
                  bgGradient={
                    progress >= 100 ? "linear(to-r, green.200, green.400)" :
                    progress >= 75 ? "linear(to-r, blue.200, blue.400)" :
                    progress >= 50 ? "linear(to-r, cyan.200, cyan.400)" :
                    progress >= 25 ? "linear(to-r, purple.200, purple.400)" :
                    "linear(to-r, pink.200, pink.400)"
                  }
                  borderRadius="full"
                  transition="all 1s cubic-bezier(0.4, 0, 0.2, 1)"
                  position="relative"
                  _after={{
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
                    transform: "translateX(-100%)",
                    animation: "shine 2s infinite"
                  }}
                />
              </Box>
              <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={3} mt={4}>
                <Box>
                  <Text fontWeight="medium" color="whiteAlpha.700" fontSize="xs" mb={1} letterSpacing="wide">Start Date</Text>
                  <Text fontWeight="semibold" color="white" fontSize={{ base: "xs", md: "sm" }}>
                    {format(new Date(challengeData.startDate + 'T00:00:00'), 'MMMM d, yyyy')}
                  </Text>
                </Box>
                <Box textAlign={{ base: "left", md: "right" }}>
                  <Text fontWeight="medium" color="whiteAlpha.700" fontSize="xs" mb={1} letterSpacing="wide">End Date</Text>
                  <Text fontWeight="semibold" color="white" fontSize={{ base: "xs", md: "sm" }}>
                    {format(
                      new Date(new Date(challengeData.startDate + 'T00:00:00').setDate(
                        new Date(challengeData.startDate + 'T00:00:00').getDate() + challengeData.totalDays - 1
                      )),
                      'MMMM d, yyyy'
                    )}
                  </Text>
                </Box>
              </Grid>
            </Box>

            <ChallengeGrid challengeData={challengeData} />

            <Box 
              width="100%" 
              bg="whiteAlpha.200"
              backdropFilter="blur(8px)"
              p={{ base: 4, md: 5 }}
              borderRadius="xl"
              boxShadow="md"
              position="relative"
              transition="all 0.3s"
              _hover={{
                boxShadow: "lg",
                transform: "translateY(-1px)"
              }}
            >
              <Flex justify="space-between" align="center" mb={3}>
                <Text fontWeight="semibold" color="white" fontSize={{ base: "sm", md: "md" }} letterSpacing="wide">
                  Today's Note
                </Text>
                <Tooltip label="Save note" placement="top">
                  <IconButton
                    aria-label="Save note"
                    icon={<CheckIcon />}
                    size="sm"
                    colorScheme={isNoteSaved ? "green" : "blue"}
                    variant="ghost"
                    onClick={handleSaveNote}
                    isDisabled={!note.trim()}
                    _hover={{
                      bg: "whiteAlpha.200",
                      transform: "scale(1.05)"
                    }}
                    transition="all 0.2s"
                  />
                </Tooltip>
              </Flex>
              <Box
                position="relative"
                transition="all 0.3s"
              >
                <Textarea
                  value={note}
                  onChange={(e) => {
                    setNote(e.target.value)
                    setIsNoteSaved(false)
                  }}
                  placeholder="How was your cold shower experience today? Share your thoughts, feelings, and any breakthroughs..."
                  minH="80px"
                  maxH="240px"
                  bg="whiteAlpha.200"
                  color="white"
                  borderColor="whiteAlpha.300"
                  borderRadius="xl"
                  _hover={{ 
                    borderColor: "whiteAlpha.400",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.1)"
                  }}
                  _focus={{ 
                    borderColor: "blue.400",
                    boxShadow: "0 0 0 1px rgba(66, 153, 225, 0.6), 0 2px 6px rgba(0,0,0,0.1)"
                  }}
                  _placeholder={{ 
                    color: "whiteAlpha.600",
                    fontStyle: "italic"
                  }}
                  fontSize={{ base: "xs", md: "sm" }}
                  resize="vertical"
                  transition="all 0.2s"
                  sx={{
                    '&::-webkit-scrollbar': {
                      width: '6px',
                      borderRadius: '6px',
                      backgroundColor: 'whiteAlpha.100',
                    },
                    '&::-webkit-scrollbar-thumb': {
                      backgroundColor: 'whiteAlpha.300',
                      borderRadius: '6px',
                      '&:hover': {
                        backgroundColor: 'whiteAlpha.400',
                      },
                    },
                  }}
                />
              </Box>
            </Box>

            <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={3} width="100%">
              <Button
                size={{ base: "md", md: "md" }}
                onClick={handleLogSession}
                bgGradient="linear(to-r, blue.400, blue.600)"
                color="white"
                _hover={{
                  bgGradient: "linear(to-r, blue.500, blue.700)",
                  transform: "translateY(-1px)",
                  boxShadow: "lg"
                }}
                _active={{
                  transform: "translateY(0)",
                  boxShadow: "md"
                }}
                transition="all 0.2s"
                boxShadow="md"
                fontWeight="semibold"
                letterSpacing="wide"
                borderRadius="xl"
                height="48px"
                isDisabled={isAnimating}
              >
                Log Today's Session
              </Button>
              <Button
                size={{ base: "md", md: "md" }}
                onClick={onPastDateOpen}
                bg="whiteAlpha.200"
                color="white"
                _hover={{
                  bg: "whiteAlpha.300",
                  transform: "translateY(-1px)",
                  boxShadow: "lg"
                }}
                _active={{
                  transform: "translateY(0)",
                  boxShadow: "md"
                }}
                transition="all 0.2s"
                boxShadow="md"
                fontWeight="semibold"
                letterSpacing="wide"
                borderRadius="xl"
                height="48px"
                backdropFilter="blur(8px)"
                isDisabled={isAnimating}
              >
                Log Past Date
              </Button>
            </Grid>

            <Button
              size={{ base: "md", md: "md" }}
              variant="outline"
              onClick={handleResetClick}
              borderColor="red.400"
              borderWidth="2px"
              color="red.400"
              _hover={{
                bg: "rgba(255, 0, 0, 0.1)",
                transform: "translateY(-1px)",
                boxShadow: "lg"
              }}
              _active={{
                transform: "translateY(0)",
                boxShadow: "md"
              }}
              transition="all 0.2s"
              boxShadow="sm"
              width="100%"
              fontWeight="semibold"
              letterSpacing="wide"
              borderRadius="xl"
              height="48px"
              isDisabled={isAnimating}
            >
              Reset Challenge
            </Button>
          </VStack>

          {sortedNotes.length > 0 && (
            <Box 
              display={{ base: "none", lg: "block" }}
              position="sticky"
              top={4}
              height="fit-content"
              maxHeight="calc(100vh - 2rem)"
              overflowY="auto"
              bg="whiteAlpha.200"
              backdropFilter="blur(8px)"
              borderRadius="xl"
              boxShadow="md"
              sx={{
                '&::-webkit-scrollbar': {
                  width: '6px',
                  borderRadius: '6px',
                  backgroundColor: 'whiteAlpha.100',
                },
                '&::-webkit-scrollbar-thumb': {
                  backgroundColor: 'whiteAlpha.300',
                  borderRadius: '6px',
                  '&:hover': {
                    backgroundColor: 'whiteAlpha.400',
                  },
                },
              }}
            >
              <Box p={5}>
                <Text fontWeight="semibold" fontSize="md" letterSpacing="wide" mb={3}>
                  ✍️ Session Notes
                </Text>
                <VStack align="stretch" spacing={3}>
                  {sortedNotes.map((note, index) => (
                    <Box 
                      key={index} 
                      p={3}
                      bg="whiteAlpha.200"
                      borderRadius="xl"
                      position="relative"
                      transition="all 0.2s"
                      _hover={{
                        bg: "whiteAlpha.300",
                        transform: "translateY(-1px)",
                        boxShadow: "md"
                      }}
                      boxShadow="sm"
                    >
                      <Grid templateColumns="1fr auto" gap={3} alignItems="start">
                        <Box>
                          <Text 
                            fontWeight="semibold" 
                            color="white"
                            mb={1}
                            fontSize="sm"
                            letterSpacing="wide"
                          >
                            {format(parseISO(note.date + 'T00:00:00'), 'MMMM d, yyyy')}
                          </Text>
                          <Text color="whiteAlpha.900" fontSize="xs">{note.note}</Text>
                        </Box>
                        <Flex gap={2}>
                          <IconButton
                            icon={<EditIcon />}
                            aria-label="Edit note"
                            size="sm"
                            onClick={() => handleEditNote(note)}
                            variant="ghost"
                            color="white"
                            _hover={{ bg: "whiteAlpha.300" }}
                            borderRadius="lg"
                            transition="all 0.2s"
                          />
                          <IconButton
                            icon={<DeleteIcon />}
                            aria-label="Remove date"
                            size="sm"
                            onClick={() => handleDeleteDate(note.date)}
                            variant="ghost"
                            color="white"
                            _hover={{ bg: "whiteAlpha.300" }}
                            borderRadius="lg"
                            transition="all 0.2s"
                          />
                        </Flex>
                      </Grid>
                    </Box>
                  ))}
                </VStack>
              </Box>
            </Box>
          )}

          {sortedNotes.length === 0 && (
            <Box 
              display={{ base: "none", lg: "block" }}
              position="sticky"
              top={4}
              height="fit-content"
              maxHeight="calc(100vh - 2rem)"
              overflowY="auto"
              bg="whiteAlpha.200"
              backdropFilter="blur(8px)"
              borderRadius="xl"
              boxShadow="md"
              sx={{
                '&::-webkit-scrollbar': {
                  width: '6px',
                  borderRadius: '6px',
                  backgroundColor: 'whiteAlpha.100',
                },
                '&::-webkit-scrollbar-thumb': {
                  backgroundColor: 'whiteAlpha.300',
                  borderRadius: '6px',
                  '&:hover': {
                    backgroundColor: 'whiteAlpha.400',
                  },
                },
              }}
            >
              <Box p={5}>
                <Text fontWeight="semibold" fontSize="md" letterSpacing="wide" mb={3}>
                  ✍️ Session Notes
                </Text>
                <Text color="whiteAlpha.700" fontSize="sm">
                  No notes yet. Start logging your sessions to see them here.
                </Text>
              </Box>
            </Box>
          )}
        </Grid>
      </Box>

      <Modal isOpen={isOpen && !isAnimating} onClose={onClose}>
        <ModalOverlay backdropFilter="blur(8px)" bg="blackAlpha.600" />
        <ModalContent bg="blue.900" borderRadius="xl" mx={3}>
          <ModalHeader bgGradient="linear(to-r, blue.400, blue.600)" color="white" borderTopRadius="xl">Edit Note</ModalHeader>
          <ModalCloseButton color="white" />
          <ModalBody p={5}>
            <Text fontWeight="semibold" mb={2} color="white" letterSpacing="wide">
              {editingNote && format(new Date(editingNote.date), 'MMMM d, yyyy')}
            </Text>
            <Textarea
              value={editingNote?.note || ''}
              onChange={(e) => setEditingNote(prev => prev ? { ...prev, note: e.target.value } : null)}
              rows={3}
              bg="whiteAlpha.200"
              color="white"
              borderColor="whiteAlpha.300"
              borderRadius="xl"
              _hover={{ borderColor: "whiteAlpha.400" }}
              _focus={{ 
                borderColor: "whiteAlpha.500",
                boxShadow: "0 0 0 1px rgba(255, 255, 255, 0.5)"
              }}
              _placeholder={{ color: "whiteAlpha.600" }}
              fontSize={{ base: "xs", md: "sm" }}
              resize="vertical"
            />
          </ModalBody>
          <ModalFooter bg="whiteAlpha.100" borderBottomRadius="xl" gap={2}>
            <Button variant="ghost" onClick={onClose} color="white" _hover={{ bg: "whiteAlpha.200" }}>
              Cancel
            </Button>
            <Button 
              onClick={handleSaveEdit}
              bgGradient="linear(to-r, blue.400, blue.600)"
              color="white"
              _hover={{
                bgGradient: "linear(to-r, blue.500, blue.700)",
              }}
              _active={{
                bgGradient: "linear(to-r, blue.600, blue.800)",
              }}
            >
              Save Changes
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={showDeleteModal && !isAnimating} onClose={() => setShowDeleteModal(false)}>
        <ModalOverlay backdropFilter="blur(8px)" bg="blackAlpha.600" />
        <ModalContent bg="blue.900" borderRadius="xl" mx={3}>
          <ModalHeader color="red.400" borderTopRadius="xl">Remove Logged Date</ModalHeader>
          <ModalCloseButton color="white" />
          <ModalBody p={5}>
            <Text color="white" fontSize="sm" letterSpacing="wide">
              Are you sure you want to remove{' '}
              <Text as="span" fontWeight="semibold">
                {dateToDelete && format(parseISO(dateToDelete + 'T00:00:00'), 'MMMM d, yyyy')}
              </Text>?
              This will also remove any associated notes.
            </Text>
          </ModalBody>
          <ModalFooter bg="whiteAlpha.100" borderBottomRadius="xl" gap={2}>
            <Button variant="ghost" onClick={() => setShowDeleteModal(false)} color="white" _hover={{ bg: "whiteAlpha.200" }}>
              Cancel
            </Button>
            <Button 
              onClick={confirmDelete}
              bg="red.500"
              color="white"
              _hover={{ bg: "red.600" }}
              _active={{ bg: "red.700" }}
            >
              Remove Date
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={showResetModal && !isAnimating} onClose={() => setShowResetModal(false)}>
        <ModalOverlay backdropFilter="blur(8px)" bg="blackAlpha.600" />
        <ModalContent bg="blue.900" borderRadius="xl" mx={3}>
          <ModalHeader color="red.400" borderTopRadius="xl">Reset Challenge</ModalHeader>
          <ModalCloseButton color="white" />
          <ModalBody p={5}>
            <Text fontWeight="semibold" mb={2} color="white" letterSpacing="wide">
              Are you sure you want to reset the challenge?
            </Text>
            <Text color="whiteAlpha.900">
              This will delete all your progress, completed dates, and notes. This action cannot be undone.
            </Text>
          </ModalBody>
          <ModalFooter bg="whiteAlpha.100" borderBottomRadius="xl" gap={2}>
            <Button variant="ghost" onClick={() => setShowResetModal(false)} color="white" _hover={{ bg: "whiteAlpha.200" }}>
              Cancel
            </Button>
            <Button 
              onClick={confirmReset}
              bg="red.500"
              color="white"
              _hover={{ bg: "red.600" }}
              _active={{ bg: "red.700" }}
            >
              Reset Challenge
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={isPastDateOpen && !isAnimating} onClose={onPastDateClose}>
        <ModalOverlay backdropFilter="blur(8px)" bg="blackAlpha.600" />
        <ModalContent bg="blue.900" borderRadius="xl" mx={3}>
          <ModalHeader bgGradient="linear(to-r, blue.400, blue.600)" color="white" borderTopRadius="xl">Log Past Date</ModalHeader>
          <ModalCloseButton color="white" />
          <ModalBody p={5}>
            <VStack spacing={3} align="stretch">
              <Box>
                <Text fontWeight="semibold" mb={1} color="white" letterSpacing="wide">
                  Select Date
                </Text>
                <Input
                  type="date"
                  value={selectedPastDate}
                  onChange={(e) => setSelectedPastDate(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  min={challengeData.startDate}
                  bg="whiteAlpha.200"
                  color="white"
                  borderColor="whiteAlpha.300"
                  borderRadius="xl"
                  _hover={{ borderColor: "whiteAlpha.400" }}
                  _focus={{ 
                    borderColor: "whiteAlpha.500",
                    boxShadow: "0 0 0 1px rgba(255, 255, 255, 0.5)"
                  }}
                />
              </Box>
              <Box>
                <Text fontWeight="semibold" mb={1} color="white" letterSpacing="wide">
                  Add Note (Optional)
                </Text>
                <Textarea
                  value={pastDateNote}
                  onChange={(e) => setPastDateNote(e.target.value)}
                  placeholder="How was your cold shower experience on this day?"
                  rows={3}
                  bg="whiteAlpha.200"
                  color="white"
                  borderColor="whiteAlpha.300"
                  borderRadius="xl"
                  _hover={{ borderColor: "whiteAlpha.400" }}
                  _focus={{ 
                    borderColor: "whiteAlpha.500",
                    boxShadow: "0 0 0 1px rgba(255, 255, 255, 0.5)"
                  }}
                  _placeholder={{ color: "whiteAlpha.600" }}
                  fontSize={{ base: "xs", md: "sm" }}
                  resize="vertical"
                />
              </Box>
            </VStack>
          </ModalBody>
          <ModalFooter bg="whiteAlpha.100" borderBottomRadius="xl" gap={2}>
            <Button variant="ghost" onClick={onPastDateClose} color="white" _hover={{ bg: "whiteAlpha.200" }}>
              Cancel
            </Button>
            <Button 
              onClick={handleLogPastDate}
              bgGradient="linear(to-r, blue.400, blue.600)"
              color="white"
              isDisabled={!selectedPastDate}
              _hover={{
                bgGradient: "linear(to-r, blue.500, blue.700)",
              }}
              _active={{
                bgGradient: "linear(to-r, blue.600, blue.800)",
              }}
            >
              Log Date
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={showDurationModal && !isAnimating} onClose={() => setShowDurationModal(false)}>
        <ModalOverlay backdropFilter="blur(8px)" bg="blackAlpha.600" />
        <ModalContent bg="blue.900" borderRadius="xl" mx={3}>
          <ModalHeader bgGradient="linear(to-r, blue.400, blue.600)" color="white" borderTopRadius="xl">
            Change Challenge Duration
          </ModalHeader>
          <ModalCloseButton color="white" />
          <ModalBody p={5}>
            <VStack spacing={3} align="stretch">
              <Box>
                <Text fontWeight="semibold" mb={1} color="white" letterSpacing="wide">
                  Number of Days
                </Text>
                <NumberInput
                  value={newDuration}
                  onChange={(_, value) => setNewDuration(value)}
                  min={completedDays}
                  max={365}
                  bg="whiteAlpha.200"
                  borderRadius="xl"
                >
                  <NumberInputField
                    color="white"
                    borderColor="whiteAlpha.300"
                    _hover={{ borderColor: "whiteAlpha.400" }}
                    _focus={{ 
                      borderColor: "blue.400",
                      boxShadow: "0 0 0 1px rgba(66, 153, 225, 0.6)"
                    }}
                  />
                  <NumberInputStepper>
                    <NumberIncrementStepper color="white" borderColor="whiteAlpha.300" />
                    <NumberDecrementStepper color="white" borderColor="whiteAlpha.300" />
                  </NumberInputStepper>
                </NumberInput>
                {completedDays > 0 && (
                  <Text fontSize="xs" color="whiteAlpha.700" mt={1}>
                    Minimum duration is set to {completedDays} days (your completed days)
                  </Text>
                )}
              </Box>
            </VStack>
          </ModalBody>
          <ModalFooter bg="whiteAlpha.100" borderBottomRadius="xl" gap={2}>
            <Button variant="ghost" onClick={() => setShowDurationModal(false)} color="white" _hover={{ bg: "whiteAlpha.200" }}>
              Cancel
            </Button>
            <Button 
              onClick={handleDurationChange}
              bgGradient="linear(to-r, blue.400, blue.600)"
              color="white"
              _hover={{
                bgGradient: "linear(to-r, blue.500, blue.700)",
              }}
              _active={{
                bgGradient: "linear(to-r, blue.600, blue.800)",
              }}
            >
              Update Duration
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <EmotionGlobal
        styles={{
          '.confetti-container': {
            position: 'fixed',
            pointerEvents: 'none',
            width: '100%',
            height: '100%',
            top: 0,
            left: 0,
            zIndex: 999999
          },
          '@keyframes shine': {
            '0%': { transform: 'translateX(-100%)' },
            '100%': { transform: 'translateX(100%)' }
          },
          '@keyframes glow': {
            '0%': { boxShadow: '0 0 5px rgba(0, 0, 0, 0.2)' },
            '100%': { boxShadow: '0 0 20px rgba(0, 0, 0, 0.5)' }
          },
          '.snowflake': {
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 1,
            pointerEvents: 'none',
            animation: 'fall 20s ease infinite alternate',
            opacity: 0.7,
          },
          '@keyframes fall': {
            '0%': { transform: 'translateY(-10%) translateX(0)' },
            '100%': { transform: 'translateY(110%) translateX(50px)' }
          }
        }}
      />

      {Array.from({ length: 50 }).map((_, index) => (
        <Box
          key={index}
          className="snowflake"
          style={{
            left: `${Math.random() * 100}vw`,
            fontSize: `${Math.random() * 20 + 20}px`,
            animationDelay: `${Math.random() * 10}s`,
          }}
        >
          ❄️
        </Box>
      ))}
    </Box>
  )
}

export default ChallengeTracker 