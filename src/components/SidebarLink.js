import { Link } from "react-router-dom";
import styled from "styled-components";

const Wrapper = styled.div`
    text-align: center;
    padding: 10px 0;
    display: ${({ variant }) => variant ? variant : 'block'};
`;

const ActualLink = styled.a`
    &:hover {
        text-decoration: underline;
    } 
    color: #FFF;
    text-decoration: none;
`;

const SidebarLink = ({ children, variant, ...props }) => (
    <Wrapper variant={variant}>
        <ActualLink as={Link} {...props}>
            {children}
        </ActualLink>
    </Wrapper>
)

export default SidebarLink;