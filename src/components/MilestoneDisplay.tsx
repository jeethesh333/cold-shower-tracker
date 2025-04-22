import {
  Box,
  Text,
  VStack,
  HStack,
  useBreakpointValue,
  Flex,
  Badge,
} from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import { MILESTONES, Milestone } from '../types';

interface MilestoneDisplayProps {
  currentProgress: number;
}

const pulseAnimation = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
`;

const MilestoneDisplay: React.FC<MilestoneDisplayProps> = ({ currentProgress }) => {
  const direction = useBreakpointValue({ base: "column", md: "row" }) as "column" | "row";

  const getMilestoneStatus = (milestone: Milestone) => {
    if (currentProgress >= milestone.requiredProgress) {
      return 'achieved';
    }
    if (
      currentProgress > 0 &&
      milestone.requiredProgress === MILESTONES.find(m => m.requiredProgress > currentProgress)?.requiredProgress
    ) {
      return 'next';
    }
    return 'locked';
  };

  const Container = direction === 'column' ? VStack : HStack;

  return (
    <Box
      width="100%"
      bg="whiteAlpha.100"
      borderRadius="xl"
      p={4}
      backdropFilter="blur(8px)"
      boxShadow="0 4px 6px rgba(0, 0, 0, 0.1)"
    >
      <Text
        fontSize="sm"
        fontWeight="semibold"
        color="white"
        mb={4}
        textAlign="center"
        letterSpacing="wide"
      >
        🏆 Milestones
      </Text>
      <Container
        spacing={4}
        align="center"
        justify="center"
        width="100%"
        overflowX={direction === 'row' ? 'auto' : 'visible'}
        overflowY="hidden"
        pb={0}
        mb={0}
        sx={{
          '&::-webkit-scrollbar': {
            height: '6px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'whiteAlpha.100',
            borderRadius: '3px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'whiteAlpha.300',
            borderRadius: '3px',
            '&:hover': {
              background: 'whiteAlpha.400',
            },
          },
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(255, 255, 255, 0.3) rgba(255, 255, 255, 0.1)',
          borderBottom: 'none'
        }}
      >
        {MILESTONES.map((milestone) => {
          const status = getMilestoneStatus(milestone);
          const isAchieved = status === 'achieved';
          const isNext = status === 'next';

          return (
            <Flex
              key={milestone.id}
              direction={direction}
              align="center"
              justify="center"
              bg={isAchieved ? milestone.color : 'whiteAlpha.100'}
              color={isAchieved ? 'white' : 'whiteAlpha.600'}
              p={3}
              borderRadius="lg"
              minW={direction === 'column' ? "200px" : "100px"}
              position="relative"
              transition="all 0.2s"
              opacity={isAchieved ? 1 : 0.8}
              _hover={{ transform: 'translateY(-2px)' }}
              animation={isNext ? `${pulseAnimation} 2s infinite` : undefined}
            >
              <HStack spacing={2} align="center" width="100%">
                <Box width="32px" display="flex" justifyContent="center" alignItems="center">
                  <Text fontSize="2xl">
                    {milestone.icon}
                  </Text>
                </Box>
                <VStack spacing={0} align="start" flex={1}>
                  <Text
                    fontSize="sm"
                    fontWeight="semibold"
                    color={isAchieved ? 'white' : 'whiteAlpha.900'}
                  >
                    {milestone.name}
                  </Text>
                  <Text
                    fontSize="xs"
                    color={isAchieved ? 'white' : 'whiteAlpha.800'}
                    fontWeight="medium"
                  >
                    {milestone.requiredProgress}%
                  </Text>
                  {isNext && (
                    <Badge
                      colorScheme="blue"
                      variant="solid"
                      fontSize="xs"
                      mt={1}
                    >
                      Next milestone
                    </Badge>
                  )}
                </VStack>
              </HStack>
            </Flex>
          );
        })}
      </Container>
    </Box>
  );
};

export default MilestoneDisplay; 