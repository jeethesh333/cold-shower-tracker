import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Box, Button, Heading, Text, VStack } from '@chakra-ui/react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <Box
          minH="100vh"
          display="flex"
          alignItems="center"
          justifyContent="center"
          bg="gray.900"
          p={4}
        >
          <VStack
            spacing={6}
            p={8}
            bg="whiteAlpha.100"
            borderRadius="lg"
            maxW="600px"
            w="full"
          >
            <Heading size="lg" color="red.400">
              Oops! Something went wrong
            </Heading>
            <Text color="whiteAlpha.900">
              We're sorry, but something unexpected happened. Don't worry, your data is safe.
            </Text>
            {process.env.NODE_ENV === 'development' && (
              <Box
                p={4}
                bg="whiteAlpha.200"
                borderRadius="md"
                w="full"
                overflowX="auto"
              >
                <Text color="red.300" fontSize="sm" fontFamily="monospace">
                  {this.state.error?.toString()}
                </Text>
                <Text color="whiteAlpha.700" fontSize="sm" fontFamily="monospace" mt={2}>
                  {this.state.errorInfo?.componentStack}
                </Text>
              </Box>
            )}
            <Button
              colorScheme="blue"
              onClick={this.handleReset}
              size="lg"
            >
              Try Again
            </Button>
          </VStack>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 