import React, { useState, useEffect, useRef } from "react";
import { Row, Col, InputGroup, Form, Table, Pagination, Button } from "react-bootstrap";
import { FaSearch, FaTimes, FaFilePdf, FaFileExcel } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { API_SERVICE } from "../../common/CommonMethod";
import { REPORT_API, REPORT_GET_ALLDATA_API, REPORT_GET_OTHERSSUMMARY_API } from "../../common/CommonApiURL";
import { PDFExport } from "@progress/kendo-react-pdf";
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
import OthersSummaryModal from "../modal/OthersSummaryModal ";

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

const OthersReport = () => {
  const [reportData, setReportData] = useState([]);
  const [name, setName] = useState("");
  const [placeName, setPlaceName] = useState("");
  const [mobile, setMobile] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const pdfExportComponent = useRef(null);
  const { t } = useTranslation();
  const [showModal, setShowModal] = useState(false);
  const [othersData, setOthersData] = useState([]);
  const [pageTotals, setPageTotals] = useState({
    others: 0,
    amount: 0,
  });

  const [fieldBeingTranslated, setFieldBeingTranslated] = useState(null);
  const fetchReportData = async (page = 1, size = 10) => {
    try {
      const user = localStorage.getItem("user");
      const response = await API_SERVICE.get(REPORT_API, {
        customer_id: JSON.parse(user).customerID,
        trans_type: "O",
        report_type: "OTHERS",
        userId: JSON.parse(user).id || 0,
        current_page: page,
        page_size: size,
        customer_name: name,
        village_name: placeName,
        mobile: mobile,
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

  const handleShowModal = async () => {
    try {
        const user = localStorage.getItem("user");
      const response = await API_SERVICE.get(REPORT_GET_OTHERSSUMMARY_API, {
        customer_id: JSON.parse(user).customerID,      
        userId: 0, //JSON.parse(user).id||0,
        function_id:JSON.parse(user).functionId || 0,
      });
     
      if (response.data.result) {
        setOthersData(response.data.data);
      } else {
        console.error("Failed to fetch others summary report");
      }
    } catch (error) {
      console.error("Error fetching others summary report:", error);
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };
  const fetchAllReportData = async () => {
    try {
      const user = localStorage.getItem("user");
      const response = await API_SERVICE.get(REPORT_GET_ALLDATA_API, {
        customer_id: JSON.parse(user).customerID,
        trans_type: "O",
        report_type: "OTHERS",
        userId: 0, //JSON.parse(user).id||0,
        customer_name: name,
        village_name: placeName,
        mobile: mobile,
        function_id:JSON.parse(user).functionId || 0,
      });
      if (response.data.result) {
        return response.data.data.transactions;
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
        others: acc.others + item.others,
        amount: acc.amount + item.amount,
      }),
      { others: 0, amount: 0 }
    );
    setPageTotals(totals);
  };

  useEffect(() => {
    fetchReportData(currentPage, pageSize).then((data) => {
      setReportData(data.transactions);
      setTotalPages(data.totalPages);
      calculatePageTotals(data.transactions);
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
    XLSX.utils.book_append_sheet(wb, ws, "Income");
    XLSX.writeFile(wb, "IncomeReport.xlsx");
  };

  const exportToPDF = async () => {
    try {
      const allData = await fetchAllReportData();
      setReportData(allData); // Set report data to include all pages' data
      // const font = new FontFace('Noto Sans Tamil', 'url(https://fonts.gstatic.com/s/notosanstamil/v21/ieVc2YdFI3GCY6SyQy1KfStzYKZgzN1z4LKDbeZce-0429tBManUktuex7vGI3r.ttf)');
      // await font.load();
      // document.fonts.add(font);
      setTimeout(() => {
        if (pdfExportComponent.current) {
          pdfExportComponent.current.save();
        }
      }, 500); // Adding a small delay to ensure state updates before PDF export
    } catch (error) {
      console.error("Error exporting to PDF:", error);
    }
  };

  const handleTranslation = (translatedText) => {
    if (fieldBeingTranslated) {
      if (fieldBeingTranslated === "name") {
        setName(translatedText);
      } else if (fieldBeingTranslated === "placeName") {
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
        titles={[t("othersReport")]}
        links={[
          { to: "/dashboard", label: t("dashboard") },
          { to: "/others", label: t("addOthers") },
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
                      onChange={(e) => handleChange(e, setName, "name")}
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
                      onChange={(e) =>
                        handleChange(e, setPlaceName, "placeName")
                      }
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
      {/* Translator Component */}
      {fieldBeingTranslated && (
        <Translator
          inputText={
            fieldBeingTranslated === "name"
              ? name
              : fieldBeingTranslated === "placeName"
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

      <PDFExport
        ref={pdfExportComponent}
        paperSize="A4"
        fileName="IncomeReport.pdf"
        scale={0.6}
        author="Mercy Tech"
        creator="MySuccess.com"
        producer="MySuccess.com"
        keywords="income report"
        subject="Income Report"
        title="Income Report"
        language="ta-IN"
        forcePageBreak=".page-break"
        margin={{ top: 20, left: 20, right: 20, bottom: 20 }}
        repeatHeaders={true}
        keepTogether="tr"
        fonts={[
          {
            name: "Noto Sans Tamil",
            url: "https://fonts.googleapis.com/css2?family=Noto+Sans+Tamil:wght@400;700&display=swap",
            format: "truetype",
          },
        ]}
      >
        <div
          style={{
            fontFamily: "'Noto Sans Tamil', sans-serif",
            fontSize: "12pt",
          }}
        >
          <Table responsive className="table table-striped">
            <thead>
              <tr>
                <th>{t("sNo")}</th>
                <th>{t("placeName")}</th>
                <th>{t("name")}</th>
                <th>{t("amount")}</th>
                <th>{t("others")}</th>
                <th>{t("othersType")}</th>
                <th>{t("othersRemarks")}</th>
                <th>{t("phoneNo")}</th>
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
                      {item.name}
                    </td>
                    <td style={{ fontFamily: "Noto Sans Tamil, sans-serif" }}>
                      {item.amount}
                    </td>
                    <td style={{ fontFamily: "Noto Sans Tamil, sans-serif" }}>
                      {item.others}
                    </td>
                    <td style={{ fontFamily: "Noto Sans Tamil, sans-serif" }}>
                      {t(item.othersType)}
                    </td>
                    <td style={{ fontFamily: "Noto Sans Tamil, sans-serif" }}>
                      {item.othersRemark}
                    </td>
                    <td style={{ fontFamily: "Noto Sans Tamil, sans-serif" }}>
                      {item.phoneNo}
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
                <td colSpan="3">{t("total")}</td>
                <td>{pageTotals.amount}</td>
                <Button variant="link" onClick={handleShowModal}>
                  <td>{pageTotals.others}</td>
                </Button>
              </tr>
            </tfoot>
          </Table>
          <OthersSummaryModal
            show={showModal}
            handleClose={handleCloseModal}
            othersData={othersData}
          />
        </div>
      </PDFExport>

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

export default OthersReport;
