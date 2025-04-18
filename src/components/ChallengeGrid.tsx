import { Box, Grid, Text, Tooltip, IconButton, Menu, MenuButton, MenuList, MenuItem, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton, Button, Textarea } from '@chakra-ui/react'
import { format, parseISO } from 'date-fns'
import { DeleteIcon, EditIcon, HamburgerIcon } from '@chakra-ui/icons'
import { useState } from 'react'
import { ChallengeData } from '../types'

interface ChallengeGridProps {
  challengeData: ChallengeData;
  onEditNote?: (date: string, note: string) => void;
  onDeleteDate?: (date: string) => void;
}

const ChallengeGrid = ({ challengeData, onEditNote, onDeleteDate }: ChallengeGridProps) => {
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [editNote, setEditNote] = useState('')
  const { isOpen, onOpen, onClose } = useDisclosure()

  const getOptimalColumns = (totalDays: number): number => {
    if (totalDays <= 7) return totalDays
    if (totalDays <= 14) return 7
    if (totalDays <= 28) return 7
    if (totalDays <= 31) return 7
    return 7
  }

  const handleEditClick = (date: string) => {
    const note = challengeData.notes.find(n => n.date === date)?.note || ''
    setSelectedDate(date)
    setEditNote(note)
    onOpen()
  }

  const handleSaveNote = () => {
    if (selectedDate && onEditNote) {
      onEditNote(selectedDate, editNote)
    }
    onClose()
  }

  const handleDeleteClick = (date: string) => {
    if (onDeleteDate) {
      onDeleteDate(date)
    }
  }

  const columns = getOptimalColumns(challengeData.totalDays)

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
        {Array.from({ length: challengeData.totalDays }).map((_, index) => {
          const dayNumber = index + 1
          const isCompleted = challengeData.completedDates.some(date => {
            const dayOfChallenge = Math.floor((new Date(date).getTime() - new Date(challengeData.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1
            return dayOfChallenge === dayNumber
          })

          const completedDate = challengeData.completedDates.find(date => {
            const dayOfChallenge = Math.floor((new Date(date).getTime() - new Date(challengeData.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1
            return dayOfChallenge === dayNumber
          })

          const note = completedDate ? challengeData.notes.find(n => n.date === completedDate)?.note : null

          return (
            <Box
              key={index}
              bg={isCompleted ? "blue.500" : "whiteAlpha.100"}
              borderRadius="lg"
              p={2}
              textAlign="center"
              position="relative"
              transition="all 0.2s"
              _hover={{
                transform: isCompleted ? "scale(1.05)" : "none",
                bg: isCompleted ? "blue.400" : "whiteAlpha.200"
              }}
            >
              {isCompleted ? (
                <Tooltip 
                  label={note ? `${format(parseISO(completedDate!), 'MMM d, yyyy')}\n${note}` : format(parseISO(completedDate!), 'MMM d, yyyy')}
                  placement="top"
                  hasArrow
                >
                  <Box position="relative">
                    <Text fontWeight="bold">{dayNumber}</Text>
                    <Menu>
                      <MenuButton
                        as={IconButton}
                        icon={<HamburgerIcon />}
                        variant="ghost"
                        size="xs"
                        position="absolute"
                        top={-1}
                        right={-1}
                        color="white"
                        _hover={{ bg: "whiteAlpha.300" }}
                      />
                      <MenuList bg="blue.800" borderColor="whiteAlpha.200">
                        <MenuItem
                          icon={<EditIcon />}
                          onClick={() => handleEditClick(completedDate!)}
                          bg="transparent"
                          _hover={{ bg: "whiteAlpha.200" }}
                        >
                          Edit Note
                        </MenuItem>
                        <MenuItem
                          icon={<DeleteIcon />}
                          onClick={() => handleDeleteClick(completedDate!)}
                          bg="transparent"
                          _hover={{ bg: "whiteAlpha.200" }}
                          color="red.300"
                        >
                          Remove Day
                        </MenuItem>
                      </MenuList>
                    </Menu>
                  </Box>
                </Tooltip>
              ) : (
                <Text 
                  color="whiteAlpha.600" 
                  fontWeight="medium"
                >
                  {dayNumber}
                </Text>
              )}
            </Box>
          )
        })}
      </Grid>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay backdropFilter="blur(8px)" bg="blackAlpha.600" />
        <ModalContent bg="blue.900" borderRadius="xl" mx={3}>
          <ModalHeader bgGradient="linear(to-r, blue.400, blue.600)" color="white" borderTopRadius="xl">
            Edit Note
          </ModalHeader>
          <ModalCloseButton color="white" />
          <ModalBody p={5}>
            <Text fontWeight="semibold" mb={2} color="white" letterSpacing="wide">
              {selectedDate && format(parseISO(selectedDate), 'MMMM d, yyyy')}
            </Text>
            <Textarea
              value={editNote}
              onChange={(e) => setEditNote(e.target.value)}
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
              onClick={handleSaveNote}
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
    </Box>
  )
}

export default ChallengeGrid 