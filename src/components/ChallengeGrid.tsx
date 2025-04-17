import { Box, Grid, Tooltip, Text } from '@chakra-ui/react'
import { format, parseISO } from 'date-fns'
import { ChallengeData } from '../types'
import { Global as EmotionGlobal } from '@emotion/react'

interface ChallengeGridProps {
  challengeData: ChallengeData;
}

const ChallengeGrid = ({ challengeData }: ChallengeGridProps) => {
  const getDateForDay = (day: number): string => {
    const startDate = new Date(challengeData.startDate);
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + day - 1);
    return date.toISOString().split('T')[0];
  };

  const getNoteForDate = (date: string): string | undefined => {
    const note = challengeData.notes.find(n => n.date === date);
    return note?.note;
  };

  const getOptimalColumns = (totalDays: number): number => {
    // Calculate square root as a starting point
    const sqrt = Math.sqrt(totalDays);
    
    // Try to find factors of totalDays that give us more columns than rows
    const factors: number[] = [];
    for (let i = 1; i <= totalDays; i++) {
      if (totalDays % i === 0) {
        factors.push(i);
      }
    }

    // Find the factor pair that gives us the most columns while keeping rows reasonable
    let bestColumns = Math.min(Math.ceil(sqrt * 1.5), 12); // Default to slightly wider than square
    
    for (let i = 0; i < factors.length; i++) {
      const cols = factors[i];
      const rows = totalDays / cols;
      
      // We want more columns than rows, but not too many
      if (cols >= rows && cols <= 12 && rows >= 3) {
        bestColumns = cols;
        break;
      }
    }

    // If no perfect factor found, find best fit that gives us more columns
    if (!factors.includes(bestColumns)) {
      // Try numbers from sqrt*1.5 down to 5
      const maxCols = Math.min(Math.ceil(sqrt * 1.5), 12);
      for (let cols = maxCols; cols >= 5; cols--) {
        const rows = Math.ceil(totalDays / cols);
        if (cols >= rows) {
          bestColumns = cols;
          break;
        }
      }
    }

    return bestColumns;
  };

  const columns = getOptimalColumns(challengeData.totalDays);

  return (
    <Box
      position="relative"
      width="100%"
      p={4}
      borderRadius="2xl"
      bg="rgba(15, 23, 42, 0.7)"
      backdropFilter="blur(10px)"
      boxShadow="0 4px 30px rgba(0, 0, 0, 0.1)"
      overflow="hidden"
      _before={{
        content: '""',
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "linear-gradient(-45deg, rgba(56, 189, 248, 0.1), rgba(59, 130, 246, 0.1), rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1))",
        backgroundSize: "400% 400%",
        animation: "waterFlow 15s ease infinite",
        opacity: 0.5,
        zIndex: 0
      }}
    >
      <Grid
        templateColumns={`repeat(${columns}, 1fr)`}
        gap={2}
        position="relative"
        zIndex={1}
      >
        {Array.from({ length: challengeData.totalDays }).map((_, index) => {
          const currentDate = getDateForDay(index + 1);
          const isCompleted = challengeData.completedDates.includes(currentDate);
          const note = getNoteForDate(currentDate);
          const dayNumber = index + 1;

          return (
            <Tooltip
              key={index}
              label={`Day ${dayNumber} - ${format(parseISO(currentDate), 'MMMM d, yyyy')}${note ? `\n${note}` : ''}`}
              hasArrow
              bg="rgba(15, 23, 42, 0.95)"
              color="white"
              borderRadius="md"
              px={3}
              py={2}
            >
              <Box
                width="100%"
                paddingBottom="100%"
                position="relative"
                role="group"
              >
                <Box
                  position="absolute"
                  top={0}
                  left={0}
                  right={0}
                  bottom={0}
                  bg={isCompleted ? "transparent" : "rgba(148, 163, 184, 0.1)"}
                  borderRadius="lg"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  transition="all 0.3s"
                  overflow="hidden"
                  sx={{
                    ...(isCompleted && {
                      background: 'linear-gradient(-45deg, #0ea5e9, #3b82f6, #6366f1, #8b5cf6)',
                      backgroundSize: '300% 300%',
                      animation: 'waterFlow 8s ease infinite'
                    }),
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: 'radial-gradient(circle at center, transparent 30%, rgba(226, 232, 240, 0.3) 70%, transparent 100%)',
                      opacity: 0,
                      transform: 'scale(0.5)',
                      transition: 'all 0.3s',
                      animation: isCompleted ? 'waterRipple 3s ease-in-out infinite' : 'none'
                    }
                  }}
                  _hover={{
                    transform: 'scale(1.05)',
                    boxShadow: '0 4px 20px rgba(148, 163, 184, 0.2)'
                  }}
                >
                  <Text
                    color={isCompleted ? "white" : "gray.400"}
                    fontSize={{ base: "sm", md: "md" }}
                    fontWeight="semibold"
                    zIndex={1}
                    textShadow="0 2px 4px rgba(0,0,0,0.3)"
                  >
                    {dayNumber}
                  </Text>
                </Box>
              </Box>
            </Tooltip>
          );
        })}
      </Grid>

      <EmotionGlobal
        styles={{
          '@keyframes waterFlow': {
            '0%': {
              backgroundPosition: '0% 50%'
            },
            '50%': {
              backgroundPosition: '100% 50%'
            },
            '100%': {
              backgroundPosition: '0% 50%'
            }
          },
          '@keyframes waterRipple': {
            '0%': {
              opacity: 0,
              transform: 'scale(0.5)'
            },
            '50%': {
              opacity: 0.3,
              transform: 'scale(1)'
            },
            '100%': {
              opacity: 0,
              transform: 'scale(0.5)'
            }
          }
        }}
      />
    </Box>
  );
};

export default ChallengeGrid; 