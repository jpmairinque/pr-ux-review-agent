import { useMemo, useState } from "react";
import {
  Box,
  Container,
  CssBaseline,
  IconButton,
  Stack,
  ThemeProvider,
  Tooltip,
  Typography,
  createTheme,
} from "@mui/material";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import TodoList from "./components/TodoList";
import { tokens } from "./theme";

function App() {
  const [mode, setMode] = useState("light");
  const theme = useMemo(() => createTheme(tokens(mode)), [mode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="md" sx={{ py: { xs: 2, md: 5 } }}>
        <Stack spacing={2}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            gap={2}
          >
            <Box>
              <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
                Todo UX Lab
              </Typography>
            </Box>
            <Tooltip
              title={`Switch to ${mode === "light" ? "dark" : "light"} mode`}
            >
              <IconButton
                aria-label="toggle color theme"
                onClick={() =>
                  setMode((prev) => (prev === "light" ? "dark" : "light"))
                }
              >
                {mode === "light" ? (
                  <DarkModeOutlinedIcon />
                ) : (
                  <LightModeOutlinedIcon />
                )}
              </IconButton>
            </Tooltip>
          </Box>

          <input type="text"/>

          <TodoList />
        </Stack>
      </Container>
    </ThemeProvider>
  );
}

export default App;
