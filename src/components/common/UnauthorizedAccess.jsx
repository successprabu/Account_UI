import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const UnauthorizedContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  text-align: center;
`;

const UnauthorizedHeading = styled.h1`
  color: red;
  font-size: 2em;
  margin-bottom: 20px;
`;

const UnauthorizedText = styled.p`
  margin-bottom: 20px;
`;

const UnauthorizedButton = styled.button`
  background-color: darkblue;
  color: white;
  border: none;
  padding: 10px 20px;
  font-size: 1em;
  cursor: pointer;
  border-radius: 5px;

  &:hover {
    background-color: navy;
  }
`;

const Unauthorized = () => {
  const navigate = useNavigate();

  const handleLoginRedirect = () => {
    navigate('/login');
  };

  return (
    <UnauthorizedContainer>
      <UnauthorizedHeading>Unauthorized Access</UnauthorizedHeading>
      <UnauthorizedText>You do not have permission to view this page.</UnauthorizedText>
      <UnauthorizedButton onClick={handleLoginRedirect}>
        Go to Login
      </UnauthorizedButton>
    </UnauthorizedContainer>
  );
};

export default Unauthorized;
