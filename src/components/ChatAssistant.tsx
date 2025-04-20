import { useState, useRef, useEffect } from 'react';
import {
  Box,
  Flex,
  Text,
  IconButton,
  VStack,
  HStack,
  Avatar,
  useToast,
  Spinner,
  Button,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Textarea,
} from '@chakra-ui/react';
import { CloseIcon } from '@chakra-ui/icons';
import { FaRobot, FaPaperPlane } from 'react-icons/fa';
import { COHERE_API_KEY, isValidApiKey } from '../config';
import { SessionNote } from '../types';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatAssistantProps {
  streak: number;
  completedDays: number;
  totalDays: number;
  userName?: string;
  notes: Record<string, SessionNote>;
}

const ChatAssistant: React.FC<ChatAssistantProps> = ({
  streak,
  completedDays,
  totalDays,
  userName,
  notes = {},
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Reset messages when challenge data changes
  useEffect(() => {
    setMessages([]);
  }, [totalDays, userName]); // These props will change when challenge is reset

  // Scroll to bottom when chat opens
  useEffect(() => {
    if (isOpen && messages.length > 0) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView();
      }, 0);
    }
  }, [isOpen]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView();
  }, [messages]);

  // Save messages to localStorage
  useEffect(() => {
    localStorage.setItem('chatMessages', JSON.stringify(messages));
  }, [messages]);

  const generatePrompt = (userMessage: string): string => {
    const progress = (completedDays / totalDays) * 100;
    const daysLeft = totalDays - completedDays;
    
    const sortedNotes = Object.entries(notes)
      .map(([date, noteData]) => ({ date, note: noteData.note }))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    const notesContext = sortedNotes.length > 0
      ? `\nRecent experiences:\n${sortedNotes.slice(0, 3).map(note => `${note.date}: ${note.note}`).join('\n')}`
      : '\nNo previous sessions recorded yet.';

    return `CORE INSTRUCTIONS:
You are a supportive cold shower challenge assistant. Your responses must be:
- Personal and direct
- Encouraging and motivational
- Focused on the individual's journey
${userName ? `- Occasionally addressing them as "${userName}"` : '- STRICTLY avoiding any use of "User" or generic titles\n- Using only "you" and "your" for direct address'}

CONTEXT:
Progress: ${progress.toFixed(1)}% (Day ${completedDays} of ${totalDays})
${streak > 0 ? `Active streak: ${streak} days` : 'Streak not yet started'}
${daysLeft > 0 ? `Remaining: ${daysLeft} days` : 'Challenge completed!'}
${notesContext}

RESPONSE GUIDELINES:
1. Keep responses concise and focused
2. Celebrate progress and effort
3. Provide practical cold shower tips when relevant
4. Reference past experiences when applicable
5. Maintain an encouraging tone

${userName ? '' : 'CRITICAL: Never use the word "User" or any generic titles. Address them directly with "you" and "your".'}

Current message: ${userMessage}`;
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    
    if (!isValidApiKey(COHERE_API_KEY)) {
      toast({
        title: 'API Key Error',
        description: 'Invalid or missing Cohere API key. Please check your .env file.',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top',
      });
      return;
    }
    
    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    try {
      const prompt = generatePrompt(input);
      
      const response = await fetch('https://api.cohere.ai/v1/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${COHERE_API_KEY}`,
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          model: 'command',
          prompt: prompt,
          max_tokens: 300,
          temperature: 0.7,
          k: 0,
          stop_sequences: [],
          return_likelihoods: 'NONE',
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `API Error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.generations || !data.generations[0]) {
        throw new Error('Invalid response format from API');
      }
      
      let aiResponse = data.generations[0].text.trim();
      
      // Filter out any responses containing "User" when no username is provided
      if (!userName && aiResponse.includes('User')) {
        aiResponse = aiResponse.replace(/\b[Uu]ser\b/g, 'you');
      }
      
      const assistantMessage: Message = {
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to get response from AI assistant. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage();
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleNewChat = () => {
    setMessages([]);
    toast({
      title: 'New Chat Started',
      description: 'Your conversation has been cleared.',
      status: 'info',
      duration: 2000,
      isClosable: true,
    });
  };

  return (
    <>
      <Box
        as="button"
        position="fixed"
        bottom={4}
        right={4}
        bg="whiteAlpha.200"
        color="white"
        px={4}
        py={2}
        borderRadius="lg"
        onClick={onOpen}
        display="flex"
        alignItems="center"
        gap={2}
        backdropFilter="blur(8px)"
        boxShadow="lg"
        _hover={{
          bg: "whiteAlpha.300",
          transform: "scale(1.05)",
        }}
        transition="all 0.2s"
        cursor="pointer"
        zIndex={999}
        sx={{
          touchAction: "manipulation",
          WebkitTapHighlightColor: "transparent",
          '&:active': {
            transform: 'scale(0.95)',
          }
        }}
      >
        <Box as={FaRobot} size={16} />
        <Text fontSize="sm" fontWeight="medium">Cold Assistant</Text>
      </Box>

      <Modal isOpen={isOpen} onClose={onClose} size={{ base: "full", md: "md" }}>
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent 
          bg="blue.900" 
          borderRadius={{ base: 0, md: "xl" }}
          margin={0}
          height={{ base: "100vh", md: "auto" }}
          maxHeight={{ base: "100vh", md: "600px" }}
        >
          <ModalHeader 
            bgGradient="linear(to-r, blue.400, blue.600)" 
            color="white" 
            borderTopRadius={{ base: 0, md: "xl" }}
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            p={3}
            minHeight="60px"
          >
            <Flex align="center" width={{ base: "auto", md: "full" }} minWidth={0} mr={4}>
              <Box as={FaRobot} size={16} flexShrink={0} mr={2} />
              <Text 
                noOfLines={1} 
                fontSize={{ base: "sm", md: "md" }}
                maxWidth={{ base: "180px", md: "full" }}
              >
                Cold Shower Assistant
              </Text>
            </Flex>
            <HStack spacing={2} flexShrink={0}>
              <Button
                aria-label="New Chat"
                onClick={handleNewChat}
                size="sm"
                variant="ghost"
                color="white"
                fontSize="xs"
                fontWeight="medium"
                px={2}
                height="32px"
                bg="whiteAlpha.200"
                _hover={{
                  bg: 'whiteAlpha.300',
                }}
              >
                New Chat
              </Button>
              <IconButton
                aria-label="Close"
                icon={<CloseIcon boxSize={3} />}
                onClick={onClose}
                size="sm"
                variant="ghost"
                color="white"
                bg="whiteAlpha.200"
                _hover={{
                  bg: 'whiteAlpha.300',
                }}
              />
            </HStack>
          </ModalHeader>
          
          <ModalBody 
            p={0} 
            height={{ base: "calc(100vh - 140px)", md: "400px" }}
            display="flex" 
            flexDirection="column"
          >
            <VStack 
              flex="1" 
              overflowY="auto" 
              p={4} 
              spacing={4} 
              align="stretch"
              sx={{
                '&::-webkit-scrollbar': {
                  width: '4px',
                },
                '&::-webkit-scrollbar-track': {
                  width: '6px',
                  background: 'whiteAlpha.100',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: 'whiteAlpha.300',
                  borderRadius: '24px',
                },
              }}
            >
              {messages.length === 0 ? (
                <Box textAlign="center" py={8}>
                  <Box
                    bg="whiteAlpha.200"
                    borderRadius="full"
                    width="80px"
                    height="80px"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    margin="0 auto 16px"
                    backdropFilter="blur(8px)"
                  >
                    <FaRobot size={40} color="#90CDF4" />
                  </Box>
                  <Text 
                    fontSize="xl" 
                    fontWeight="bold" 
                    mb={2}
                    bgGradient="linear(to-r, blue.200, blue.400)"
                    bgClip="text"
                  >
                    Cold Shower Assistant
                  </Text>
                  <Text color="whiteAlpha.800" mb={6}>
                    {userName && userName !== 'User'
                      ? `Hi ${userName}! I'm here to support you on your cold shower journey.`
                      : "Hi! I'm here to support you on your cold shower journey."
                    }
                  </Text>
                  <VStack spacing={3} align="stretch" px={4}>
                    <Text color="whiteAlpha.700" fontSize="sm" mb={2}>
                      Try asking me:
                    </Text>
                    {[
                      "What are the benefits of cold showers?",
                      "How can I stay motivated for my challenge?",
                      "Tips for longer cold showers?"
                    ].map((question, index) => (
                      <Button
                        key={index}
                        variant="ghost"
                        size="sm"
                        color="blue.200"
                        justifyContent="flex-start"
                        fontWeight="normal"
                        _hover={{
                          bg: "whiteAlpha.200",
                          transform: "translateX(4px)",
                        }}
                        leftIcon={
                          <Box
                            as="span"
                            fontSize="xs"
                            color="whiteAlpha.600"
                            mr={1}
                          >
                            →
                          </Box>
                        }
                        onClick={() => {
                          setInput(question);
                          sendMessage();
                        }}
                        transition="all 0.2s"
                      >
                        {question}
                      </Button>
                    ))}
                  </VStack>
                </Box>
              ) : (
                messages.map((message, index) => (
                  <Flex
                    key={index}
                    justify={message.role === 'user' ? 'flex-end' : 'flex-start'}
                    align="flex-start"
                  >
                    {message.role === 'assistant' && (
                      <Avatar
                        icon={<FaRobot />}
                        bg="blue.500"
                        mr={2}
                        size="sm"
                      />
                    )}
                    <Box
                      maxW="80%"
                      bg={message.role === 'user' ? 'blue.500' : 'whiteAlpha.200'}
                      color="white"
                      p={3}
                      borderRadius="lg"
                      boxShadow="0 2px 8px rgba(0, 0, 0, 0.1)"
                    >
                      <Text>{message.content}</Text>
                      <Text fontSize="xs" color="whiteAlpha.600" mt={1}>
                        {formatTime(new Date(message.timestamp))}
                      </Text>
                    </Box>
                    {message.role === 'user' && (
                      <Avatar
                        bg="blue.300"
                        ml={2}
                        size="sm"
                      />
                    )}
                  </Flex>
                ))
              )}
              <div ref={messagesEndRef} />
            </VStack>
          </ModalBody>
          
          <ModalFooter 
            p={4} 
            borderTop="1px solid" 
            borderColor="whiteAlpha.200"
            position={{ base: "fixed", md: "relative" }}
            bottom={{ base: 0, md: "auto" }}
            width="100%"
            bg="blue.900"
          >
            <form onSubmit={handleSubmit} style={{ width: '100%' }}>
              <HStack width="100%" spacing={2} alignItems="flex-end">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  disabled={isLoading}
                  bg="whiteAlpha.200"
                  color="white"
                  _hover={{ bg: 'whiteAlpha.300' }}
                  _focus={{ bg: 'whiteAlpha.300', borderColor: 'blue.400' }}
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  size={{ base: "md", md: "md" }}
                  minH="40px"
                  maxH="120px"
                  resize="none"
                  rows={1}
                  overflow="hidden"
                  sx={{
                    '&::-webkit-scrollbar': {
                      width: '4px',
                    },
                    '&::-webkit-scrollbar-track': {
                      width: '6px',
                      background: 'whiteAlpha.100',
                    },
                    '&::-webkit-scrollbar-thumb': {
                      background: 'whiteAlpha.300',
                      borderRadius: '24px',
                    },
                  }}
                  onInput={(e) => {
                    const target = e.target as HTMLTextAreaElement;
                    target.style.height = 'auto';
                    target.style.height = `${Math.min(target.scrollHeight, 120)}px`;
                  }}
                />
                <IconButton
                  aria-label="Send message"
                  icon={isLoading ? <Spinner size="sm" /> : <FaPaperPlane />}
                  colorScheme="blue"
                  onClick={sendMessage}
                  isDisabled={!input.trim() || isLoading}
                  isLoading={isLoading}
                  type="submit"
                  size={{ base: "md", md: "md" }}
                  height="40px"
                />
              </HStack>
            </form>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default ChatAssistant; 