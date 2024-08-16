import React, { useState, useEffect, useRef } from "react";
import { Row, Col, InputGroup, Form, Table, Pagination } from "react-bootstrap";
import { FaSearch, FaTimes, FaFilePdf, FaFileExcel } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { API_SERVICE } from "../../common/CommonMethod";
import { REPORT_API } from "../../common/CommonApiURL";
import { PDFExport } from "@progress/kendo-react-pdf";
import * as XLSX from "xlsx";
import Header from "../../common/Header";
import {
  SearchButton,
  ClearButton,
  PageSizeWrapper,
  PageSizeSelect,
  PaginationWrapper,
  TotalRow,
  PdfButton,
  ExcelButton,
} from "../css/styles";

const ReportPage = () => {
  const [reportData, setReportData] = useState([]);
  const [name, setName] = useState("");
  const [placeName, setPlaceName] = useState("");
  const [mobile, setMobile] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const pdfExportComponent = useRef(null);
  const { t } = useTranslation();

  const fetchReportData = async (page = 1, size = 10) => {
    try {
      const user = localStorage.getItem("user");
      const response = await API_SERVICE.get(REPORT_API, {
        customer_id: JSON.parse(user).customerID,
        report_type: "INCOME",
        userId: JSON.parse(user).id||0,
        current_page: page,
        page_size: size,
        customer_name: name,
        village_name: placeName,
        mobile: mobile,
      });
      if (response.data.result) {
        return response.data.data;
      } else {
        console.error("No Records Found");
        return { transactions: [], totalPages: 1 };
      }
    } catch (error) {
      console.error("Error fetching report data:", error);
      return { transactions: [], totalPages: 1 };
    }
  };

  const fetchAllReportData = async () => {
    let allData = [];
    for (let page = 1; page <= totalPages; page++) {
      const data = await fetchReportData(page, pageSize);
      allData = allData.concat(data.transactions);
    }
    return allData;
  };

  useEffect(() => {
    fetchReportData(currentPage, pageSize).then((data) => {
      setReportData(data.transactions);
      setTotalPages(data.totalPages);
    });
  }, [currentPage, pageSize]);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchReportData(1, pageSize).then((data) => {
      setReportData(data.transactions);
      setTotalPages(data.totalPages);
    });
  };

  const handleClear = () => {
    setName("");
    setPlaceName("");
    setMobile("");
    setCurrentPage(1);
    fetchReportData(1, pageSize).then((data) => {
      setReportData(data.transactions);
      setTotalPages(data.totalPages);
    });
  };

  const exportToExcel = async () => {
    const allData = await fetchAllReportData();
    const ws = XLSX.utils.json_to_sheet(allData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Report");
    XLSX.writeFile(wb, "Report.xlsx");
  };

  const exportToPDF = async () => {
    const allData = await fetchAllReportData();
    setReportData(allData); // Temporarily set the report data to all data
    pdfExportComponent.current.save();
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (e) => {
    setPageSize(Number(e.target.value));
    setCurrentPage(1);
  };

  return (
    <div>
      <Header
        titles={[t("receiptReport")]}
        links={[
          { to: "/dashboard", label: t("dashboard") },
          { to: "/transaction", label: t("addTransaction") },
        ]}
      />
      <Row>
        <Col>
          <Form onSubmit={handleSearch} className="mb-3">
            <Row className="align-items-end">
              <Col xs={12} md={4}>
                <Form.Group controlId="formName">
                  <Form.Label>{t("name")}</Form.Label>
                  <InputGroup>
                    <Form.Control
                      type="text"
                      placeholder={t("name")}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </InputGroup>
                </Form.Group>
              </Col>
              <Col xs={12} md={4}>
                <Form.Group controlId="formPlaceName">
                  <Form.Label>{t("placeName")}</Form.Label>
                  <InputGroup>
                    <Form.Control
                      type="text"
                      placeholder={t("placeName")}
                      value={placeName}
                      onChange={(e) => setPlaceName(e.target.value)}
                    />
                  </InputGroup>
                </Form.Group>
              </Col>
              <Col xs={12} md={4}>
                <Form.Group controlId="formMobile">
                  <Form.Label>{t("mobile")}</Form.Label>
                  <InputGroup>
                    <Form.Control
                      type="text"
                      placeholder={t("mobile")}
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                    />
                  </InputGroup>
                </Form.Group>
              </Col>
            </Row>
            <Row className="justify-content-between align-items-end mt-3">
              <Col xs={12} md={4} className="text-left">
                <div className="d-flex align-items-center">
                  <SearchButton type="submit">
                    <FaSearch className="mr-2" /> {t("search")}
                  </SearchButton>
                  <ClearButton onClick={handleClear}>
                    <FaTimes className="mr-2" /> {t("clearButton")}
                  </ClearButton>
                </div>
              </Col>
              <Col xs={12} md={4} className="text-center">
                <PageSizeWrapper>
                  <Form.Label>{t("pageSize")}</Form.Label>
                  <PageSizeSelect
                    as="select"
                    value={pageSize}
                    onChange={handlePageSizeChange}
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                    <option value={200}>200</option>
                    <option value={500}>500</option>
                    <option value={1000}>1000</option>
                    <option value={5000}>5000</option>
                    <option value={10000}>10000</option>
                    <option value={50000}>50000</option>
                  </PageSizeSelect>
                </PageSizeWrapper>
              </Col>
              <Col xs={12} md={4} className="text-right">
                <div className="d-flex justify-content-end align-items-center">
                  <PdfButton onClick={exportToPDF}>
                    <FaFilePdf className="mr-2" /> {t("downloadPdf")}
                  </PdfButton>
                  <ExcelButton onClick={exportToExcel}>
                    <FaFileExcel className="mr-2" /> {t("exportExcel")}
                  </ExcelButton>
                </div>
              </Col>
            </Row>
          </Form>
        </Col>
      </Row>
      <PDFExport
        ref={pdfExportComponent}
        paperSize="A4"
        fileName="Report.pdf"
        scale={0.6}
        style={{
          fontFamily: "'Noto Sans Tamil', sans-serif",
        }}
      >
        <Table responsive className="table table-striped">
          <thead>
            <tr>
              <th>{t("placeName")}</th>
              <th>{t("initial")}</th>
              <th>{t("name")}</th>
              <th>{t("amount")}</th>
              <th>{t("phoneNo")}</th>
            </tr>
          </thead>
          <tbody>
            {reportData.length > 0 ? (
              reportData.map((record) => (
                <tr key={record.id}>
                  <td>{record.villageName}</td>
                  <td>{record.initial}</td>
                  <td>{record.name}</td>
                  <td>{record.amount}</td>
                  <td>{record.phoneNo}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center">
                  {t("noData")}
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </PDFExport>
      <TotalRow>
        <td colSpan="4">
          {t("totalRecords")}: {reportData.length}
        </td>
      </TotalRow>
      <PaginationWrapper>
        <Pagination>
          <Pagination.First
            onClick={() => handlePageChange(1)}
            disabled={currentPage === 1}
          />
          <Pagination.Prev
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          />
          {[...Array(totalPages).keys()].map((x) => (
            <Pagination.Item
              key={x + 1}
              active={x + 1 === currentPage}
              onClick={() => handlePageChange(x + 1)}
            >
              {x + 1}
            </Pagination.Item>
          ))}
          <Pagination.Next
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          />
          <Pagination.Last
            onClick={() => handlePageChange(totalPages)}
            disabled={currentPage === totalPages}
          />
        </Pagination>
      </PaginationWrapper>
    </div>
  );
};

export default ReportPage;
