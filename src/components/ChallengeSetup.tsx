import { Box, Button, Heading, Text, VStack, Input, FormControl, FormLabel, Container, useBreakpointValue, Menu, MenuButton, MenuList, MenuItem, IconButton, Tooltip, Switch, Flex } from '@chakra-ui/react'
import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { SettingsIcon } from '@chakra-ui/icons'
import { FaSnowflake } from 'react-icons/fa'
import SnowfallEffect from './SnowfallEffect'
import { useToast } from '@chakra-ui/react'

interface ChallengeSetupProps {
  onStart: (days: number, startDate: string, userName: string) => void;
}

const ChallengeSetup = ({ onStart }: ChallengeSetupProps) => {
  const [days, setDays] = useState(10)
  const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [userName, setUserName] = useState(() => {
    const saved = localStorage.getItem('userName')
    return saved || ''
  })
  const [showSnowfall, setShowSnowfall] = useState(() => {
    const saved = localStorage.getItem('showSnowfall')
    if (saved === null) {
      localStorage.setItem('showSnowfall', 'true')
      return true
    }
    return JSON.parse(saved)
  })

  const toast = useToast()

  useEffect(() => {
    localStorage.setItem('showSnowfall', JSON.stringify(showSnowfall))
  }, [showSnowfall])

  useEffect(() => {
    if (userName) {
      localStorage.setItem('userName', userName)
    }
  }, [userName])

  const handleStart = () => {
    if (!userName.trim()) {
      toast({
        title: "Name required",
        description: "Please enter your name to start the challenge",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (days < 10) {
      toast({
        title: "Invalid duration",
        description: "Challenge duration must be at least 10 days",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (days > 365) {
      toast({
        title: "Invalid duration",
        description: "Challenge duration cannot exceed 365 days",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const titleCase = (str: string) => {
      return str
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
    };
    
    const finalUserName = titleCase(userName.trim());
    localStorage.setItem('userName', finalUserName);
    onStart(days, startDate, finalUserName);
  };

  // Use responsive values for container width
  const containerWidth = useBreakpointValue({
    base: "85%",    // Mobile (reduced from 90%)
    sm: "60%",      // Small tablets (reduced from 70%)
    md: "50%",      // Tablets (reduced from 60%)
    lg: "35%",      // Laptops (reduced from 45%)
    xl: "30%"       // Large screens (reduced from 35%)
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
            p={{ base: 4, sm: 6, md: 8 }}
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
            <VStack spacing={{ base: 4, sm: 5, md: 6 }}>
              <Box textAlign="center" width="100%">
                <Heading 
                  size={{ base: "md", md: "lg" }}
                  bgGradient="linear(to-r, blue.100, white)"
                  bgClip="text"
                  mb={{ base: 1, md: 2 }}
                  letterSpacing="tight"
                  fontWeight="extrabold"
                  textShadow="0 1px 5px rgba(0,0,0,0.2)"
                >
                  ❄️ Cold Shower Challenge
                </Heading>
                <Text 
                  fontSize={{ base: "sm", sm: "md", md: "lg" }}
                  fontWeight="medium"
                  color="whiteAlpha.900"
                  letterSpacing="wide"
                  textShadow="0 2px 4px rgba(0,0,0,0.2)"
                  lineHeight="1.4"
                >
                  Ready to roll?
                </Text>
              </Box>

              <FormControl>
                <FormLabel 
                  color="whiteAlpha.900"
                  fontSize={{ base: "xs", sm: "sm", md: "md" }}
                  fontWeight="medium"
                  letterSpacing="wide"
                  mb={1}
                >
                  Your Name
                </FormLabel>
                <Input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Enter your name"
                  bg="whiteAlpha.200"
                  color="white"
                  borderColor="whiteAlpha.300"
                  borderRadius="xl"
                  height={{ base: "40px", sm: "44px", md: "48px" }}
                  fontSize={{ base: "sm", sm: "md", md: "md" }}
                  _hover={{ 
                    borderColor: "whiteAlpha.400",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
                  }}
                  _focus={{ 
                    borderColor: "blue.400",
                    boxShadow: "0 0 0 1px rgba(66, 153, 225, 0.6)"
                  }}
                  _placeholder={{ 
                    color: "whiteAlpha.500"
                  }}
                  mb={4}
                  required
                />
              </FormControl>

              <FormControl>
                <FormLabel 
                  color="whiteAlpha.900"
                  fontSize={{ base: "xs", sm: "sm", md: "md" }}
                  fontWeight="medium"
                  letterSpacing="wide"
                  mb={1}
                >
                  Challenge Duration (Days)
                </FormLabel>
                <Input
                  type="number"
                  value={days}
                  min={10}
                  max={365}
                  onChange={(e) => setDays(parseInt(e.target.value) || 0)}
                  bg="whiteAlpha.200"
                  color="white"
                  borderColor="whiteAlpha.300"
                  borderRadius="xl"
                  height={{ base: "40px", sm: "44px", md: "48px" }}
                  fontSize={{ base: "sm", sm: "md", md: "md" }}
                  _hover={{ 
                    borderColor: "whiteAlpha.400",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
                  }}
                  _focus={{ 
                    borderColor: "blue.400",
                    boxShadow: "0 0 0 1px rgba(66, 153, 225, 0.6)"
                  }}
                  _placeholder={{ 
                    color: "whiteAlpha.500"
                  }}
                  mb={4}
                />
              </FormControl>

              <FormControl>
                <FormLabel 
                  color="whiteAlpha.900"
                  fontSize={{ base: "xs", sm: "sm", md: "md" }}
                  fontWeight="medium"
                  letterSpacing="wide"
                  mb={1}
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
                  height={{ base: "40px", sm: "44px", md: "48px" }}
                  fontSize={{ base: "sm", sm: "md", md: "md" }}
                  _hover={{ 
                    borderColor: "whiteAlpha.400",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
                  }}
                  _focus={{ 
                    borderColor: "blue.400",
                    boxShadow: "0 0 0 1px rgba(66, 153, 225, 0.6)"
                  }}
                  sx={{
                    colorScheme: "dark",
                    '&::-webkit-calendar-picker-indicator': {
                      filter: 'invert(1)',
                      cursor: 'pointer',
                      transform: 'scale(1.1)',
                      opacity: 0.8,
                      '&:hover': {
                        opacity: 1
                      }
                    }
                  }}
                  mb={6}
                />
              </FormControl>

              <Button
                onClick={handleStart}
                width="100%"
                bgGradient="linear(to-r, blue.400, blue.600)"
                color="white"
                height={{ base: "40px", sm: "44px", md: "48px" }}
                fontSize={{ base: "sm", sm: "md", md: "md" }}
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