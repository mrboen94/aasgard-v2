
import styled from 'styled-components';
import ImageContainer from './ImageContainer';
import Life from './Life';
import Work from './Work';

const StyledDiv = styled.div`
    height: 100%;
    display: flex;
    flex-direction: row;
    background-color: rgba(255,255,255,0.80);
    backdrop-filter: blur(0px);
    -webkit-backdrop-filter: blur(0px);
    -moz-backdrop-filter: blur(0px);
    -ms-backdrop-filter: blur(0px);
    -o-backdrop-filter: blur(0px);
    border-radius: 1em;
    box-shadow: rgba(0, 0, 0, 0.25) 0px 12px 22px, 
        rgba(0, 0, 0, 0.12) 0px -6px 15px, 
        rgba(0, 0, 0, 0.12) 0px 2px 3px, 
        rgba(0, 0, 0, 0.17) 0px 6px 7px, 
        rgba(0, 0, 0, 0.09) 0px -1px 2px;
    transition: all ease 0.5s;
    :hover {
    box-shadow: rgba(0, 0, 0, 0.25) 0px 24px 25px, 
                rgba(0, 0, 0, 0.12) 0px -12px 30px, 
                rgba(0, 0, 0, 0.12) 0px 4px 6px, 
                rgba(0, 0, 0, 0.17) 0px 12px 13px, 
                rgba(0, 0, 0, 0.09) 0px -3px 5px;
    background-color: rgba(255,255,255,0.85);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(2px);
    -moz-backdrop-filter: blur(2px);
    -ms-backdrop-filter: blur(2px);
    -o-backdrop-filter: blur(2px);
    }
`;

const StyledContentContainer = styled.div`
    width: 100%;
    display: flex;
    flex-direction: column;
`;


const StyledTitle = styled.div`
    text-align: center;
    margin: 0 auto;
    padding: 1em;
`;

const StyledSubTitle = styled.div`
    text-align: center;
    margin: 0 auto;
    padding: 1em;
`;

const TopBar = styled.div`
    width: 100%;
    border-radius: 0 1em 0 0;
    height: 10%;
    background-color: rgba(255,255,255,0.5);
`;

const Sideboard = styled.div`
    border-radius: 1em 0 0 1em;
    background-color: rgba(255,255,255,0.5);
    padding: 2em;
    margin: 0;
    width: 25%;
    left: 0;
    top: 0;
    right: 0;
`;

const StyledChildrenContainer = styled.div`
    display: flex;
    justify-content: space-around;
`;

const StyledChildren = styled.div`
    max-width: 200px;
`;

type GlassCardProps = {
    title?: string;
    subtitle?: string;
    children?: any;
}

export default function GlassCard({title, subtitle, children}: GlassCardProps): JSX.Element {
    return(
        <StyledDiv>
            <Sideboard>
                <ImageContainer />
                <StyledTitle>
                    <h1>{title}</h1>
                </StyledTitle>
                <StyledSubTitle>
                    <h2>{subtitle}</h2>
                </StyledSubTitle>
            </Sideboard>
            <StyledContentContainer>
            <TopBar />
            <StyledChildrenContainer>
                <Work />
                <Life />
                <StyledChildren>
                {children}
                </StyledChildren>
            </StyledChildrenContainer>
            </StyledContentContainer>
        </StyledDiv>
    )
}