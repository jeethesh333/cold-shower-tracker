import { Box, Grid, Text, Tooltip, Menu, MenuButton, MenuList, MenuItem, Portal, useMediaQuery, useBreakpointValue } from '@chakra-ui/react'
import { format, parseISO } from 'date-fns'
import { DeleteIcon, EditIcon } from '@chakra-ui/icons'
import { ChallengeData } from '../types'

interface ChallengeGridProps {
  challengeData: ChallengeData
  onEditNote?: (date: string, note: string) => void
  onDeleteDate?: (date: string) => void
}

const ChallengeGrid = ({ challengeData, onEditNote, onDeleteDate }: ChallengeGridProps) => {
  const [isMobile] = useMediaQuery("(max-width: 768px)")

  const getOptimalColumns = (totalDays: number): number => {
    if (totalDays <= 7) return totalDays
    if (totalDays <= 14) return 7
    if (totalDays <= 28) return 7
    if (totalDays <= 31) return 7
    return 7
  }

  const handleEditClick = (date: string) => {
    const noteData = challengeData.notes[date]
    if (onEditNote && noteData) {
      onEditNote(date, noteData.note)
    }
  }

  const handleDeleteClick = (date: string) => {
    if (onDeleteDate) {
      onDeleteDate(date)
    }
  }

  const columns = getOptimalColumns(challengeData.days)
  const completedDays = challengeData.completedDays || []

  return (
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
      <Grid
        templateColumns={`repeat(${columns}, 1fr)`}
        gap={2}
      >
        {Array.from({ length: challengeData.days }).map((_, index) => {
          const dayNumber = index + 1
          const startDate = new Date(challengeData.startDate)
          const cellDate = new Date(startDate)
          cellDate.setDate(startDate.getDate() + index)
          const cellDateStr = format(cellDate, 'MM/dd/yy')
          
          const isCompleted = completedDays.some(date => {
            const dayOfChallenge = Math.floor((new Date(date).getTime() - new Date(challengeData.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1
            return dayOfChallenge === dayNumber
          })

          const completedDate = completedDays.find(date => {
            const dayOfChallenge = Math.floor((new Date(date).getTime() - new Date(challengeData.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1
            return dayOfChallenge === dayNumber
          })

          const note = completedDate ? challengeData.notes[completedDate]?.note : null

          return (
            <Box
              key={index}
              bg={isCompleted ? "blue.500" : "whiteAlpha.100"}
              borderRadius="lg"
              p={2}
              textAlign="center"
              position="relative"
              transition="all 0.2s"
              cursor={isCompleted ? "pointer" : "default"}
              _hover={{
                transform: isCompleted ? "scale(1.05)" : "none",
                bg: isCompleted ? "blue.400" : "whiteAlpha.200"
              }}
            >
              {isCompleted ? (
                <Menu gutter={0} placement="bottom-end" isLazy>
                  {!isMobile && (
                    <Tooltip 
                      label={
                        <Box
                          p={2}
                          bg="rgba(0, 0, 0, 0.4)"
                          borderRadius="md"
                          backdropFilter="blur(8px)"
                          border="1px solid rgba(255, 255, 255, 0.1)"
                          boxShadow="0 4px 6px rgba(0, 0, 0, 0.1)"
                        >
                          <Text
                            fontWeight="bold"
                            color="blue.200"
                            fontSize="sm"
                            mb={note ? 1 : 0}
                          >
                            {format(parseISO(completedDate!), 'MM/dd/yy')}
                          </Text>
                          {note && (
                            <Text
                              color="whiteAlpha.900"
                              fontSize="sm"
                              whiteSpace="pre-wrap"
                              maxW="300px"
                            >
                              {note}
                            </Text>
                          )}
                        </Box>
                      }
                      placement="top"
                      hasArrow
                      bg="transparent"
                      p={0}
                    >
                      <MenuButton as={Box} w="100%" h="100%">
                        <Text fontWeight="bold">{dayNumber}</Text>
                      </MenuButton>
                    </Tooltip>
                  )}
                  {isMobile && (
                    <MenuButton as={Box} w="100%" h="100%">
                      <Text fontWeight="bold">{dayNumber}</Text>
                    </MenuButton>
                  )}
                  <Portal>
                    <MenuList 
                      bg="blackAlpha.500" 
                      borderColor="whiteAlpha.200"
                      zIndex={1000}
                      minW="120px"
                      boxShadow="0 4px 6px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.1)"
                      py={1}
                      sx={{
                        isolation: "isolate",
                        backdropFilter: "blur(8px)"
                      }}
                    >
                      {isMobile && (
                        <MenuItem
                          isDisabled
                          bg="transparent"
                          _hover={{ bg: "transparent" }}
                          color="blue.200"
                          fontWeight="bold"
                          fontSize="sm"
                        >
                          {format(parseISO(completedDate!), 'MM/dd/yy')}
                        </MenuItem>
                      )}
                      <MenuItem
                        icon={<EditIcon />}
                        onClick={() => handleEditClick(completedDate!)}
                        bg="transparent"
                        _hover={{ bg: "whiteAlpha.200" }}
                        w="100%"
                        px={3}
                        py={2}
                        color="whiteAlpha.900"
                      >
                        Edit Note
                      </MenuItem>
                      <MenuItem
                        icon={<DeleteIcon />}
                        onClick={() => handleDeleteClick(completedDate!)}
                        bg="transparent"
                        _hover={{ bg: "whiteAlpha.200" }}
                        color="red.300"
                        w="100%"
                        px={3}
                        py={2}
                      >
                        Remove Day
                      </MenuItem>
                    </MenuList>
                  </Portal>
                </Menu>
              ) : (
                <Box
                  w="100%"
                  h="100%"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  {!isMobile ? (
                    <Tooltip
                      label={cellDateStr}
                      placement="top"
                      hasArrow
                      bg="rgba(0, 0, 0, 0.8)"
                      color="white"
                      fontSize="sm"
                      px={2}
                      py={1}
                    >
                      <Text 
                        color="whiteAlpha.600" 
                        fontWeight="medium"
                      >
                        {dayNumber}
                      </Text>
                    </Tooltip>
                  ) : (
                    <Menu>
                      <MenuButton as={Text} 
                        color="whiteAlpha.600" 
                        fontWeight="medium"
                      >
                        {dayNumber}
                      </MenuButton>
                      <Portal>
                        <MenuList
                          bg="blackAlpha.500"
                          borderColor="whiteAlpha.200"
                          minW="auto"
                          p={2}
                        >
                          <Text color="white" fontSize="sm">
                            {cellDateStr}
                          </Text>
                        </MenuList>
                      </Portal>
                    </Menu>
                  )}
                </Box>
              )}
            </Box>
          )
        })}
      </Grid>
    </Box>
  )
}

export default ChallengeGrid 