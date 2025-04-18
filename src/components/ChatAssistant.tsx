import { useState, useRef, useEffect } from 'react';
import {
  Box,
  Flex,
  Text,
  Input,
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
} from '@chakra-ui/react';
import { CloseIcon } from '@chakra-ui/icons';
import { FaRobot, FaPaperPlane } from 'react-icons/fa';
import { COHERE_API_KEY } from '../config';

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
  notes: Array<{ date: string; note: string }>;
}

const ChatAssistant: React.FC<ChatAssistantProps> = ({
  streak,
  completedDays,
  totalDays,
  userName = 'User',
  notes = [],
}) => {
  const [messages, setMessages] = useState<Message[]>(() => {
    const savedMessages = localStorage.getItem('chatMessages');
    return savedMessages ? JSON.parse(savedMessages) : [];
  });
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

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
    
    // Sort notes by date, most recent first
    const sortedNotes = notes
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    const notesContext = sortedNotes.length > 0
      ? `\nComplete session history:
${sortedNotes.map(note => `Date: ${note.date}
Experience: ${note.note}
---`).join('\n')}`
      : '\nNo session notes available yet.';
    
    return `
You are a friendly and motivational AI assistant for a cold shower challenge app. 
The user is currently on day ${completedDays} of a ${totalDays} day challenge.
They have completed ${progress.toFixed(1)}% of the challenge.
${streak > 0 ? `They are on a ${streak} day streak.` : 'They have not started a streak yet.'}
${daysLeft > 0 ? `They have ${daysLeft} days left to complete the challenge.` : 'They have completed the challenge!'}

${notesContext}

Your role is to:
1. Provide friendly conversation and support
2. Offer daily motivation and encouragement
3. Celebrate their progress and streaks
4. Share cold shower benefits and tips when relevant
5. Be empathetic about the challenges of cold showers
6. Reference their session notes to:
   - Track their progress over time
   - Notice patterns in their experience
   - Provide personalized advice based on their journey
   - Highlight improvements and breakthroughs
   - Address specific challenges they've mentioned
   - Celebrate their achievements and milestones

Remember to use their session notes to make the conversation more personal and relevant to their specific journey.

User message: ${userMessage}
`;
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    
    if (!COHERE_API_KEY) {
      toast({
        title: 'API Key Missing',
        description: 'Please set your Cohere API key in the config file.',
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
      console.log('Sending request to Cohere API...');
      
      const response = await fetch('https://api.cohere.ai/v1/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${COHERE_API_KEY}`,
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
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error:', errorData);
        throw new Error(errorData.message || `API Error: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('API Response:', data);
      
      if (!data.generations || !data.generations[0]) {
        throw new Error('Invalid response format from API');
      }
      
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.generations[0].text.trim(),
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
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
    localStorage.removeItem('chatMessages');
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
        top={{ base: 16, md: 4 }}
        right={{ base: 4, md: 16 }}
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
                  <FaRobot size={40} style={{ margin: '0 auto 16px', opacity: 0.7 }} />
                  <Text fontSize="lg" fontWeight="bold" mb={2}>
                    Cold Shower Assistant
                  </Text>
                  <Text color="whiteAlpha.800">
                    Hi! I'm here to support you on your cold shower journey.
                    Ask me anything about cold showers, motivation, or just chat!
                  </Text>
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
                        name={userName}
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
              <HStack width="100%" spacing={2}>
                <Input
                  placeholder="Type your message..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isLoading}
                  bg="whiteAlpha.200"
                  color="white"
                  _placeholder={{ color: 'whiteAlpha.500' }}
                  _hover={{ bg: 'whiteAlpha.300' }}
                  _focus={{ bg: 'whiteAlpha.300', borderColor: 'blue.400' }}
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  size={{ base: "md", md: "md" }}
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