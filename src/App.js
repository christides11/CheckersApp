import { createGlobalStyle } from 'styled-components'
import Home from './pages/Home'

const GlobalStyle = createGlobalStyle`
  * {
    box-sizing: border-box;
  }
`

function App() {
  return (
    <>
      <GlobalStyle />
      <Home />
    </>
  );
}

export default App;
