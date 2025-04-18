import { Box, IconButton, useColorModeValue, Tooltip } from '@chakra-ui/react'
import { useState, useEffect } from 'react'
import { FaSnowflake } from 'react-icons/fa'

interface SnowfallEffectProps {
  isEnabled: boolean;
  onToggle: () => void;
}

const SnowfallEffect = ({ isEnabled, onToggle }: SnowfallEffectProps) => {
  const [snowflakes, setSnowflakes] = useState<Array<{ id: number; left: number; delay: number; size: number }>>([])

  useEffect(() => {
    if (isEnabled) {
      const flakes = Array.from({ length: 50 }, (_, index) => ({
        id: index,
        left: Math.random() * 100,
        delay: Math.random() * 10,
        size: Math.random() * 20 + 20
      }))
      setSnowflakes(flakes)
    } else {
      setSnowflakes([])
    }
  }, [isEnabled])

  return (
    <>
      <Tooltip label={`${isEnabled ? 'Disable' : 'Enable'} snowfall effect`} placement="left">
        <IconButton
          aria-label="Toggle snowfall"
          icon={<FaSnowflake />}
          position="fixed"
          top={4}
          right={4}
          zIndex={1000}
          onClick={onToggle}
          variant="ghost"
          color={isEnabled ? "blue.200" : "whiteAlpha.600"}
          _hover={{
            bg: "whiteAlpha.200",
            color: "white"
          }}
          backdropFilter="blur(8px)"
          transition="all 0.2s"
        />
      </Tooltip>

      {isEnabled && snowflakes.map(({ id, left, delay, size }) => (
        <Box
          key={id}
          position="fixed"
          top={0}
          left={`${left}vw`}
          fontSize={`${size}px`}
          color="white"
          opacity={0.7}
          pointerEvents="none"
          zIndex={0}
          animation={`fall 20s linear infinite`}
          style={{
            animationDelay: `${delay}s`,
            willChange: 'transform',
            transform: 'translateZ(0)'
          }}
          sx={{
            '@keyframes fall': {
              '0%': {
                transform: 'translateY(-10vh) translateX(0)',
                opacity: 0
              },
              '10%': {
                opacity: 0.7
              },
              '100%': {
                transform: 'translateY(110vh) translateX(50px)',
                opacity: 0.7
              }
            }
          }}
        >
          ❄️
        </Box>
      ))}
    </>
  )
}

export default SnowfallEffect 