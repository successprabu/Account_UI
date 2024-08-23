import React, { useState, useEffect } from "react";
import { Table } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { API_SERVICE } from "../common/CommonMethod";
import Header from "../common/Header";
import "./css/OverallReport.css";
import { REPORT_GET_OTHERSSUMMARY_API, REPORT_GET_OVERALLSUMMARY_API } from "../common/CommonApiURL";
import HandoverEditModal from "./modal/HandoverEditModal";

const Handover = () => {
  const [reportData, setReportData] = useState([]);
  const [othersData, setOthersData] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingHandover, setEditingHandover] = useState(null);
  const { t } = useTranslation();

  useEffect(() => {
    fetchReportData();
    fetchOthersData();
  }, []);

  const fetchReportData = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const response = await API_SERVICE.get(REPORT_GET_OVERALLSUMMARY_API, {
        customer_id: user.customerID,
        function_id: user.functionId || 0,
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
      const user = JSON.parse(localStorage.getItem("user"));
      const response = await API_SERVICE.get(REPORT_GET_OTHERSSUMMARY_API, {
        customer_id: user.customerID,
        function_id: user.functionId || 0,
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

  const handleEdit = (handover) => {
    setEditingHandover(handover);
    setShowEditModal(true);
  };

  const calculateTotals = (data) => {
    return data.reduce(
      (acc, item) => {
        acc.receipt += item.type === "R" ? item.total : 0;
        acc.expense += item.type === "E" ? item.total : 0;
        acc.others += item.type === "O" ? item.total : 0;
        return acc;
      },
      { receipt: 0, expense: 0, others: 0, total: 0 }
    );
  };

  const calculateOthersTotals = (data) => {
    return data.reduce((acc, item) => acc + item.totalOthers, 0);
  };

  const calculateOverallTotals = (data) => {
    const userTotals = data.reduce((acc, item) => {
      if (!acc[item.createdBy]) {
        acc[item.createdBy] = { receipt: 0, expense: 0, others: 0, createdById: item.createdById };
      }
      acc[item.createdBy].receipt += item.type === "R" ? item.total : 0;
      acc[item.createdBy].expense += item.type === "E" ? item.total : 0;
      acc[item.createdBy].others += item.type === "O" ? item.total : 0;
      acc[item.createdBy].createdById=item.createdById;
      return acc;
    }, {});
  
    return Object.entries(userTotals).map(([user, totals], index) => ({
      sNo: index + 1,
      userId: totals.createdById, // Add this line to include userId
      username: user,
      ...totals,
      total: totals.receipt + totals.others - totals.expense,
    }));
  };

  return (
    <div>
      <Header
        titles={[t("handOver")]}
        links={[{ to: "/dashboard", label: t("dashboard") }]}
      />

      <Table responsive className="table table-striped">
        <thead>
          <tr>
            <th>{t("sNo")}</th>
            <th>{t("receivedBy")}</th>
            <th>{t("receipt")}</th>
            <th>{t("expenses")}</th>
            <th>{t("others")}</th>
            <th>{t("total")}</th>
            <th>{t("actions")}</th>
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
              <td>
                <i
                  className="fa-solid fa-pen-to-square text-primary me-2"
                  role="presentation"
                  title={t("edit")}
                  onClick={() => handleEdit(item)}
                ></i>
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan="2">{t("total")}</td>
            <td>{calculateTotals(reportData).receipt}</td>
            <td>{calculateTotals(reportData).expense}</td>
            <td>{calculateTotals(reportData).others}</td>
            <td>{calculateTotals(reportData).receipt + calculateTotals(reportData).others - calculateTotals(reportData).expense}</td>
          </tr>
        </tfoot>
      </Table>

      <div className="separator-line"></div>

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
            <td>{calculateOthersTotals(othersData)}</td>
          </tr>
        </tfoot>
      </Table>

      {/* Render the HandoverEditModal */}
      <HandoverEditModal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        handoverData={editingHandover}
        onSave={(updatedHandover) => {
          setReportData(
            reportData.map((t) => (t.id === updatedHandover.id ? updatedHandover : t))
          );
          setShowEditModal(false);
        }}
      />
    </div>
  );
};

export default Handover;
