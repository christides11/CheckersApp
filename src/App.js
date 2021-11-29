import { BrowserRouter, Route, Routes } from "react-router-dom";
import { createGlobalStyle } from "styled-components";
import Home from "./pages/Home";
import LocalMatch from "./pages/LocalMatch";
import OnlineMatch from "./pages/OnlineMatch";
import Profile from "./pages/Profile";
import Rankings from "./pages/Rankings";
import PrivateRoute from "./PrivateRoute";
import AuthContextProvider from "./services/AuthContext";

const GlobalStyle = createGlobalStyle`
  * {
    box-sizing: border-box;
  }
  body {
    margin: 0;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
`

function App() {
  return (
    <>
      <GlobalStyle />
      <BrowserRouter>
        <AuthContextProvider>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/rankings" element={<Rankings />} />
            <Route path="/localmatch" element={<LocalMatch />} />
            <Route path="/onlinematch" element={<PrivateRoute><OnlineMatch /></PrivateRoute>} />
            <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
          </Routes>
        </AuthContextProvider>
      </BrowserRouter>
    </>
  );
}

export default App;
