import styled from 'styled-components';
import SidebarLink from './components/SidebarLink';

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

const Page = ({ sidebar, content }) =>
(
  <ParentPage>
    <Sidebar>
      <Main>
        <LogoText>
          CHECKERS
        </LogoText>
        {sidebar}
      </Main>
      <Footer>
        <SidebarLink href="#">Sign In</SidebarLink>
      </Footer>
    </Sidebar>
    <MainContent>
      {content}
    </MainContent>
  </ParentPage>
);

export default Page;