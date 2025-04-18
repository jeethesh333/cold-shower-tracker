import { Box, Button, Heading, Text, VStack, Input, FormControl, FormLabel, Container, useBreakpointValue, Menu, MenuButton, MenuList, MenuItem, IconButton, Tooltip, Switch, Flex } from '@chakra-ui/react'
import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { SettingsIcon } from '@chakra-ui/icons'
import { FaSnowflake } from 'react-icons/fa'
import SnowfallEffect from './SnowfallEffect'

interface ChallengeSetupProps {
  onStart: (days: number, startDate: string) => void;
}

const ChallengeSetup = ({ onStart }: ChallengeSetupProps) => {
  const [days, setDays] = useState(50)
  const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [showSnowfall, setShowSnowfall] = useState(() => {
    const saved = localStorage.getItem('showSnowfall')
    return saved !== null ? JSON.parse(saved) : true
  })

  useEffect(() => {
    localStorage.setItem('showSnowfall', JSON.stringify(showSnowfall))
  }, [showSnowfall])

  const handleStart = () => {
    onStart(days, startDate)
  }

  // Use responsive values for container width
  const containerWidth = useBreakpointValue({
    base: "95%",
    sm: "85%",
    md: "75%",
    lg: "60%",
    xl: "50%"
  })

  return (
    <>
      <Box
        width="100vw"
        minHeight="100vh"
        bgGradient="linear(135deg, blue.900 0%, blue.700 50%, blue.600 100%)"
        display="flex"
        alignItems="center"
        justifyContent="center"
        position="absolute"
        top="0"
        left="0"
        margin="0"
        padding="0"
        overflowX="hidden"
        overflowY="auto"
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

        <Container 
          maxW={containerWidth} 
          p={0}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Box
            w="100%"
            bg="whiteAlpha.200"
            backdropFilter="blur(10px)"
            p={{ base: 6, sm: 8, md: 10 }}
            borderRadius={{ base: "xl", md: "2xl" }}
            boxShadow="lg"
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
              transform: "translateY(-4px)",
              boxShadow: "xl",
              _before: {
                opacity: 1
              }
            }}
          >
            <VStack spacing={{ base: 6, sm: 7, md: 8, lg: 10 }}>
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
                  ❄️ Cold Shower Challenge
                </Heading>
                <Text 
                  fontSize={{ base: "md", sm: "lg", md: "xl" }}
                  fontWeight="medium"
                  color="whiteAlpha.900"
                  letterSpacing="wide"
                  textShadow="0 2px 4px rgba(0,0,0,0.2)"
                  lineHeight="1.5"
                >
                  Ready to roll?
                </Text>
              </Box>

              <FormControl>
                <FormLabel 
                  color="whiteAlpha.900"
                  fontSize={{ base: "sm", sm: "md", md: "lg" }}
                  fontWeight="medium"
                  letterSpacing="wide"
                  mb={2}
                >
                  Challenge Duration (Days)
                </FormLabel>
                <Input
                  type="number"
                  value={days}
                  min={1}
                  max={365}
                  onChange={(e) => setDays(parseInt(e.target.value))}
                  bg="whiteAlpha.200"
                  color="white"
                  borderColor="whiteAlpha.300"
                  borderRadius="xl"
                  height={{ base: "48px", sm: "56px", md: "64px" }}
                  fontSize={{ base: "md", sm: "lg", md: "xl" }}
                  _hover={{ 
                    borderColor: "whiteAlpha.400",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
                  }}
                  _focus={{ 
                    borderColor: "blue.400",
                    boxShadow: "0 0 0 1px rgba(66, 153, 225, 0.6), 0 4px 12px rgba(0,0,0,0.1)"
                  }}
                  _placeholder={{ color: "whiteAlpha.600" }}
                />
              </FormControl>

              <FormControl>
                <FormLabel 
                  color="whiteAlpha.900"
                  fontSize={{ base: "sm", sm: "md", md: "lg" }}
                  fontWeight="medium"
                  letterSpacing="wide"
                  mb={2}
                >
                  Start Date
                </FormLabel>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  bg="whiteAlpha.200"
                  color="white"
                  borderColor="whiteAlpha.300"
                  borderRadius="xl"
                  height={{ base: "48px", sm: "56px", md: "64px" }}
                  fontSize={{ base: "md", sm: "lg", md: "xl" }}
                  _hover={{ 
                    borderColor: "whiteAlpha.400",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
                  }}
                  _focus={{ 
                    borderColor: "blue.400",
                    boxShadow: "0 0 0 1px rgba(66, 153, 225, 0.6), 0 4px 12px rgba(0,0,0,0.1)"
                  }}
                  sx={{
                    colorScheme: "dark",
                    '&::-webkit-calendar-picker-indicator': {
                      filter: 'invert(1)',
                      cursor: 'pointer',
                      transform: 'scale(1.2)',
                      opacity: 0.8,
                      '&:hover': {
                        opacity: 1
                      }
                    }
                  }}
                />
              </FormControl>

              <Button
                onClick={handleStart}
                width="100%"
                bgGradient="linear(to-r, blue.400, blue.600)"
                color="white"
                height={{ base: "48px", sm: "56px", md: "64px" }}
                fontSize={{ base: "md", sm: "lg", md: "xl" }}
                fontWeight="semibold"
                letterSpacing="wide"
                borderRadius="xl"
                _hover={{
                  bgGradient: "linear(to-r, blue.500, blue.700)",
                  transform: "translateY(-2px)",
                  boxShadow: "xl"
                }}
                _active={{
                  transform: "translateY(0)",
                  boxShadow: "md"
                }}
                transition="all 0.2s"
                boxShadow="md"
              >
                Start Challenge
              </Button>
            </VStack>
          </Box>
        </Container>
      </Box>
    </>
  )
}

export default ChallengeSetup 