import { extendTheme } from '@chakra-ui/react'

const theme = extendTheme({
  styles: {
    global: {
      body: {
        bg: 'gray.50',
      },
    },
  },
  components: {
    Button: {
      defaultProps: {
        colorScheme: 'blue',
      },
    },
    Progress: {
      defaultProps: {
        colorScheme: 'blue',
        size: 'lg',
      },
    },
  },
})

export default theme 