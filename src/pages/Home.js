import styled from 'styled-components';
import { default as DeadCenter_m } from '../components/DeadCenter';
import { default as PlayButton_m } from '../components/PlayButton';
import Page from '../Page';
import { useAuth } from '../services/AuthContext';


const PlayButton = styled(PlayButton_m)`
    &:not(:first-child) {
        margin-top: 42px;
    }
`;

const DeadCenter = styled(DeadCenter_m)`
    text-align: center;
`;

const Content = () => {
  const { currentUser } = useAuth();
  return (
    <DeadCenter>
      {currentUser && (
        <>
          <PlayButton>Play Online</PlayButton>
          <PlayButton>Spectate</PlayButton>
        </>
      )
      }
      <PlayButton>Play Local</PlayButton>
      <PlayButton>Play Computer</PlayButton>
    </DeadCenter>
  )
};

const Home = () => (
  <Page content={<Content />} />
);

export default Home;