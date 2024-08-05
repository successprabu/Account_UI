import React, { useState } from 'react';
import { Button } from 'react-bootstrap';
import { AiOutlinePlus, AiOutlineMinus } from 'react-icons/ai';
import styled from 'styled-components';
import { useTranslation } from "react-i18next";

const DashboardContainer = styled.div`
  padding: 20px;
`;

const Section = styled.div`
  margin-bottom: 20px;
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  background-color: #0e2238;
  color: white;
  padding: 10px;
  border-radius: 5px;
`;

const SectionContent = styled.div`
  background-color: #f5f5f5;
  padding: 10px;
  border-radius: 5px;
  display: ${(props) => (props.expanded ? 'block' : 'none')};
`;

const DashboardAdmin = () => {
  const { t } = useTranslation();
  const [isClientListExpanded, setIsClientListExpanded] = useState(false);
  const [showClientDetails, setShowClientDetails] = useState(false);

  const toggleClientList = () => {
    setIsClientListExpanded(!isClientListExpanded);
  };

  const handleClientListTitleClick = () => {
    setShowClientDetails(!showClientDetails);
  };

  return (
    <DashboardContainer>

      <Section>
        <SectionHeader onClick={toggleClientList}>
          <span>  {t('clientListTitle')}</span>
          {isClientListExpanded ? <AiOutlineMinus /> : <AiOutlinePlus />}
        </SectionHeader>
        <SectionContent expanded={isClientListExpanded}>
        {t('clientListTitle')}
        </SectionContent>
      </Section>

      {isClientListExpanded && (
        <Section>
          <SectionHeader onClick={handleClientListTitleClick}>
            <span>        {t('recentlyCreated')}</span>
          </SectionHeader>
          <SectionContent expanded={showClientDetails}>
          {t('recentlyCreated')}
          </SectionContent>
        </Section>
      )}
    </DashboardContainer>
  );
};

export default DashboardAdmin;
