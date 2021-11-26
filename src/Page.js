import styled from "styled-components";
import { default as SidebarLink_m } from "./components/SidebarLink";
import { useAuth } from './services/AuthContext';

const ParentPage = styled.div`
  height: 100vh;
  display: flex;
  font-family: Montserrat, sans-serif;
  font-size: 24px;
  color: #FFF;
`;

const Sidebar = styled.div`
  width: 150px;
  background: #292A36;
  height: 100%;
  padding: 20px 0;
  display: flex;
  flex-direction: column;
`
const MainContent = styled.div`
  background: #393B4B;
  height: 100%;
  flex-grow: 1;
  padding: 20px;
  display: flex;
`;

const LogoText = styled.div`
  font-weight: 600;
  text-align: center;
  margin-bottom: 28px;
`;


const Main = styled.div`
  flex-grow: 1;
`;

const Footer = styled.div`
  text-align: center;
`;

const SidebarLink = styled(SidebarLink_m)`
  font-size: 24px;
  display: inline;
  background: initial;
  outline: initial;
  border: 0;
  color: #FFF;
  cursor: pointer;
  &:hover {
        text-decoration: underline;
    } 
`;

const Page = ({ sidebar, content }) => {
  const { currentUser, signInWithGoogle } = useAuth();

  return (
    <ParentPage>
      <Sidebar>
        <Main>
          <LogoText>
            CHECKERS
          </LogoText>
          {sidebar}
        </Main>
        <Footer>
          {currentUser ?
            `${currentUser.authData.displayName} ${currentUser.currentELO}` :
            <SidebarLink as="button" onClick={signInWithGoogle}>Sign In</SidebarLink>
          }
        </Footer>
      </Sidebar>
      <MainContent>
        {content}
      </MainContent>
    </ParentPage>
  )
};

export default Page;