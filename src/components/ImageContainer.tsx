import React from "react";
import styled from "styled-components";
import picture from "../assets/profilepic.jpg"

const Wrapper = styled.div`
  max-width: 80%;
  margin: 0 auto;
`;

const StyledImage = styled.img`
  max-width: 100%;
  border: solid 4px white;
  border-radius: 50%;
  box-shadow: rgba(0, 0, 0, 0.25) 0px 12px 22px, 
    rgba(0, 0, 0, 0.12) 0px -6px 15px, 
    rgba(0, 0, 0, 0.12) 0px 2px 3px, 
    rgba(0, 0, 0, 0.17) 0px 6px 7px, 
    rgba(0, 0, 0, 0.09) 0px -1px 2px
`;

export default function ImageContainer() {
  return (
    <Wrapper>
      <StyledImage src={picture}/>
    </Wrapper>
  );
};