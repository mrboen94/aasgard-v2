import styled from 'styled-components';

const StyledDiv = styled.div`
    background-color: black;
    padding: 1em;
`;

export default function Layout(): JSX.Element {
    return(
        <StyledDiv>
            <h1>Hello World!</h1>
        </StyledDiv>
    )
}