import styled from "styled-components"

const Button = styled.button`
    &:hover {
        background: #158613;
    }
    display: inline-block;
    background: #19A017;
    padding: 16px 45px;
    color: #FFF;
    font-size: 24px;
    border: none;
    outline: inherit;
    cursor: pointer;
`;

const Wrapper = styled.div``;

const PlayButton = ({ children, className, ...props }) => (
    <Wrapper className={className}>
        <Button {...props}>
            {children}
        </Button>
    </Wrapper>
);

export default PlayButton;