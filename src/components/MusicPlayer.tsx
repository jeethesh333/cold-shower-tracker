import { Box, IconButton, Menu, MenuButton, MenuList, MenuItem, HStack, Text, useToast, Progress, Spinner, Flex, Tooltip } from '@chakra-ui/react'
import { FaMusic, FaPlay, FaPause } from 'react-icons/fa'
import { useState, useRef, useEffect, useCallback } from 'react'

interface AudioTrack {
  name: string
  path: string
}

interface LastPlayedPosition {
  [key: string]: number
}

const audioTracks: AudioTrack[] = [
  {
    name: 'Forest Lullaby',
    path: '/audio/forest-lullaby.mp3'
  },
  {
    name: 'Fantastic Future World',
    path: '/audio/fantastic-future-world.mp3'
  },
  {
    name: 'Black Mage of Asgard',
    path: '/audio/black-mage-of-asgard.mp3'
  },
  {
    name: 'Lost in Dreams',
    path: '/audio/lost-in-dreams.mp3'
  }
]

const formatTime = (time: number): string => {
  const minutes = Math.floor(time / 60)
  const seconds = Math.floor(time % 60)
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

const MusicPlayer = () => {
  const [playingTrack, setPlayingTrack] = useState<string | null>(null)
  const [selectedTrack, setSelectedTrack] = useState<string | null>(null)
  const [progress, setProgress] = useState<number>(0)
  const [isLoading, setIsLoading] = useState<string | null>(null)
  const [currentTime, setCurrentTime] = useState<number>(0)
  const [duration, setDuration] = useState<number>(0)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [previewTime, setPreviewTime] = useState<number | null>(null)
  const [tooltipPosition, setTooltipPosition] = useState<number>(0)
  const [isHovering, setIsHovering] = useState(false)
  const [lastPlayedPositions, setLastPlayedPositions] = useState<LastPlayedPosition>({})
  const [trackDurations, setTrackDurations] = useState<Record<string, number>>({})
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const progressBarRef = useRef<HTMLDivElement>(null)

  const playNextTrack = useCallback(() => {
    if (!playingTrack) return;

    const currentIndex = audioTracks.findIndex(track => track.path === playingTrack);
    const nextIndex = (currentIndex + 1) % audioTracks.length;
    const nextTrack = audioTracks[nextIndex];

    // Reset the last played position for both the completed track and the next track
    setLastPlayedPositions(prev => {
      const newPositions = { ...prev };
      delete newPositions[playingTrack]; // Remove the last position for completed track
      delete newPositions[nextTrack.path]; // Remove the last position for next track
      return newPositions;
    });

    // Create a modified version of handlePlayPause for the next track
    const playFromBeginning = async (track: AudioTrack) => {
      try {
        setIsLoading(track.path)
        setSelectedTrack(track.path)
        
        // Create new audio instance
        const audio = new Audio(track.path)
        
        // Wait for the audio to be loaded before playing
        await new Promise((resolve, reject) => {
          audio.addEventListener('canplaythrough', () => {
            setTrackDurations(prev => ({
              ...prev,
              [track.path]: audio.duration
            }))
            setDuration(audio.duration)
            resolve(null)
          })
          audio.addEventListener('error', (e) => {
            console.error('Audio loading error:', e)
            reject(new Error('Failed to load audio file'))
          })
          audio.load()
        })

        // Always start from beginning for next track
        audio.currentTime = 0
        setCurrentTime(0)
        setProgress(0)
        
        audio.loop = false
        await audio.play()
        
        audioRef.current = audio
        setPlayingTrack(track.path)
        setIsLoading(null)
      } catch (error) {
        console.error('Error loading audio:', error)
        setPlayingTrack(null)
        setProgress(0)
        setCurrentTime(0)
        setDuration(0)
        setIsLoading(null)
      }
    }

    // Play next track from beginning
    playFromBeginning(nextTrack);
  }, [playingTrack, setIsLoading, setSelectedTrack, setTrackDurations, setDuration, setCurrentTime, setProgress, setPlayingTrack]);

  useEffect(() => {
    const updateProgress = () => {
      if (audioRef.current) {
        const percentage = (audioRef.current.currentTime / audioRef.current.duration) * 100
        setProgress(percentage)
        setCurrentTime(audioRef.current.currentTime)
        setDuration(audioRef.current.duration)
      }
    }

    const handleTrackEnd = () => {
      // Reset the current track's position when it ends
      if (playingTrack) {
        setLastPlayedPositions(prev => {
          const newPositions = { ...prev };
          delete newPositions[playingTrack]; // Remove the last position when track ends
          return newPositions;
        });
      }
      playNextTrack();
    }

    if (audioRef.current) {
      audioRef.current.addEventListener('timeupdate', updateProgress)
      audioRef.current.addEventListener('loadedmetadata', () => {
        setDuration(audioRef.current?.duration || 0)
      })
      audioRef.current.addEventListener('ended', handleTrackEnd)
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.removeEventListener('timeupdate', updateProgress)
        audioRef.current.removeEventListener('ended', handleTrackEnd)
      }
    }
  }, [playingTrack, playNextTrack])

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>, trackPath: string) => {
    if (!progressBarRef.current) return

    const progressBar = progressBarRef.current
    const rect = progressBarRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const percentage = (x / rect.width) * 100
    const trackDuration = trackDurations[trackPath] || 0
    const newTime = (percentage / 100) * trackDuration

    // Update the current time and progress
    setCurrentTime(newTime)
    setProgress(percentage)
    setLastPlayedPositions(prev => ({
      ...prev,
      [trackPath]: newTime
    }))

    // If audio is playing, update its current time
    if (audioRef.current && playingTrack === trackPath) {
      audioRef.current.currentTime = newTime
    }
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>, trackPath: string) => {
    if (!progressBarRef.current) return

    const progressBar = progressBarRef.current
    const rect = progressBar.getBoundingClientRect()
    const x = e.clientX - rect.left
    const percentage = (x / rect.width) * 100
    const trackDuration = trackDurations[trackPath] || 0
    const time = (percentage / 100) * trackDuration

    setPreviewTime(time)
    setTooltipPosition(Math.min(Math.max(x, 0), rect.width))
  }

  const handleMouseEnter = () => {
    setIsHovering(true)
  }

  const handleMouseLeave = () => {
    setIsHovering(false)
    setPreviewTime(null)
  }

  const handlePlayPause = async (track: AudioTrack) => {
    if (playingTrack === track.path) {
      // If this track is currently playing, pause it and store its position
      if (audioRef.current) {
        const currentPosition = audioRef.current.currentTime
        setLastPlayedPositions(prev => ({
          ...prev,
          [track.path]: currentPosition
        }))
        audioRef.current.pause()
        audioRef.current = null
      }
      setPlayingTrack(null)
      setSelectedTrack(track.path)
    } else {
      // If a different track is playing, stop it first
      if (audioRef.current) {
        const currentPosition = audioRef.current.currentTime
        setLastPlayedPositions(prev => ({
          ...prev,
          [playingTrack!]: currentPosition
        }))
        audioRef.current.pause()
        audioRef.current = null
        setPlayingTrack(null)
      }

      try {
        setIsLoading(track.path)
        setSelectedTrack(track.path)
        
        // Create new audio instance
        const audio = new Audio(track.path)
        
        // Wait for the audio to be loaded before playing
        await new Promise((resolve, reject) => {
          audio.addEventListener('canplaythrough', () => {
            setTrackDurations(prev => ({
              ...prev,
              [track.path]: audio.duration
            }))
            setDuration(audio.duration)
            resolve(null)
          })
          audio.addEventListener('error', (e) => {
            console.error('Audio loading error:', e)
            reject(new Error('Failed to load audio file'))
          })
          audio.load()
        })

        // Set the current time to the last played position if it exists
        const lastPosition = lastPlayedPositions[track.path]
        if (lastPosition) {
          audio.currentTime = lastPosition
          setCurrentTime(lastPosition)
          setProgress((lastPosition / audio.duration) * 100)
        } else {
          setCurrentTime(0)
          setProgress(0)
        }

        audio.loop = false
        await audio.play()
        
        audioRef.current = audio
        setPlayingTrack(track.path)
        setIsLoading(null)
      } catch (error) {
        console.error('Error loading audio:', error)
        setPlayingTrack(null)
        setProgress(0)
        setCurrentTime(0)
        setDuration(0)
        setIsLoading(null)
      }
    }
  }

  const handleMenuItemClick = (e: React.MouseEvent) => {
    // Prevent the menu from closing when clicking inside menu items
    e.stopPropagation()
  }

  return (
    <Box position="fixed" top={4} left={4} zIndex={1000}>
      <Menu
        isOpen={isMenuOpen}
        onOpen={() => setIsMenuOpen(true)}
        onClose={() => setIsMenuOpen(false)}
        closeOnSelect={false}
      >
        <MenuButton
          as={IconButton}
          aria-label="Music menu"
          icon={<FaMusic style={{ color: '#3182ce' }} />}
          size="lg"
          borderRadius="full"
          bg="transparent"
          position="relative"
          transition="all 0.2s"
          _hover={{
            transform: 'scale(1.1)',
            '& svg': {
              color: 'white',
            },
            '&:before': {
              opacity: 0.8,
              background: 'linear-gradient(135deg, #63B3ED 0%, #3182CE 50%)',
            },
            '&:after': {
              opacity: 0.8,
              background: 'linear-gradient(135deg, #63B3ED 0%, #3182CE 50%)',
              filter: 'blur(4px)',
            }
          }}
          _active={{
            transform: 'scale(0.95)',
            '& svg': {
              color: 'white',
            },
          }}
          sx={{
            '& svg': {
              transition: 'color 0.2s',
            },
            '&:before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              borderRadius: 'full',
              padding: '2px',
              background: 'linear-gradient(135deg, #3182ce 0%, #2c5282 50%)',
              opacity: 0.6,
              transition: 'all 0.2s',
              WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
              WebkitMaskComposite: 'xor',
              maskComposite: 'exclude',
            },
            '&:after': {
              content: '""',
              position: 'absolute',
              inset: 0,
              borderRadius: 'full',
              background: 'linear-gradient(135deg, #3182ce 0%, #2c5282 50%)',
              opacity: 0.6,
              transition: 'all 0.2s',
              zIndex: -1,
              filter: 'blur(2px)',
            }
          }}
          _focusVisible={{
            boxShadow: 'none',
          }}
        />
        <MenuList 
          bg="blue.600"
          borderRadius="xl" 
          boxShadow="dark-lg"
          p={2} 
          minW="280px"
          onClick={handleMenuItemClick}
          border="none"
          backdropFilter="blur(10px)"
          sx={{
            background: 'linear-gradient(135deg, #3182ce 0%, #2c5282 50%)',
            '&:before': {
              content: '""',
              position: 'absolute',
              top: 0,
              right: 0,
              bottom: 0,
              left: 0,
              borderRadius: 'xl',
              background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.05) 100%)',
              pointerEvents: 'none'
            }
          }}
        >
          {audioTracks.map((track) => (
            <MenuItem
              key={track.path}
              borderRadius="lg"
              p={2}
              mb={2}
              _hover={{ 
                bg: 'whiteAlpha.200',
                transform: 'translateY(-1px)',
                transition: 'all 0.2s'
              }}
              _active={{
                bg: 'whiteAlpha.300'
              }}
              _focus={{
                bg: 'whiteAlpha.200'
              }}
              onClick={(e) => {
                e.stopPropagation()
              }}
              sx={{
                background: selectedTrack === track.path ? 'whiteAlpha.200' : 'transparent'
              }}
            >
              <Box width="100%">
                <HStack justify="space-between" width="100%" spacing={4} mb={selectedTrack === track.path ? 2 : 0}>
                  <Text 
                    fontWeight="medium" 
                    color="white"
                    fontSize="sm"
                  >
                    {track.name}
                  </Text>
                  <IconButton
                    aria-label={playingTrack === track.path ? 'Pause' : 'Play'}
                    icon={isLoading === track.path ? <Spinner size="sm" /> : playingTrack === track.path ? <FaPause /> : <FaPlay />}
                    size="sm"
                    colorScheme={selectedTrack === track.path ? 'whiteAlpha' : 'blackAlpha'}
                    onClick={(e) => {
                      e.stopPropagation()
                      handlePlayPause(track)
                    }}
                    borderRadius="full"
                    isDisabled={isLoading !== null && isLoading !== track.path}
                    bg={selectedTrack === track.path ? 'whiteAlpha.400' : 'whiteAlpha.200'}
                    _hover={{
                      bg: 'whiteAlpha.500'
                    }}
                  />
                </HStack>
                {selectedTrack === track.path && (
                  <Box>
                    <Box
                      position="relative"
                      mb={1}
                    >
                      <Box
                        ref={progressBarRef}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleSeek(e, track.path)
                        }}
                        onMouseMove={(e) => handleMouseMove(e, track.path)}
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                        cursor="pointer"
                        position="relative"
                        role="group"
                        h="16px"
                        display="flex"
                        alignItems="center"
                      >
                        <Progress
                          value={selectedTrack === track.path ? progress : 0}
                          size="xs"
                          colorScheme="whiteAlpha"
                          borderRadius="full"
                          isAnimated
                          transition="all 0.1s"
                          _groupHover={{ transform: 'scaleY(1.5)' }}
                          width="100%"
                          bg="whiteAlpha.200"
                        />
                        {isHovering && previewTime !== null && (
                          <Box
                            position="absolute"
                            top="-25px"
                            left={`${tooltipPosition}px`}
                            transform="translateX(-50%)"
                            bg="white"
                            color="blue.600"
                            fontSize="xs"
                            px={2}
                            py={1}
                            borderRadius="md"
                            pointerEvents="none"
                            fontWeight="medium"
                          >
                            {formatTime(previewTime)}
                            <Box
                              position="absolute"
                              bottom="-4px"
                              left="50%"
                              transform="translateX(-50%)"
                              width="0"
                              height="0"
                              borderLeft="4px solid transparent"
                              borderRight="4px solid transparent"
                              borderTop="4px solid"
                              borderTopColor="white"
                            />
                          </Box>
                        )}
                      </Box>
                    </Box>
                    <Flex justify="space-between" fontSize="xs" color="whiteAlpha.800" px={1}>
                      <Text>{formatTime(currentTime)}</Text>
                      <Text>{formatTime(trackDurations[track.path] || 0)}</Text>
                    </Flex>
                  </Box>
                )}
              </Box>
            </MenuItem>
          ))}
        </MenuList>
      </Menu>
    </Box>
  )
}

export default MusicPlayer 