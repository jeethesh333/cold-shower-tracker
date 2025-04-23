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
import { generateChatResponse } from '../services/geminiService';
import { SessionNote } from '../types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { parseISO, differenceInDays } from 'date-fns';

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
  startDate: string;
  daysLeft: number;
}

const ChatAssistant: React.FC<ChatAssistantProps> = ({
  streak,
  completedDays,
  totalDays,
  userName,
  notes = {},
  startDate,
  daysLeft,
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

  const sendMessage = async () => {
    if (!input.trim()) return;
    
    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    try {
      const sortedNotes = Object.entries(notes)
        .map(([date, noteData]) => ({ date, note: noteData.note }))
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 3);

      // Calculate current day number based on days since start
      const startDateObj = parseISO(startDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const daysSinceStart = differenceInDays(today, startDateObj) + 1;
      const currentDay = Math.min(daysSinceStart, totalDays);

      const response = await generateChatResponse(input, {
        progress: (completedDays / totalDays) * 100,
        completedDays,
        totalDays,
        streak,
        userName,
        recentNotes: sortedNotes,
        currentDay,
        daysLeft
      });
      
      const assistantMessage: Message = {
        role: 'assistant',
        content: response,
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
          margin={{ base: 0, md: "auto" }}
          height={{ base: "100vh", md: "600px" }}
          maxHeight={{ base: "100vh", md: "600px" }}
          display="flex"
          flexDirection="column"
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
            flexShrink={0}
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
            flex={1}
            overflow="hidden"
            display="flex"
            flexDirection="column"
          >
            <VStack 
              flex={1} 
              overflowY="auto" 
              p={4} 
              spacing={4} 
              align="stretch"
              mb={{ base: "60px", md: 0 }}
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
                        onClick={(e) => {
                          e.preventDefault();
                          setInput(question);
                        }}
                        type="button"
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
                      <Box className="markdown-content" sx={{
                        '& p': { margin: 0 },
                        '& strong': { color: 'blue.200' },
                        '& em': { color: 'blue.100' },
                        '& code': { 
                          bg: 'whiteAlpha.200',
                          p: '2px 4px',
                          borderRadius: 'md',
                          fontSize: '0.9em'
                        },
                        '& a': {
                          color: 'blue.200',
                          textDecoration: 'underline',
                          _hover: { color: 'blue.100' }
                        }
                      }}>
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {message.content}
                        </ReactMarkdown>
                      </Box>
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
            bottom={0}
            left={0}
            right={0}
            width="100%"
            bg="blue.900"
            flexShrink={0}
            zIndex={2}
          >
            <form onSubmit={handleSubmit} style={{ width: '100%' }}>
              <HStack width="100%" spacing={2}>
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
                  height="40px"
                  flexShrink={0}
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