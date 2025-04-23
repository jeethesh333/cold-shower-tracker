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
  NumberDecrementStepper,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Switch,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  HStack,
} from '@chakra-ui/react'
import { Global as EmotionGlobal } from '@emotion/react'
import { useState, useEffect, useRef, lazy, Suspense } from 'react'
import { differenceInDays, format, isAfter, isBefore, parseISO } from 'date-fns'
import { DeleteIcon, EditIcon, CalendarIcon, SettingsIcon, CloseIcon, RepeatIcon } from '@chakra-ui/icons'
import ChallengeGrid from './ChallengeGrid'
import confetti from "canvas-confetti"
import SnowfallEffect from './SnowfallEffect'
import { FaSnowflake } from 'react-icons/fa'
import ChatAssistant from './ChatAssistant'
import MilestoneDisplay from './MilestoneDisplay'
import { ChallengeData } from '../types'

const ReactConfetti = lazy(() => import('react-confetti'))

interface ChallengeTrackerProps {
  challengeData: ChallengeData
  onUpdate: (data: ChallengeData) => void
  onReset: () => void
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

const getLevelInfo = (progress: number) => {
  if (progress >= 100) return { 
    label: 'Discipline Peak', 
    color: 'blue.100', 
    description: 'Challenge completed! You\'ve mastered the cold.' 
  }
  if (progress >= 80) return { 
    label: 'Mind Ice', 
    color: 'blue.200', 
    description: 'Almost there! Your resilience is remarkable.' 
  }
  if (progress >= 60) return { 
    label: 'Frozen Focus', 
    color: 'blue.300', 
    description: 'Strong progress! Keep pushing forward.' 
  }
  if (progress >= 40) return { 
    label: 'Cold Warrior', 
    color: 'blue.400', 
    description: 'You\'re building impressive momentum!' 
  }
  if (progress >= 20) return { 
    label: 'Frost Initiate', 
    color: 'blue.500', 
    description: 'You\'ve embraced the cold journey.' 
  }
  return { 
    label: 'Getting Started', 
    color: 'blue.600', 
    description: 'Beginning your transformation.' 
  }
}

const ChallengeTracker = ({ challengeData, onUpdate, onReset }: ChallengeTrackerProps) => {
  const [showConfetti, setShowConfetti] = useState(false)
  const [showSnowfall, setShowSnowfall] = useState(() => {
    const saved = localStorage.getItem('showSnowfall')
    return saved !== null ? JSON.parse(saved) : true
  })
  const [currentQuote, setCurrentQuote] = useState<{ text: string; author: string } | null>(null)
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  })
  const [note, setNote] = useState('')
  const { 
    isOpen: isPastDateOpen, 
    onOpen: onPastDateOpen,
    onClose: onPastDateClose 
  } = useDisclosure()
  const toast = useToast()
  const [selectedPastDate, setSelectedPastDate] = useState('')
  const [pastDateNote, setPastDateNote] = useState('')
  const [showResetModal, setShowResetModal] = useState(false)
  const [showDurationModal, setShowDurationModal] = useState(false)
  const [newDuration, setNewDuration] = useState(challengeData.days)
  const [isAnimating, setIsAnimating] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [editedNoteText, setEditedNoteText] = useState('')
  const cancelRef = useRef<HTMLButtonElement>(null)
  const [userName] = useState(() => {
    const titleCase = (str: string) => {
      return str
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
    };
    const saved = localStorage.getItem('userName');
    return saved ? titleCase(saved) : 'User';
  });
  const [dateFilter, setDateFilter] = useState<{
    startDate: string | null;
    endDate: string | null;
  }>({
    startDate: null,
    endDate: null,
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);

  // Get today's date in YYYY-MM-DD format
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = format(today, 'yyyy-MM-dd');

  // Update scroll behavior
  useEffect(() => {
    window.scrollTo(0, 0); // Remove behavior option since it's handled by CSS
  }, []); // Empty dependency array to only run once on mount

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

  useEffect(() => {
    localStorage.setItem('showSnowfall', JSON.stringify(showSnowfall))
  }, [showSnowfall])

  useEffect(() => {
    localStorage.setItem('userName', userName);
  }, [userName]);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(registration => {
        registration.addEventListener('controllerchange', () => {
          // New service worker activated
          setUpdateAvailable(true);
        });
      });

      // Check for updates
      navigator.serviceWorker.getRegistration().then(registration => {
        if (registration) {
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  setUpdateAvailable(true);
                }
              });
            }
          });
        }
      });
    }
  }, []);

  const completedDays = challengeData.completedDays.length
  const progress = (completedDays / challengeData.days) * 100
  const daysLeft = challengeData.days - completedDays
  const currentStreak = calculateStreak(challengeData.completedDays)

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
        zIndex: 1100,
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
        zIndex: 1110,
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
        zIndex: 1120,
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
    if (challengeData.completedDays.includes(localDate)) {
      toast({
        title: "Already logged",
        description: "You've already logged a session for today!",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsAnimating(true);
    
    // Only show celebration for 100% completion
    const celebrations = [];
    
    // Check if challenge is completed
    if (progress === 100) {
      celebrations.push({
        title: "🎉 LEGENDARY ACHIEVEMENT! 🎉",
        message: "You've completed the entire challenge! You're truly a master of cold showers!"
      });
      
      // Show celebration popup only for 100% completion
      celebrations.forEach((celebration) => {
        toast({
          title: celebration.title,
          description: celebration.message,
          status: "success",
          duration: 5000,
          isClosable: true,
          position: "top",
        });
      });
    }

    const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
    setCurrentQuote(randomQuote);
    setShowConfetti(true);
    triggerConfetti();

    // Scroll to top with multiple methods for cross-browser compatibility
    const scrollOptions = {
      top: 0,
      behavior: 'smooth' as const
    };

    // Try different scrolling methods
    if (document.scrollingElement) {
      document.scrollingElement.scrollTo(scrollOptions);
    }
    if (document.documentElement) {
      document.documentElement.scrollTo(scrollOptions);
    }
    if (document.body) {
      document.body.scrollTo(scrollOptions);
    }
    window.scrollTo(scrollOptions);

    setTimeout(() => {
      setShowConfetti(false);
      setIsAnimating(false);
    }, 5000);

    const now = new Date().toISOString();
    onUpdate({
      ...challengeData,
      completedDays: [...challengeData.completedDays, localDate],
      notes: {
        ...challengeData.notes,
        [localDate]: {
          date: localDate,
          note: note || '',
          createdAt: now,
          updatedAt: now
        }
      },
    });

    setNote('');
  };

  const handleEditNote = (date: string, note: string) => {
    setSelectedDate(date);
    setEditedNoteText(note);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = () => {
    if (!selectedDate) return;

    const updatedNotes = { ...challengeData.notes };
    const existingNote = updatedNotes[selectedDate];
    
    // If the note hasn't changed, just close the modal
    if (existingNote.note === editedNoteText) {
      setIsEditModalOpen(false);
      setSelectedDate(null);
      setEditedNoteText('');
      return;
    }

    updatedNotes[selectedDate] = {
      date: selectedDate,
      note: editedNoteText,
      createdAt: existingNote?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onUpdate({
      ...challengeData,
      notes: updatedNotes
    });

    setIsEditModalOpen(false);
    setSelectedDate(null);
    setEditedNoteText('');

    toast({
      title: "Note updated",
      status: "success",
      duration: 2000,
      isClosable: true,
    });
  };

  const handleDeleteNote = (date: string) => {
    setSelectedDate(date);
    setIsDeleteAlertOpen(true);
  };

  const confirmDelete = () => {
    if (!selectedDate) return;

    const updatedCompletedDays = challengeData.completedDays.filter(
      date => date !== selectedDate
    );
    const updatedNotes = { ...challengeData.notes };
    delete updatedNotes[selectedDate];

    onUpdate({
      ...challengeData,
      completedDays: updatedCompletedDays,
      notes: updatedNotes
    });

    setIsDeleteAlertOpen(false);
    setSelectedDate(null);

    toast({
      title: "Entry deleted",
      status: "info",
      duration: 2000,
      isClosable: true,
    });
  };

  const handleLogPastDate = () => {
    const pastDate = selectedPastDate;
    const startDateObj = parseISO(challengeData.startDate);
    const selectedDateObj = parseISO(pastDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endDateObj = new Date(startDateObj);
    endDateObj.setDate(endDateObj.getDate() + challengeData.days - 1);

    if (isBefore(selectedDateObj, startDateObj)) {
      toast({
        title: "Invalid date",
        description: "Cannot log dates before the challenge start date",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (isAfter(selectedDateObj, today)) {
      toast({
        title: "Invalid date",
        description: "Cannot log future dates",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (isAfter(selectedDateObj, endDateObj)) {
      toast({
        title: "Invalid date",
        description: "Cannot log dates after the challenge end date",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (challengeData.completedDays.includes(pastDate)) {
      toast({
        title: "Already logged",
        description: "This date has already been logged",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const now = new Date().toISOString();
    onUpdate({
      ...challengeData,
      completedDays: [...challengeData.completedDays, pastDate],
      notes: {
        ...challengeData.notes,
        [pastDate]: {
          date: pastDate,
          note: pastDateNote || '',
          createdAt: now,
          updatedAt: now
        }
      },
    });

    toast({
      title: "Past date logged",
      description: `Successfully logged ${format(selectedDateObj, 'MMMM d, yyyy')}`,
      status: "success",
      duration: 3000,
      isClosable: true,
    });

    setSelectedPastDate('');
    setPastDateNote('');
    onPastDateClose();
  };

  const handleReset = async () => {
    setIsAnimating(true);
    try {
      // Save the current snowfall setting
      const snowfallSetting = localStorage.getItem('showSnowfall');
      
      // Clear all data
      localStorage.clear();
      
      // Restore the snowfall setting
      if (snowfallSetting !== null) {
        localStorage.setItem('showSnowfall', snowfallSetting);
      } else {
        localStorage.setItem('showSnowfall', 'true');
      }
      
      onReset();
    } finally {
      setIsAnimating(false);
      setShowResetModal(false);
    }
  };

  const handleDurationChange = () => {
    if (newDuration < 10) {
      toast({
        title: "Invalid duration",
        description: "Challenge duration must be at least 10 days",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (newDuration > 365) {
      toast({
        title: "Invalid duration",
        description: "Challenge duration cannot exceed 365 days",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (newDuration < completedDays) {
      toast({
        title: "Invalid duration",
        description: "New duration cannot be less than completed days",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    onUpdate({
      ...challengeData,
      days: newDuration
    });

    toast({
      title: "Challenge duration updated",
      description: `Challenge duration is now set to ${newDuration} days`,
      status: "success",
      duration: 3000,
      isClosable: true,
    });

    setShowDurationModal(false);
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return format(date, 'MM/dd/yy h:mm a');
  };

  const formatDate = (date: string) => {
    return format(parseISO(date), 'MM/dd/yy');
  };

  const sortedNotes = Object.entries(challengeData.notes)
    .map(([date, noteData]) => ({
      ...noteData,
      date
    }))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const normalizeDate = (dateString: string) => {
    const date = new Date(dateString);
    date.setHours(0, 0, 0, 0);
    return date;
  };

  const isDateInRange = (date: string, startDate: string | null, endDate: string | null) => {
    if (!startDate && !endDate) return true;

    const noteDate = normalizeDate(date);
    
    if (startDate && endDate) {
      const start = normalizeDate(startDate);
      const end = normalizeDate(endDate);
      return noteDate >= start && noteDate <= end;
    }
    
    if (startDate) {
      const start = normalizeDate(startDate);
      return noteDate >= start;
    }
    
    if (endDate) {
      const end = normalizeDate(endDate);
      return noteDate <= end;
    }
    
    return true;
  };

  const filteredNotes = sortedNotes.filter(noteData => 
    isDateInRange(noteData.date, dateFilter.startDate, dateFilter.endDate)
  );

  const levelInfo = getLevelInfo(progress)

  const handleForceUpdate = () => {
    setIsUpdating(true);
    // Clear cache
    if ('caches' in window) {
      caches.keys().then((names) => {
        names.forEach(name => {
          caches.delete(name);
        });
      });
    }
    // Force reload
    window.location.reload();
  };

  return (
    <Box position="relative">
      {showConfetti && (
        <Suspense fallback={null}>
          <ReactConfetti
            width={windowSize.width}
            height={windowSize.height}
            recycle={false}
            numberOfPieces={500}
            gravity={0.15}
          />
        </Suspense>
      )}
      
      {showConfetti && currentQuote && (
        <Box
          position="fixed"
          top="0"
          left="0"
          right="0"
          bottom="0"
          display="flex"
          alignItems="center"
          justifyContent="center"
          zIndex={1200}
          backdropFilter="blur(4px)"
          bg="rgba(0,0,0,0.2)"
          pointerEvents="none"
        >
          <VStack spacing={6} p={6} maxW="90vw" textAlign="center">
            <Text
              fontSize={{ base: "4xl", md: "6xl", lg: "7xl" }}
              fontWeight="bold"
              color="white"
              textShadow="0 2px 10px rgba(0,0,0,0.5)"
              lineHeight="1.2"
              letterSpacing="wide"
            >
              ✨ Great job! ✨
            </Text>
            <Text
              fontSize={{ base: "lg", md: "2xl" }}
              fontWeight="medium"
              color="white"
              textShadow="0 1px 4px rgba(0,0,0,0.3)"
              fontStyle="italic"
              lineHeight="1.4"
            >
              "{currentQuote.text}"
            </Text>
          </VStack>
        </Box>
      )}

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

      <Box
        width="100vw"
        minHeight="100vh"
        bgGradient="linear(135deg, blue.900 0%, blue.700 50%, blue.600 100%)"
        py={0}
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
        sx={{
          scrollBehavior: 'instant',
          '&::before': {
            content: '""',
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.05)',
            pointerEvents: 'none',
            zIndex: 0
          }
        }}
      >
        <EmotionGlobal
          styles={{
            'input, textarea, select, button': {
              fontSize: '16px',
            },
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
            }
          }}
        />

        <Box
          position="fixed"
          top={4}
          right={4}
          zIndex={1000}
        >
          <Menu>
            <Tooltip label="Preferences" placement="left">
              <MenuButton
                as={IconButton}
                icon={<SettingsIcon />}
                variant="ghost"
                color="white"
                _hover={{
                  bg: "whiteAlpha.200"
                }}
                backdropFilter="blur(8px)"
              />
            </Tooltip>
            <MenuList bg="blue.800" borderColor="whiteAlpha.200">
              <MenuItem 
                bg="transparent" 
                _hover={{ bg: "whiteAlpha.200" }}
                onClick={() => setShowSnowfall((prev: boolean) => !prev)}
              >
                <Flex align="center" justify="space-between" width="100%">
                  <Flex align="center" gap={2}>
                    <FaSnowflake />
                    <Text>Snowfall Effect</Text>
                  </Flex>
                  <Switch 
                    isChecked={showSnowfall}
                    colorScheme="blue"
                    size="md"
                  />
                </Flex>
              </MenuItem>
            </MenuList>
          </Menu>
        </Box>

        <SnowfallEffect 
          isEnabled={showSnowfall} 
          onToggle={() => setShowSnowfall((prev: boolean) => !prev)} 
        />

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
                bgGradient="linear(to-r, blue.50, white)"
                bgClip="text"
                mb={{ base: 2, md: 3 }}
                letterSpacing="tight"
                fontWeight="extrabold"
                filter="drop-shadow(0 2px 4px rgba(0,0,0,0.1))"
              >
                ❄️ Cold Shower Challenge
              </Heading>
              <Text 
                fontSize={{ base: "sm", md: "md" }}
                fontWeight="medium"
                color="whiteAlpha.900"
                letterSpacing="wide"
                textShadow="0 1px 2px rgba(0,0,0,0.1)"
              >
                Let's do this{challengeData.userName && challengeData.userName !== 'User' ? `, ${challengeData.userName}` : ''}! 
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
                  bg="whiteAlpha.100"
                  backdropFilter="blur(8px)"
                  boxShadow="0 4px 6px rgba(0, 0, 0, 0.1)"
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
                    bgGradient: currentStreak >= 10 ? "linear(to-r, blue.200, blue.500, purple.500)" : "linear(to-br, whiteAlpha.50, transparent)",
                    opacity: currentStreak >= 10 ? 0.8 : 0,
                    transition: "opacity 0.3s",
                    animation: currentStreak >= 10 ? "glow 1.5s infinite alternate" : "none",
                    borderRadius: "xl",
                    zIndex: -1
                  }}
                  _hover={{
                    transform: "translateY(-2px)",
                    boxShadow: "0 6px 8px rgba(0, 0, 0, 0.15)",
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
                  bg="whiteAlpha.100"
                  backdropFilter="blur(8px)"
                  boxShadow="0 4px 6px rgba(0, 0, 0, 0.1)"
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
                    bgGradient: "linear(to-br, whiteAlpha.50, transparent)",
                    opacity: 0,
                    transition: "opacity 0.3s"
                  }}
                  _hover={{
                    transform: "translateY(-2px)",
                    boxShadow: "0 6px 8px rgba(0, 0, 0, 0.15)",
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
                  bg="whiteAlpha.100"
                  backdropFilter="blur(8px)"
                  boxShadow="0 4px 6px rgba(0, 0, 0, 0.1)"
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
                    bgGradient: "linear(to-br, whiteAlpha.50, transparent)",
                    opacity: 0,
                    transition: "opacity 0.3s"
                  }}
                  _hover={{
                    transform: "translateY(-2px)",
                    boxShadow: "0 6px 8px rgba(0, 0, 0, 0.15)",
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
                bg="whiteAlpha.100"
                backdropFilter="blur(8px)"
                p={{ base: 4, md: 5 }}
                borderRadius="xl"
                boxShadow="0 4px 6px rgba(0, 0, 0, 0.1)"
                position="relative"
                overflow="hidden"
                _before={{
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  bgGradient: "linear(to-br, whiteAlpha.50, transparent)",
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
                        progress >= 100 ? "linear(to-r, blue.200, blue.400)" :
                        progress >= 75 ? "linear(to-r, cyan.200, cyan.400)" :
                        progress >= 50 ? "linear(to-r, green.200, green.400)" :
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
                  bg="whiteAlpha.100"
                  borderRadius="full"
                  overflow="hidden"
                  position="relative"
                  boxShadow="inset 0 1px 2px rgba(0,0,0,0.1)"
                >
                  <Tooltip
                    label={
                      <Box p={2}>
                        <Text fontWeight="bold" color={levelInfo.color} mb={1}>
                          {levelInfo.label}
                        </Text>
                        <Text fontSize="sm" color="white">
                          {levelInfo.description}
                        </Text>
                        <Text fontSize="xs" color="whiteAlpha.800" mt={1}>
                          Progress: {Math.round(progress)}%
                        </Text>
                        {currentStreak > 0 && (
                          <Text fontSize="xs" color="whiteAlpha.800">
                            Current Streak: {currentStreak} days
                          </Text>
                        )}
                      </Box>
                    }
                    placement="top"
                    hasArrow
                    bg="rgba(0, 0, 0, 0.8)"
                    borderRadius="md"
                    px={3}
                    py={2}
                  >
                    <Box
                      width={`${progress}%`}
                      height="100%"
                      bgGradient={
                        progress >= 100 ? "linear(to-r, blue.200, blue.400)" :
                        progress >= 75 ? "linear(to-r, cyan.200, cyan.400)" :
                        progress >= 50 ? "linear(to-r, green.200, green.400)" :
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
                  </Tooltip>
                </Box>
                <Grid templateColumns={{ base: "repeat(2, 1fr)", md: "repeat(2, 1fr)" }} gap={3} mt={4}>
                  <Box>
                    <Text fontWeight="medium" color="whiteAlpha.700" fontSize="xs" mb={1} letterSpacing="wide">Start Date</Text>
                    <Text fontWeight="semibold" color="white" fontSize={{ base: "xs", md: "sm" }}>
                      {format(new Date(challengeData.startDate + 'T00:00:00'), 'MM/dd/yy')}
                    </Text>
                  </Box>
                  <Box textAlign="right">
                    <Text fontWeight="medium" color="whiteAlpha.700" fontSize="xs" mb={1} letterSpacing="wide">End Date</Text>
                    <Text fontWeight="semibold" color="white" fontSize={{ base: "xs", md: "sm" }}>
                      {format(
                        new Date(new Date(challengeData.startDate + 'T00:00:00').setDate(
                          new Date(challengeData.startDate + 'T00:00:00').getDate() + challengeData.days - 1
                        )),
                        'MM/dd/yy'
                      )}
                    </Text>
                  </Box>
                </Grid>
              </Box>

              <MilestoneDisplay currentProgress={progress} />

              <ChallengeGrid 
                challengeData={challengeData}
                onEditNote={handleEditNote}
                onDeleteDate={handleDeleteNote}
              />

              <Box 
                width="100%" 
                bg="whiteAlpha.100"
                backdropFilter="blur(8px)"
                p={{ base: 4, md: 5 }}
                borderRadius="xl"
                boxShadow="0 4px 6px rgba(0, 0, 0, 0.1)"
                position="relative"
                transition="all 0.3s"
                _hover={{
                  boxShadow: "0 6px 8px rgba(0, 0, 0, 0.15)",
                  transform: "translateY(-1px)"
                }}
              >
                <Flex justify="space-between" align="center" mb={3}>
                  <Text fontWeight="semibold" color="white" fontSize={{ base: "sm", md: "md" }} letterSpacing="wide">
                    Today's Note
                  </Text>
                </Flex>
                <Box
                  position="relative"
                  transition="all 0.3s"
                >
                  <Textarea
                    value={note}
                    onChange={(e) => {
                      setNote(e.target.value);
                    }}
                    placeholder="How was your cold shower experience today? Share your thoughts, feelings, and any breakthroughs..."
                    minH={{ base: "80px", md: "80px" }}
                    maxH="240px"
                    bg="whiteAlpha.100"
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
                      fontStyle: "italic",
                      fontSize: { base: "xs", md: "sm" }
                    }}
                    fontSize={{ base: "md", md: "sm" }}
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
                    boxShadow: "0 6px 8px rgba(0, 0, 0, 0.15)"
                  }}
                  _active={{
                    transform: "translateY(0)",
                    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)"
                  }}
                  transition="all 0.2s"
                  boxShadow="0 4px 6px rgba(0, 0, 0, 0.1)"
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
                    boxShadow: "0 6px 8px rgba(0, 0, 0, 0.15)"
                  }}
                  _active={{
                    transform: "translateY(0)",
                    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)"
                  }}
                  transition="all 0.2s"
                  boxShadow="0 4px 6px rgba(0, 0, 0, 0.1)"
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
                onClick={() => setShowResetModal(true)}
                borderColor="red.400"
                borderWidth="2px"
                color="red.400"
                _hover={{
                  bg: "rgba(255, 0, 0, 0.1)",
                  transform: "translateY(-1px)",
                  boxShadow: "0 6px 8px rgba(0, 0, 0, 0.15)"
                }}
                _active={{
                  transform: "translateY(0)",
                  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)"
                }}
                transition="all 0.2s"
                boxShadow="0 4px 6px rgba(0, 0, 0, 0.1)"
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
                display={{ base: "block", md: "block", lg: "block" }}
                position={{ base: "relative", lg: "sticky" }}
                top={4}
                height="fit-content"
                maxHeight={{ base: "400px", lg: "calc(100vh - 2rem)" }}
                overflowY="auto"
                bg={{ base: "whiteAlpha.100", lg: "whiteAlpha.100" }}
                backdropFilter="blur(8px)"
                borderRadius="xl"
                boxShadow="0 4px 6px rgba(0, 0, 0, 0.1)"
                mt={{ base: 4, lg: 0 }}
                width="100%"
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
                <Box
                  position="sticky"
                  top={0}
                  zIndex={2}
                  bg="rgba(49, 130, 206, 0.97)"
                  backdropFilter="blur(8px)"
                  borderTopRadius="xl"
                  borderBottom="1px solid"
                  borderColor="whiteAlpha.200"
                  p={{ base: 3, md: 5 }}
                  width="100%"
                  sx={{
                    '@supports (backdrop-filter: blur(8px))': {
                      bg: 'rgba(49, 130, 206, 0.85)',
                      backdropFilter: 'blur(8px)'
                    },
                    '@supports not (backdrop-filter: blur(8px))': {
                      bg: 'rgba(49, 130, 206, 0.97)'
                    }
                  }}
                >
                  <VStack align="stretch" spacing={4}>
                    <Text fontWeight="semibold" fontSize="md" letterSpacing="wide">
                      ✍️ Session Notes
                    </Text>
                    <Box
                      bg="whiteAlpha.200"
                      p={{ base: 2, md: 4 }}
                      borderRadius="xl"
                      borderWidth="0.5px"
                      borderColor="whiteAlpha.300"
                      position="relative"
                      overflow="hidden"
                      transition="all 0.2s"
                      _hover={{
                        borderColor: "whiteAlpha.400",
                        bg: "whiteAlpha.300",
                        transform: "translateY(-1px)",
                        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                        _before: {
                          opacity: 1
                        }
                      }}
                      _before={{
                        content: '""',
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        bgGradient: "linear(to-br, whiteAlpha.50, transparent)",
                        opacity: 0,
                        transition: "opacity 0.3s"
                      }}
                    >
                      <HStack spacing={{ base: 2, md: 4 }} align="center" flexWrap="nowrap">
                        <Box flex="1">
                          <Text fontSize="xs" color="whiteAlpha.700" mb={1} fontWeight="medium">
                            Start Date
                          </Text>
                          <Input
                            type="date"
                            width="100%"
                            minW={{ base: "120px", md: "initial" }}
                            px={{ base: 2, md: 4 }}
                            whiteSpace="nowrap"
                            bg="whiteAlpha.100"
                            color="white"
                            borderRadius="lg"
                            borderWidth="0.5px"
                            borderColor="whiteAlpha.300"
                            fontSize={{ base: "md", md: "sm" }}
                            _hover={{ borderColor: "whiteAlpha.400" }}
                            _focus={{
                              borderColor: "blue.400",
                              boxShadow: "0 0 0 1px rgba(66,153,225,0.6)"
                            }}
                            value={dateFilter.startDate || ''}
                            onChange={(e) => {
                              const newStartDate = e.target.value;
                              setDateFilter(prev => ({
                                ...prev,
                                startDate: newStartDate,
                                // Reset end date if it's before the new start date
                                endDate: prev.endDate && newStartDate && new Date(prev.endDate) < new Date(newStartDate) 
                                  ? newStartDate 
                                  : prev.endDate
                              }));
                            }}
                            max={dateFilter.endDate || undefined}
                          />
                        </Box>
                        <Box flex="1">
                          <Text fontSize="xs" color="whiteAlpha.700" mb={1} fontWeight="medium">
                            End Date
                          </Text>
                          <Input
                            type="date"
                            width="100%"
                            minW={{ base: "120px", md: "initial" }}
                            px={{ base: 2, md: 4 }}
                            whiteSpace="nowrap"
                            bg="whiteAlpha.100"
                            color="white"
                            borderRadius="lg"
                            borderWidth="0.5px"
                            borderColor="whiteAlpha.300"
                            fontSize={{ base: "md", md: "sm" }}
                            _hover={{ borderColor: "whiteAlpha.400" }}
                            _focus={{
                              borderColor: "blue.400",
                              boxShadow: "0 0 0 1px rgba(66,153,225,0.6)"
                            }}
                            value={dateFilter.endDate || ''}
                            onChange={(e) => {
                              setDateFilter(prev => ({
                                ...prev,
                                endDate: e.target.value
                              }));
                            }}
                            min={dateFilter.startDate || undefined}
                          />
                        </Box>
                        <IconButton
                          aria-label="Clear filter"
                          icon={<CloseIcon />}
                          size="sm"
                          onClick={() => setDateFilter({ startDate: null, endDate: null })}
                          variant="ghost"
                          color="white"
                          _hover={{ bg: "whiteAlpha.200", transform: "scale(1.05)" }}
                          isDisabled={!dateFilter.startDate && !dateFilter.endDate}
                          alignSelf="flex-end"
                          mb={1}
                          transition="all 0.2s"
                        />
                      </HStack>
                    </Box>
                  </VStack>
                </Box>
                <Box p={5}>
                  <VStack align="stretch" spacing={3} width="100%">
                    {filteredNotes.map((noteData, index) => (
                      <Box 
                        key={index} 
                        p={3}
                        bg="whiteAlpha.100"
                        borderRadius="xl"
                        position="relative"
                        transition="all 0.2s"
                        _hover={{
                          bg: "whiteAlpha.200",
                          transform: "translateY(-1px)",
                          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)"
                        }}
                        boxShadow="0 4px 6px rgba(0, 0, 0, 0.1)"
                        width="100%"
                      >
                        <VStack align="stretch" width="100%" spacing={2}>
                          <Flex justify="space-between" align="center" width="100%">
                            <Flex align="baseline" gap={3}>
                              <Text 
                                fontWeight="semibold" 
                                color="white"
                                fontSize="sm"
                                letterSpacing="wide"
                                flexShrink={0}
                              >
                                {formatDate(noteData.date)}
                              </Text>
                              <VStack align="flex-start" spacing={0}>
                                <Text 
                                  fontSize="xs" 
                                  color="whiteAlpha.600"
                                >
                                  Created on {formatTimestamp(noteData.createdAt)}
                                </Text>
                                {noteData.updatedAt !== noteData.createdAt && (
                                  <Text 
                                    fontSize="xs" 
                                    color="whiteAlpha.600"
                                  >
                                    Last edited on {formatTimestamp(noteData.updatedAt)}
                                  </Text>
                                )}
                              </VStack>
                            </Flex>
                            <Flex gap={2} flexShrink={0}>
                              <IconButton
                                icon={<EditIcon />}
                                aria-label="Edit note"
                                size="sm"
                                onClick={() => handleEditNote(noteData.date, noteData.note)}
                                variant="ghost"
                                color="white"
                                _hover={{ bg: "whiteAlpha.200" }}
                                borderRadius="lg"
                                transition="all 0.2s"
                              />
                              <IconButton
                                icon={<DeleteIcon />}
                                aria-label="Remove date"
                                size="sm"
                                onClick={() => handleDeleteNote(noteData.date)}
                                variant="ghost"
                                color="white"
                                _hover={{ bg: "whiteAlpha.200" }}
                                borderRadius="lg"
                                transition="all 0.2s"
                              />
                            </Flex>
                          </Flex>
                          <Text 
                            color="whiteAlpha.900" 
                            fontSize="xs" 
                            wordBreak="break-word"
                            whiteSpace="pre-wrap"
                            width="95%"
                            textAlign="justify"
                            ml="0"
                          >
                            {noteData.note}
                          </Text>
                        </VStack>
                      </Box>
                    ))}
                  </VStack>
                </Box>
              </Box>
            )}

            {sortedNotes.length === 0 && (
              <Box 
                display={{ base: "block", md: "block", lg: "block" }}
                position={{ base: "relative", lg: "sticky" }}
                top={4}
                height="fit-content"
                maxHeight={{ base: "400px", lg: "calc(100vh - 2rem)" }}
                overflowY="auto"
                bg={{ base: "whiteAlpha.100", lg: "whiteAlpha.100" }}
                backdropFilter="blur(8px)"
                borderRadius="xl"
                boxShadow="0 4px 6px rgba(0, 0, 0, 0.1)"
                mt={{ base: 4, lg: 0 }}
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

        <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}>
          <ModalOverlay backdropFilter="blur(8px)" bg="blackAlpha.600" />
          <ModalContent bg="blue.900" borderRadius="xl" mx={3}>
            <ModalHeader bgGradient="linear(to-r, blue.400, blue.600)" color="white" borderTopRadius="xl">Edit Note</ModalHeader>
            <ModalCloseButton color="white" />
            <ModalBody p={5}>
              <Text fontWeight="semibold" mb={2} color="white" letterSpacing="wide">
                {selectedDate && format(parseISO(selectedDate), 'MMMM d, yyyy')}
              </Text>
              <Textarea
                value={editedNoteText}
                onChange={(e) => setEditedNoteText(e.target.value)}
                placeholder="Enter your note"
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
                fontSize={{ base: "md", md: "sm" }}
                resize="vertical"
              />
            </ModalBody>
            <ModalFooter bg="whiteAlpha.100" borderBottomRadius="xl" gap={2}>
              <Button variant="ghost" onClick={() => setIsEditModalOpen(false)} color="white" _hover={{ bg: "whiteAlpha.200" }}>
                Cancel
              </Button>
              <Button 
                onClick={handleSaveEdit}
                bgGradient="linear(to-r, blue.400, blue.600)"
                color="white"
                isDisabled={!selectedDate || !editedNoteText.trim() || challengeData.notes[selectedDate]?.note === editedNoteText}
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

        <AlertDialog
          isOpen={isDeleteAlertOpen}
          leastDestructiveRef={cancelRef}
          onClose={() => setIsDeleteAlertOpen(false)}
        >
          <AlertDialogOverlay backdropFilter="blur(2px)" bg="blackAlpha.600">
            <AlertDialogContent
              bg="rgba(30, 64, 110, 0.45)"
              borderRadius="xl"
              borderColor="whiteAlpha.200"
              borderWidth="1px"
              boxShadow="0 8px 32px rgba(0, 0, 0, 0.2)"
              backdropFilter="blur(2px)"
              sx={{
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  borderRadius: 'xl',
                  background: 'linear-gradient(135deg, rgba(66, 153, 225, 0.08), rgba(49, 130, 206, 0.03))',
                  pointerEvents: 'none'
                }
              }}
            >
              <AlertDialogHeader fontSize="lg" fontWeight="bold" color="white">
                Delete Entry
              </AlertDialogHeader>
              <AlertDialogBody color="whiteAlpha.900">
                Are you sure you want to delete this entry? This action cannot be undone.
              </AlertDialogBody>
              <AlertDialogFooter gap={3}>
                <Button 
                  ref={cancelRef} 
                  onClick={() => setIsDeleteAlertOpen(false)}
                  variant="ghost"
                  color="white"
                  _hover={{ bg: "whiteAlpha.200" }}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={confirmDelete}
                  bgGradient="linear(to-r, red.500, red.600)"
                  color="white"
                  _hover={{
                    bgGradient: "linear(to-r, red.600, red.700)",
                  }}
                  _active={{
                    bgGradient: "linear(to-r, red.700, red.800)",
                  }}
                >
                  Delete
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialogOverlay>
        </AlertDialog>

        <Modal isOpen={showResetModal && !isAnimating} onClose={() => setShowResetModal(false)}>
          <ModalOverlay backdropFilter="blur(2px)" bg="blackAlpha.600" />
          <ModalContent 
            bg="rgba(30, 64, 110, 0.45)"
            borderRadius="xl"
            borderColor="whiteAlpha.200"
            borderWidth="1px"
            boxShadow="0 8px 32px rgba(0, 0, 0, 0.2)"
            backdropFilter="blur(2px)"
            mx={3}
            sx={{
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                borderRadius: 'xl',
                background: 'linear-gradient(135deg, rgba(66, 153, 225, 0.08), rgba(49, 130, 206, 0.03))',
                pointerEvents: 'none'
              }
            }}
          >
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
            <ModalFooter borderBottomRadius="xl" gap={2}>
              <Button variant="ghost" onClick={() => setShowResetModal(false)} color="white" _hover={{ bg: "whiteAlpha.200" }}>
                Cancel
              </Button>
              <Button 
                onClick={handleReset}
                bgGradient="linear(to-r, red.500, red.600)"
                color="white"
                _hover={{
                  bgGradient: "linear(to-r, red.600, red.700)",
                }}
                _active={{
                  bgGradient: "linear(to-r, red.700, red.800)",
                }}
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
                    onChange={(e) => {
                      if (e.target.value > todayStr) {
                        return;
                      }
                      setSelectedPastDate(e.target.value);
                    }}
                    max={todayStr}
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
                    fontSize={{ base: "md", md: "sm" }}
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
                    fontSize={{ base: "md", md: "sm" }}
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
                    onChange={(_, value) => setNewDuration(value || 0)}
                    min={Math.max(10, completedDays)}
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
                  <Text fontSize="xs" color="whiteAlpha.700" mt={1}>
                    Minimum duration is 10 days
                  </Text>
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

        <ChatAssistant
          streak={currentStreak}
          completedDays={completedDays}
          totalDays={challengeData.days}
          userName={userName}
          notes={challengeData.notes}
        />

        <Tooltip 
          label="Force update app" 
          placement="right"
          hasArrow
        >
          <IconButton
            aria-label="Force Update"
            icon={<RepeatIcon />}
            position="fixed"
            bottom={4}
            left={4}
            onClick={handleForceUpdate}
            isLoading={isUpdating}
            bgGradient="linear(to-r, blue.400, blue.600)"
            color="white"
            _hover={{
              bgGradient: "linear(to-r, blue.500, blue.700)",
              transform: "scale(1.05)"
            }}
            _active={{
              bgGradient: "linear(to-r, blue.600, blue.800)",
              transform: "scale(0.95)"
            }}
            boxShadow="0 4px 6px rgba(0, 0, 0, 0.1)"
            size="md"
            borderRadius="full"
            zIndex={1000}
          />
        </Tooltip>

        {updateAvailable && (
          <Box
            position="fixed"
            bottom={20}
            right={4}
            bg="blue.600"
            p={4}
            borderRadius="xl"
            boxShadow="lg"
            zIndex={9999}
            maxW="sm"
            backdropFilter="blur(8px)"
          >
            <VStack spacing={2} align="stretch">
              <Text color="white" fontWeight="medium">
                New version available! 🚀
              </Text>
              <Text color="whiteAlpha.800" fontSize="sm">
                Refresh to get the latest updates.
              </Text>
              <Button
                onClick={() => window.location.reload()}
                size="sm"
                colorScheme="blue"
                variant="solid"
                _hover={{
                  transform: "translateY(-1px)",
                  boxShadow: "lg"
                }}
              >
                Update Now
              </Button>
            </VStack>
          </Box>
        )}
      </Box>
    </Box>
  )
}

export default ChallengeTracker 