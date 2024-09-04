import React, { useState, useEffect, useRef } from "react";
import { Row, Col, InputGroup, Form, Table, Pagination } from "react-bootstrap";
import { FaSearch, FaTimes, FaFilePdf, FaFileExcel } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { API_SERVICE } from "../../common/CommonMethod";
import {  REPORT_GET_REGIONALSUMMARY_API } from "../../common/CommonApiURL";
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import * as XLSX from "xlsx";
import i18n from "../../../language/i18n";
import Header from "../../common/Header";
import { StyleSheet } from "@react-pdf/renderer";
import {
  SearchButton,
  ClearButton,
  PageSizeWrapper,
  PageSizeSelect,
  PaginationWrapper,
  PdfButton,
  ExcelButton,
} from "../css/styles";
import Translator from "../../common/TranslationBasedOnLanguage";

const styles = StyleSheet.create({
  page: {
    padding: 20,
  },
  table: {
    display: "table",
    width: "auto",
    margin: "0 auto",
    borderCollapse: "collapse",
  },
  page: {
    padding: 20,
    fontFamily: "Noto Sans Tamil, sans-serif",
  },
  tableHeader: {
    borderBottom: "1px solid black",
    padding: 10,
  },
  tableCell: {
    padding: 10,
    borderBottom: "1px solid black",
  },
  total: {
    fontWeight: "bold",
  },
});

const RegionalSummaryReport = () => {
  const [reportData, setReportData] = useState([]);
  const [placeName, setPlaceName] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const pdfExportComponent = useRef(null);
  const { t } = useTranslation();
  const [pageTotals, setPageTotals] = useState({
    total: 0,
  });

  const [fieldBeingTranslated, setFieldBeingTranslated] = useState(null);
  const fetchReportData = async (page = 1, size = 10) => {
    try {
      const user = localStorage.getItem("user");
      const response = await API_SERVICE.get(REPORT_GET_REGIONALSUMMARY_API, {
        customer_id: JSON.parse(user).customerID,
        trans_type: "R",
        report_type: "REGIONAL",
        userId: JSON.parse(user).id || 0,
        current_page: page,
        page_size: size,
        village_name: placeName,
        function_id:JSON.parse(user).functionId || 0,
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
    try {
      const user = localStorage.getItem("user");
      const response = await API_SERVICE.get(REPORT_GET_REGIONALSUMMARY_API, {
        customer_id: JSON.parse(user).customerID,
        trans_type: "E",
        report_type: "EXPENSES",
        userId: 0, //JSON.parse(user).id||0,
        village_name: placeName,
        function_id:JSON.parse(user).functionId || 0,
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
  const calculatePageTotals = (data) => {
    const totals = data.reduce(
      (acc, item) => ({
        total: acc.total + item.total,
      }),
      {  total: 0 }
    );
    setPageTotals(totals);
  };

  useEffect(() => {
    fetchReportData(currentPage, pageSize).then((data) => {
      setReportData(data);
      calculatePageTotals(data);
    });
  }, [currentPage, pageSize]);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchReportData(1, pageSize).then((data) => {
      setReportData(data);
      setTotalPages(data.totalPages);
    });
  };

  const handleClear = () => {
    setPlaceName("");
    setCurrentPage(1);
    fetchReportData(1, pageSize).then((data) => {
      setReportData(data);
      setTotalPages(data.totalPages);
    });
  };

  const exportToExcel = async () => {
    const allData = await fetchAllReportData();
    const ws = XLSX.utils.json_to_sheet(allData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "RegionalReport");
    XLSX.writeFile(wb, "RegionalReport.xlsx");
  };

  const DownloadPDF = async () => {
    try {
      // Check if the ref is correctly pointing to the PDFExport component
      if (pdfExportComponent.current) {
        // Use html2canvas to capture the content of the PDFExport component
        const pdfElement = pdfExportComponent.current;
        const canvas = await html2canvas(pdfElement);
        const imgData = canvas.toDataURL('image/png');
  
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;
        const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
        const imgX = (pdfWidth - imgWidth * ratio) / 2;
        const imgY = 30; // Adjust this value as needed
  
        pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
        pdf.save("RegionalSummaryReport.pdf");
      } else {
        console.error("PDF export component not found");
      }
    } catch (error) {
      console.error("Error exporting to PDF:", error);
    }
  };

  const handleTranslation = (translatedText) => {
    if (fieldBeingTranslated) {
      if (fieldBeingTranslated === "placeName") {
        setPlaceName(translatedText);
      }
      setFieldBeingTranslated(null);
    }
  };

  const handleChange = (e, setState, fieldName) => {
    const { value } = e.target;
    setState(value);
    if (value.endsWith(" ")) {
      setFieldBeingTranslated(fieldName);
      // Initiate translation
      handleTranslation(value.trim());
    }
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
        titles={[t("locationAmountReport")]}
        links={[
          { to: "/dashboard", label: t("dashboard") },
        ]}
      />
      <Row>
        <Col>
          <Form onSubmit={handleSearch} className="mb-3">
            <Row className="align-items-end">
              <Col xs={12} md={4}>
                <Form.Group controlId="formPlaceName">
                  <Form.Label>{t("placeName")}</Form.Label>
                  <InputGroup>
                    <Form.Control
                      type="text"
                      placeholder={t("placeName")}
                      value={placeName}
                      onChange={(e) =>
                        handleChange(e, setPlaceName, "placeName")
                      }
                    />
                  </InputGroup>
                </Form.Group>
              </Col>
              
            </Row>
            <Row className="justify-content-between align-items-end mt-3">
              <Col xs={12} md={4} className="text-left">
                <div className="d-flex align-items-center">
                  <SearchButton>
                    <FaSearch className="mr-2" /> {t("search")}
                  </SearchButton>
                  <ClearButton onClick={handleClear}>
                    <FaTimes className="mr-2" /> {t("clearButton")}
                  </ClearButton>
                </div>
              </Col>

              <Col xs={12} md={4} className="text-right">
                <div className="d-flex justify-content-end align-items-center">
                  <PdfButton onClick={DownloadPDF}>
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
      {/* Translator Component */}
      {fieldBeingTranslated && (
        <Translator
          inputText={
               fieldBeingTranslated === "placeName"
              ? placeName
              : ""
          }
          onTranslated={handleTranslation}
          sourceLanguage="en"
          targetLanguage={i18n.language || "en"}
        />
      )}

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

      <div ref={pdfExportComponent}>
          <Table responsive className="table table-striped">
            <thead>
              <tr>
                <th>{t("sNo")}</th>
                <th>{t("placeName")}</th>
                <th>{t("total")}</th>
              </tr>
            </thead>
            <tbody>
              {reportData.length > 0 ? (
                reportData.map((item, index) => (
                  <tr key={index}>
                    <td style={{ fontFamily: "Noto Sans Tamil, sans-serif" }}>
                      {(currentPage - 1) * pageSize + index + 1}
                    </td>
                    <td style={{ fontFamily: "Noto Sans Tamil, sans-serif" }}>
                      {item.villageName}
                    </td>
                    <td style={{ fontFamily: "Noto Sans Tamil, sans-serif" }}>
                      {item.total}
                    </td>
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

            <tfoot
              style={{
                fontWeight: "bold",
              }}
            >
              <tr>
                <td colSpan="2">{t("total")}</td>
                <td>{pageTotals.total}</td>
              </tr>
            </tfoot>
          </Table>
        </div>

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

export default RegionalSummaryReport;
