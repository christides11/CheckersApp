import { createGlobalStyle } from "styled-components";
import Home from "./pages/Home";
import AuthContextProvider from "./services/AuthContext";

const GlobalStyle = createGlobalStyle`
  * {
    box-sizing: border-box;
  }
`

function App() {
  return (
    <>
      <GlobalStyle />
      <AuthContextProvider>
        <Home />
      </AuthContextProvider>
    </>
  );
}

export default App;
