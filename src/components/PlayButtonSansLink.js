import styled from "styled-components";

const Button = styled.button`
    text-decoration: none;
    &:hover {
        background: #158613;
    }
    display: inline-block;
    background: #19A017;
    color: #FFF;
    font-size: 24px;
    border: none;
    outline: inherit;
    cursor: pointer;
    /* width: 240px; */
    height: 60px;
`;

const PlayButtonSansLink = ({ children, className, ...props }) => (
  <div className={className}>
    <Button {...props}>
      {children}
    </Button>
  </div>
);

export default PlayButtonSansLink;