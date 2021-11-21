import Page from '../Page';
import styled from 'styled-components';
import SidebarLink from '../components/SidebarLink';
import { default as PlayButton_m } from '../components/PlayButton';
import { default as DeadCenter_m } from '../components/DeadCenter';

const PlayButton = styled(PlayButton_m)`
    &:not(:first-child) {
        margin-top: 42px;
    }
`;

const DeadCenter = styled(DeadCenter_m)`
    text-align: center;
`;

const Sidebar = () => (
    <>
        <SidebarLink href="#">Play</SidebarLink>
        <SidebarLink href="#">Rankings</SidebarLink>
    </>
);

const Content = () => (
    <DeadCenter>
        <PlayButton>Play Local</PlayButton>
        <PlayButton>Play Computer</PlayButton>
    </DeadCenter>
);

const Home = () => (
    <Page sidebar={<Sidebar />} content={<Content />} />
);

export default Home;