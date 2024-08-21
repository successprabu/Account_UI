import React, { useState, useEffect, useRef } from "react";
import { Row, Col, Table } from "react-bootstrap";
import { FaFilePdf, FaFileExcel } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { API_SERVICE } from "../../common/CommonMethod";
import { REPORT_GET_OTHERSSUMMARY_API, REPORT_GET_OVERALLSUMMARY_API } from "../../common/CommonApiURL";
import { PDFExport } from "@progress/kendo-react-pdf";
import * as XLSX from "xlsx";
import Header from "../../common/Header";
import { PdfButton, ExcelButton } from "../css/styles";
import "../css/OverallReport.css";



const OverallSummaryReport = () => {
  const [reportData, setReportData] = useState([]);
  const [othersData, setOthersData] = useState([]);
  const pdfExportComponent = useRef(null);
  const { t } = useTranslation();

  useEffect(() => {
    fetchReportData();
    fetchOthersData();
  }, []);

  const fetchReportData = async () => {
    try {
      const user = localStorage.getItem("user");
      const response = await API_SERVICE.get(REPORT_GET_OVERALLSUMMARY_API, {
        customer_id: JSON.parse(user).customerID,
        function_id: JSON.parse(user).functionId || 0,
      });
      if (response.data.result) {
        setReportData(response.data.data);
      } else {
        console.error("No Records Found");
      }
    } catch (error) {
      console.error("Error fetching report data:", error);
    }
  };

  const fetchOthersData = async () => {
    try {
      const user = localStorage.getItem("user");
      const response = await API_SERVICE.get(REPORT_GET_OTHERSSUMMARY_API, {
        customer_id: JSON.parse(user).customerID,
        function_id: JSON.parse(user).functionId || 0,
      });
      if (response.data.result) {
        setOthersData(response.data.data);
      } else {
        console.error("No Records Found");
      }
    } catch (error) {
      console.error("Error fetching others data:", error);
    }
  };

  const calculateTotals = (data) => {
    const totals = data.reduce(
      (acc, item) => {
        acc.receipt += item.type === "R" ? item.total : 0;
        acc.expense += item.type === "E" ? item.total : 0;
        acc.others += item.type === "O" ? item.total : 0;
        return acc;
      },
      { receipt: 0, expense: 0, others: 0 }
    );
    totals.total = totals.receipt + totals.others - totals.expense;
    return totals;
  };

  const calculateOthersTotals = (data) => {
    const totals = data.reduce(
      (acc, item) => {
        acc.totalOthers += item.totalOthers;
        return acc;
      },
      { totalOthers: 0 }
    );
    return totals;
  };

  const calculateOverallTotals = (data) => {
    const userTotals = {};
    data.forEach((item) => {
      if (!userTotals[item.createdBy]) {
        userTotals[item.createdBy] = { receipt: 0, expense: 0, others: 0 };
      }
      if (item.type === "R") {
        userTotals[item.createdBy].receipt += item.total;
      } else if (item.type === "E") {
        userTotals[item.createdBy].expense += item.total;
      } else if (item.type === "O") {
        userTotals[item.createdBy].others += item.total;
      }
    });

    return Object.keys(userTotals).map((user, index) => {
      const total =
        userTotals[user].receipt + userTotals[user].others - userTotals[user].expense;
      return {
        sNo: index + 1,
        username: user,
        receipt: userTotals[user].receipt,
        expense: userTotals[user].expense,
        others: userTotals[user].others,
        total: total,
      };
    });
  };

//   const exportToExcel = async () => {
//     const ws = XLSX.utils.json_to_sheet(calculateOverallTotals(reportData));
//     const wb = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(wb, ws, "summaryReport");
//     XLSX.writeFile(wb, "summaryReport.xlsx");
//   };

const exportToExcel = async () => {
    const overallTotals = calculateOverallTotals(reportData);
    const othersTotals = othersData.map((item, index) => ({
      sNo: index + 1,
      othersType: item.othersType || t("others"),
      itemTotal: item.totalOthers,
    }));
  
    const ws1 = XLSX.utils.json_to_sheet(overallTotals);
    const ws2 = XLSX.utils.json_to_sheet(othersTotals);
  
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws1, "Overall Summary");
    XLSX.utils.book_append_sheet(wb, ws2, "Others Summary");
  
    XLSX.writeFile(wb, "SummaryReport.xlsx");
  };
  
  const exportToPDF = () => {
    if (pdfExportComponent.current) {
      pdfExportComponent.current.save();
    }
  };

  return (
    <div>
      <Header
        titles={[t("summaryReport")]}
        links={[
          { to: "/dashboard", label: t("dashboard") },
        ]}
      />

      <Row>
        <Col className="text-right button-group">
          <PdfButton onClick={exportToPDF}>
            <FaFilePdf /> {t("downloadPdf")}
          </PdfButton>
          <ExcelButton onClick={exportToExcel}>
            <FaFileExcel /> {t("exportExcel")}
          </ExcelButton>
        </Col>
      </Row>

      <PDFExport
        ref={pdfExportComponent}
        paperSize="A4"
        fileName="SummaryReport.pdf"
      >
        <h4 className="report-header">{t("overallSummary")}</h4>
        <Table responsive className="table table-striped">
          <thead>
            <tr>
              <th>{t("sNo")}</th>
              <th>{t("receivedBy")}</th>
              <th>{t("receipt")}</th>
              <th>{t("expenses")}</th>
              <th>{t("others")}</th>
              <th>{t("total")}</th>
            </tr>
          </thead>
          <tbody>
            {calculateOverallTotals(reportData).map((item, index) => (
              <tr key={index}>
                <td>{item.sNo}</td>
                <td>{t(item.username)}</td>
                <td>{item.receipt}</td>
                <td>{item.expense}</td>
                <td>{item.others}</td>
                <td>{item.total}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan="2">{t("total")}</td>
              <td>{calculateTotals(reportData).receipt}</td>
              <td>{calculateTotals(reportData).expense}</td>
              <td>{calculateTotals(reportData).others}</td>
              <td>{calculateTotals(reportData).total}</td>
            </tr>
          </tfoot>
        </Table>

        <div className="separator-line"></div> {/* Separator Line */}

        <h4 className="report-header">{t("othersSummary")}</h4>
        <Table responsive className="table table-striped">
          <thead>
            <tr>
              <th>{t("othersType")}</th>
              <th>{t("itemTotal")}</th>
            </tr>
          </thead>
          <tbody>
            {othersData.map((item, index) => (
              <tr key={index}>
                <td>{t(item.othersType) || t("others")}</td>
                <td>{item.totalOthers}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan="1">{t("itemTotal")}</td>
              <td>{calculateOthersTotals(othersData).totalOthers}</td>
            </tr>
          </tfoot>
        </Table>
      </PDFExport>
    </div>
  );
};

export default OverallSummaryReport;
