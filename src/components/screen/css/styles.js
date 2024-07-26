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

export const ClientTable = styled(Table)`
  font-size: 10px !important;
  border: 1px solid #DFDFDF !important;
  border-bottom: none !important;
  thead {
    tr {
      border: none;
    }
  }

  th {
    background-color: #F2FAFF !important;
    color: #17A1FA !important;
    text-transform: uppercase !important;
    border: none !important;
    font-weight: 600 !important;
    border-bottom: 1px solid #DFDFDF !important;
  }

  tbody {
    color: #000080;
    background-color: #fff;    
    tr {
      border: none;
    }

    td {
      border: none;
      font-size: 11px;
      color: #000080;
      vertical-align: middle !important;
      border-bottom:  1px solid rgba(167, 167, 167, 0.2);
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
  font-size: 1rem;
  font-family: "Trebuchet MS", "Lucida Sans Unicode", "Lucida Grande",
    "Lucida Sans", "Arial, sans-serif";
  margin-bottom: 20px;
`;

export const SearchInput = styled(Form.Control)`
  font-size: 1rem;
  border: 1px solid #ced4da;
  border-radius: 0.6rem;
  padding: 0.375rem 0.95rem;
  font-size: 1rem;
  color: #044179;
`;

export const SearchButton = styled(Button)`
  font-size: 1rem;
  width: 100%;
  @media (min-width: 768px) {
    width: auto;
    margin-top: 20px;
  }
`;

export const ClearButton = styled(Button)`
  margin-left: 5px;
  margin-top: 20px;
  margin-left: 20px;
`;

export const SearchLabel = styled(Form.Label)`
  font-family: "Trebuchet MS", "Lucida Sans Unicode", "Lucida Grande",
    "Lucida Sans", "Arial, sans-serif";
  font-size: 1rem;
  color: #0e2238;
`;

export const PageSizeSelect = styled(Form.Control)`
  width: auto;
  display: inline-block;
`;

export const PaginationWrapper = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 10px;
`;

export const PageSizeWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
`;

export const TotalRow = styled.tr`
  background-color: red;
  color: red;
  font-weight: bold;
`;