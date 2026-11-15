import styled  from 'styled-components';
import Table  from 'react-bootstrap/Table';
import {
  Row,
  Col,
  Form,
  Button,
  InputGroup,
  Pagination,
  FormLabel,
} from "react-bootstrap";


/* Shared table for list and report screens; colours follow the design tokens (--ms-*). */
export const ClientTable = styled(Table)`
  font-size: 0.8125rem !important;
  border: 1px solid var(--ms-border) !important;
  border-radius: var(--ms-radius-lg);
  overflow: hidden;
  background: var(--ms-paper);
  thead tr {
    border: none;
  }
  th {
    background-color: var(--ms-sunken) !important;
    color: var(--ms-text-secondary) !important;
    font-weight: 600 !important;
    font-size: 0.75rem !important;
    letter-spacing: 0.02em;
    border: none !important;
    border-bottom: 1px solid var(--ms-border) !important;
    white-space: nowrap;
    padding: 0.7rem 0.75rem !important;
  }
  tbody {
    color: var(--ms-text);
    background-color: var(--ms-paper);
    tr {
      border: none;
    }
    tr:hover td {
      background-color: rgba(99, 102, 241, 0.04);
    }
    td {
      border: none;
      font-size: 0.8125rem;
      color: var(--ms-text);
      vertical-align: middle !important;
      border-bottom: 1px solid var(--ms-border);
      padding: 0.6rem 0.75rem;
    }
  }`

const HorizontalMargin = styled.span`
  display: flex;
  width: ${({ margin }) =>
    typeof margin === "string" ? margin : `${margin}px`};
`;

const VerticalMargin = styled.span`
  display: flex;
  height: ${({ margin }) =>
    typeof margin === "string" ? margin : `${margin}px`};
    `;

function Marginer(props) {
  const { direction } = props;

  if (direction === "horizontal") return <HorizontalMargin {...props} />;
  else {
    return <VerticalMargin {...props} />;
  }
}

Marginer.defaultProps = {
  direction: "horizontal",
};

export { Marginer };

export const BoxContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  //align-items: center;
  margin-top: 10px;
`;

export const FormContainer = styled.form`
  width: 100%;
  display: flex;
  flex-direction: column;
  //box-shadow: 0px 0px 2.5px rgba(15, 15, 15, 0.19);
`;

export const MutedLink = styled.a`
  color: rgba(200, 200, 200, 1);
  font-size: 11px;
  font-weight: 500;
  margin: 10px 0;
  text-decoration: none;
`;

export const BoldLink = styled.a`
  color: rgba(241, 196, 15, 1);
  font-weight: 600;
  font-size: 11px;
  text-decoration: none;
  margin: 0 3px;
`;

export const Input = styled.input`
  width: 100%;
  height: 42px;
  outline: none;
  border: 1px solid rgba(200, 200, 200, 0.03);
  padding: 0 10px;
  transition: all, 200ms ease-in-out;
  box-sizing: border-box;
  border-bottom: 1.4px solid transparent;

  &::placeholder {
    color: rgba(200, 200, 200, 1);
  }

  &:not(:last-of-type) {
    border-bottom: 1.4px solid rgba(200, 200, 200, 0.4);
  }

  &:focus {
    outline: none;
    //box-shadow: 0px 0px 2px rgba(200, 200, 200, 1);
    border-bottom: 2px solid rgba(241, 196, 15, 1);
  }
`;

export const SubmitButton = styled.button`
  padding: 11px 40%;
  width: 100%;
  color: #fff;
  font-size: 15px;
  font-weight: 600;
  border: none;
  border-radius: 100px 100px 100px 100px;
  cursor: pointer;
  transition: all, 240ms ease-in-out;

  background: rgba(241, 196, 15, 1);
  background: linear-gradient(
    58deg,
    rgba(241, 196, 15, 1) 20%,
    rgba(243, 172, 18, 1) 100%
  );

  &:focus {
    outline: none;
  }

  &:hover {
    filter: brightness(1.03);
  }

  &:disabled {
    filter: contrast(0.7);
  }
`;

export const FieldContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
`;

export const FieldError = styled.span`
  color: #b32e2e;
  font-size: 11px;
  min-height: 18px;
`;

export const FormSuccess = styled.span`
  color: #28a828;
  font-size: 12px;
  min-height: 20px;
  font-weight: 600;
`;

export const FormError = styled.span`
  color: #b32e2e;
  font-size: 12px;
  min-height: 20px;
  font-weight: 600;
`;
export const SearchForm = styled(Form)`
  font-size: 0.9375rem;
  margin-bottom: 20px;
  padding: 16px;
  background: var(--ms-paper);
  border: 1px solid var(--ms-border);
  border-radius: var(--ms-radius-lg);
`;

export const SearchInput = styled(Form.Control)`
  font-size: 0.9375rem;
  border-radius: var(--ms-radius-md);
  padding: 0.45rem 0.85rem;
`;

const buttonBase = `
  font-size: 0.875rem;
  font-weight: 600;
  width: auto;
  min-height: 40px;
  padding: 0.45rem 1rem;
  border-radius: var(--ms-radius-md);
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin: 20px 8px 0 0;
`;

export const SearchButton = styled(Button).attrs({
  variant: 'primary',
  type: 'submit',
})`
  ${buttonBase}
`;
export const SaveButton = styled(Button).attrs({
  variant: 'success',
  type: 'submit',
})`
  ${buttonBase}
`;
export const ClearButton = styled(Button).attrs({
  variant: 'secondary',
})`
  ${buttonBase}
`;
export const SearchLabel = styled(Form.Label)`
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--ms-text-secondary);
  margin-bottom: 0.35rem;
`;

export const PageSizeSelect = styled(Form.Control)`
  width: auto;
  display: inline-block;
  border-radius: var(--ms-radius-md);
  min-height: 36px;
  padding: 0.3rem 2rem 0.3rem 0.75rem;
`;

export const PaginationWrapper = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 16px;
  .pagination {
    gap: 4px;
    margin: 0;
  }
  .page-link {
    border-radius: var(--ms-radius-md) !important;
    min-width: 36px;
    text-align: center;
  }
`;

export const PageSizeWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  font-size: 0.875rem;
  color: var(--ms-text-secondary);
`;

export const TotalRow = styled.tr`
  td {
    background-color: rgba(99, 102, 241, 0.08) !important;
    color: var(--ms-text) !important;
    font-weight: 700;
    border-top: 2px solid var(--ms-primary) !important;
  }
`;
export const PdfButton = styled(Button).attrs({
  variant: 'outline-secondary',
  type: 'button',
})`
  ${buttonBase}
  color: var(--ms-error);
  border-color: var(--ms-border);
  background: var(--ms-paper);
  &:hover,
  &:focus {
    color: var(--ms-error);
    background: rgba(239, 68, 68, 0.08);
    border-color: var(--ms-error);
  }
`;
export const ExcelButton = styled(Button).attrs({
  variant: 'outline-secondary',
  type: 'button',
})`
  ${buttonBase}
  color: var(--ms-success);
  border-color: var(--ms-border);
  background: var(--ms-paper);
  &:hover,
  &:focus {
    color: var(--ms-success);
    background: rgba(16, 185, 129, 0.08);
    border-color: var(--ms-success);
  }
`;