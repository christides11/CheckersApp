import { useEffect } from 'react';
import styled from 'styled-components';
import avatar from "../assets/avatar.png";
import { default as DeadCenter_m } from '../components/DeadCenter';
import Page from '../Page';
import { useAuth } from '../services/AuthContext';

const DeadCenter = styled(DeadCenter_m)`
    text-align: center;
`;

const AvatarImage = styled.img`
  width: 121px;
  height: 121px;
  border-radius: 50%;
  margin-top: 21px;
`;

const EloDisplay = styled.div`
  margin-top: 21px;
`;

const Content = () => {
  const { currentUser } = useAuth();
  useEffect(() => {
    console.log(currentUser);
  }, [currentUser]);
  return (
    <DeadCenter>
      {currentUser.authData.displayName}
      <div>
        <AvatarImage src={currentUser.authData.photoURL ? currentUser.authData.photoURL : avatar} />
      </div>
      <EloDisplay>
        {currentUser.currentELO} ELO Score
      </EloDisplay>
    </DeadCenter>
  )
};

const Profile = () => (
  <Page content={<Content />} />
);

export default Profile;