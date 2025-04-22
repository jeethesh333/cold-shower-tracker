import { Box, IconButton, Menu, MenuButton, MenuList, MenuItem, HStack, Text, Progress, Spinner, Flex, useBoolean } from '@chakra-ui/react'
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
  const [isMenuOpen, setIsMenuOpen] = useBoolean()
  const [previewTime, setPreviewTime] = useState<number | null>(null)
  const [tooltipPosition, setTooltipPosition] = useState<number>(0)
  const [hoveredTrack, setHoveredTrack] = useState<string | null>(null)
  const [lastPlayedPositions, setLastPlayedPositions] = useState<LastPlayedPosition>({})
  const [trackDurations, setTrackDurations] = useState<Record<string, number>>({})
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const progressBarRef = useRef<HTMLDivElement>(null)

  const playNextTrack = useCallback(() => {
    if (!playingTrack) return;

    const currentIndex = audioTracks.findIndex(track => track.path === playingTrack);
    const nextIndex = (currentIndex + 1) % audioTracks.length;
    const nextTrack = audioTracks[nextIndex];

    setLastPlayedPositions(prev => {
      const newPositions = { ...prev };
      delete newPositions[playingTrack];
      delete newPositions[nextTrack.path];
      return newPositions;
    });

    const playFromBeginning = async (track: AudioTrack) => {
      try {
        setIsLoading(track.path)
        setSelectedTrack(track.path)
        
        const audio = new Audio(track.path)
        
        await new Promise((resolve, reject) => {
          audio.addEventListener('canplaythrough', () => {
            setTrackDurations(prev => ({
              ...prev,
              [track.path]: audio.duration
            }))
            resolve(null)
          })
          audio.addEventListener('error', (e) => {
            console.error('Audio loading error:', e)
            reject(new Error('Failed to load audio file'))
          })
          audio.load()
        })

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
        setIsLoading(null)
      }
    }

    playFromBeginning(nextTrack);
  }, [playingTrack]);

  useEffect(() => {
    const updateProgress = () => {
      if (audioRef.current) {
        const percentage = (audioRef.current.currentTime / audioRef.current.duration) * 100
        setProgress(percentage)
        setCurrentTime(audioRef.current.currentTime)
      }
    }

    const handleTrackEnd = () => {
      if (playingTrack) {
        setLastPlayedPositions(prev => {
          const newPositions = { ...prev };
          delete newPositions[playingTrack];
          return newPositions;
        });
      }
      playNextTrack();
    }

    if (audioRef.current) {
      audioRef.current.addEventListener('timeupdate', updateProgress)
      audioRef.current.addEventListener('loadedmetadata', () => {
        if (audioRef.current) {
          setTrackDurations(prev => ({
            ...prev,
            [playingTrack!]: audioRef.current!.duration
          }))
        }
      })
      audioRef.current.addEventListener('ended', handleTrackEnd)
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.removeEventListener('timeupdate', updateProgress)
        audioRef.current.removeEventListener('ended', handleTrackEnd)
      }
    }
  }, [playingTrack, playNextTrack]);

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>, trackPath: string) => {
    if (!progressBarRef.current) return

    const rect = progressBarRef.current.getBoundingClientRect()
    const x = e.touches[0].clientX - rect.left
    const percentage = (x / rect.width) * 100
    const trackDuration = trackDurations[trackPath] || 0
    const time = (percentage / 100) * trackDuration

    setPreviewTime(time)
    setTooltipPosition(Math.min(Math.max(x, 0), rect.width))
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>, trackPath: string) => {
    if (!progressBarRef.current) return

    const rect = progressBarRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const percentage = (x / rect.width) * 100
    const trackDuration = trackDurations[trackPath] || 0
    const time = (percentage / 100) * trackDuration

    setPreviewTime(time)
    setTooltipPosition(Math.min(Math.max(x, 0), rect.width))
  }

  const handleMouseEnter = (trackPath: string) => {
    setHoveredTrack(trackPath)
  }

  const handleMouseLeave = () => {
    setHoveredTrack(null)
    setPreviewTime(null)
  }

  const handlePlayPause = async (track: AudioTrack) => {
    if (playingTrack === track.path) {
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
        
        const audio = new Audio(track.path)
        
        await new Promise((resolve, reject) => {
          audio.addEventListener('canplaythrough', () => {
            setTrackDurations(prev => ({
              ...prev,
              [track.path]: audio.duration
            }))
            resolve(null)
          })
          audio.addEventListener('error', (e) => {
            console.error('Audio loading error:', e)
            reject(new Error('Failed to load audio file'))
          })
          audio.load()
        })

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
        setIsLoading(null)
      }
    }
  }

  const handleSeekClick = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>, trackPath: string) => {
    e.stopPropagation();
    if (!progressBarRef.current) return

    const rect = progressBarRef.current.getBoundingClientRect()
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const x = clientX - rect.left
    const percentage = (x / rect.width) * 100
    const trackDuration = trackDurations[trackPath] || 0
    const newTime = (percentage / 100) * trackDuration

    setCurrentTime(newTime)
    setProgress(percentage)
    setLastPlayedPositions(prev => ({
      ...prev,
      [trackPath]: newTime
    }))

    if (audioRef.current && playingTrack === trackPath) {
      audioRef.current.currentTime = newTime
    }
  }

  const handleProgressBarClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  }

  return (
    <Box position="relative">
      <Menu 
        isOpen={isMenuOpen} 
        onOpen={setIsMenuOpen.on} 
        onClose={setIsMenuOpen.off} 
        closeOnSelect={false} 
        placement="bottom-start"
        offset={[0, 4]}
        gutter={1}
      >
        <MenuButton
          as={IconButton}
          aria-label="Music Player"
          icon={<FaMusic />}
          variant="ghost"
          color="white"
          position="fixed"
          top={4}
          left={4}
          bg="whiteAlpha.200"
          backdropFilter="blur(8px)"
          boxShadow="lg"
          _hover={{ bg: "whiteAlpha.300", transform: "scale(1.05)" }}
          transition="all 0.2s"
          zIndex={999}
        />
        <MenuList 
          bg="blue.600" 
          borderColor="whiteAlpha.200" 
          minW="300px"
          mt="2"
          zIndex={1000}
          boxShadow="xl"
        >
          {audioTracks.map((track) => (
            <MenuItem 
              key={track.path} 
              as={Box}
              bg="transparent" 
              _hover={{ bg: "whiteAlpha.100" }} 
              p={3}
              onClick={(e) => e.preventDefault()}
              closeOnSelect={false}
              _focus={{ boxShadow: "none" }}
            >
              <Flex width="100%" direction="column">
                <HStack width="100%" justify="space-between" mb={2}>
                  <IconButton
                    aria-label={playingTrack === track.path ? 'Pause' : 'Play'}
                    icon={isLoading === track.path ? <Spinner size="sm" /> : playingTrack === track.path ? <FaPause /> : <FaPlay />}
                    size="sm"
                    onClick={(e) => { 
                      e.stopPropagation();
                      handlePlayPause(track); 
                    }}
                    variant="ghost"
                    color="white"
                    mr={2}
                    isDisabled={isLoading !== null && isLoading !== track.path}
                  />
                  <Text 
                    color="white" 
                    fontSize="sm" 
                    flex={1} 
                    noOfLines={1} 
                    title={track.name}
                  >
                    {track.name}
                  </Text>
                  <Text color="whiteAlpha.600" fontSize="xs">
                    {playingTrack === track.path || selectedTrack === track.path 
                      ? `${formatTime(currentTime)} / ${formatTime(trackDurations[track.path] || 0)}`
                      : formatTime(trackDurations[track.path] || 0)
                    }
                  </Text>
                </HStack>
                <Box 
                  ref={progressBarRef} 
                  width="100%" 
                  height="10px" 
                  bg="whiteAlpha.200" 
                  borderRadius="full" 
                  cursor="pointer" 
                  position="relative"
                  onClick={handleProgressBarClick}
                  onMouseDown={(e) => {e.stopPropagation(); handleSeekClick(e, track.path);}}
                  onMouseEnter={() => handleMouseEnter(track.path)}
                  onMouseLeave={handleMouseLeave}
                  onMouseMove={(e) => handleMouseMove(e, track.path)}
                  onTouchStart={() => setHoveredTrack(track.path)}
                  onTouchMove={(e) => handleTouchMove(e, track.path)}
                  onTouchEnd={(e) => { 
                    e.stopPropagation();
                    setHoveredTrack(null); 
                    setPreviewTime(null);
                    handleSeekClick(e, track.path);
                  }}
                >
                  {(playingTrack === track.path || hoveredTrack === track.path) && (
                    <Progress 
                      value={playingTrack === track.path ? progress : (lastPlayedPositions[track.path] / (trackDurations[track.path] || 1)) * 100}
                      height="10px" 
                      colorScheme="blue" 
                      bg="transparent"
                      borderRadius="full"
                      pointerEvents="none"
                    />
                  )}
                  {hoveredTrack === track.path && previewTime !== null && (
                    <Box
                      position="absolute"
                      left={`${tooltipPosition}px`}
                      bottom="15px"
                      transform="translateX(-50%)"
                      bg="blackAlpha.700"
                      color="white"
                      px={2}
                      py={1}
                      borderRadius="md"
                      fontSize="xs"
                      whiteSpace="nowrap"
                    >
                      {formatTime(previewTime)}
                    </Box>
                  )}
                </Box>
              </Flex>
            </MenuItem>
          ))}
        </MenuList>
      </Menu>
    </Box>
  )
}

export default MusicPlayer 