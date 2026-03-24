export const tokens = (mode) => ({
  palette: {
    mode,
    primary: {
      main: mode === 'light' ? '#1565c0' : '#90caf9',
    },
    secondary: {
      main: mode === 'light' ? '#2e7d32' : '#81c784',
    },
    background: {
      default: mode === 'light' ? '#f6f8fb' : '#121212',
      paper: mode === 'light' ? '#ffffff' : '#1e1e1e',
    },
  },
  shape: {
    borderRadius: 12,
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
  components: {
    MuiButtonBase: {
      defaultProps: {
        disableRipple: false,
      },
    },
  },
})
