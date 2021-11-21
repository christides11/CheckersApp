import styled from "styled-components";

const Wrapper = styled.div`
    text-align: center;
    padding: 10px 0;
`;

const ActualLink = styled.a`
    &:hover {
        text-decoration: underline;
    } 
    color: #FFF;
    text-decoration: none;
`;

const SidebarLink = ({ children, ...props }) => (
    <Wrapper>
        <ActualLink {...props}>
            {children}
        </ActualLink>
    </Wrapper>
)

export default SidebarLink;