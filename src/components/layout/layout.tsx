import styled from 'styled-components';
import SVG from '../../assets/bg.svg';
import GlassCard from '../GlassCard';

const StyledDiv = styled.div`
    height: 80vh;
    padding: 10vh;
    background-image: url(${SVG});
    background-repeat: no-repeat;
    background-size: cover;
`;


type LayoutProps = {
    children: any;
}

export default function Layout({children}: LayoutProps): JSX.Element {
    return(
        <StyledDiv>
            <GlassCard title="Mathias Bøe" subtitle="this is flavortext">
                <h1>hello world</h1>
                <p>I'm baby live-edge migas iceland, synth semiotics mlkshk small batch. Kogi shabby chic sartorial twee, 
                    mumblecore YOLO paleo VHS glossier chicharrones pinterest gentrify health goth. Mlkshk biodiesel celiac 
                    next level hot chicken marfa. Gluten-free ethical mumblecore taxidermy offal cold-pressed. Pug craft beer raw denim, 
                    mixtape woke kickstarter irony butcher gentrify ramps PBR&B pabst banjo. Church-key activated charcoal jean shorts, 
                    meditation pok pok hexagon man braid pickled.</p>
            {children}
            </GlassCard>
        </StyledDiv>
    )
}