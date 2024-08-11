import React, { useState, useEffect } from "react";
import { Button, Card, CardBody } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { format } from "date-fns";
import { API_SERVICE } from "../../common/CommonMethod";
import { LIST_FUNCTION_API } from "../../common/CommonApiURL";
import { ClientTable } from "../css/styles";

const FunctionList = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [functions, setFunctions] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  const [formData, setFormData] = useState({
    id: 0,
    customerId: 0,
    functionName: "",
    functionDate: "",
    mahalName: "",
    funPersionNames: "",
    remarks: "",
    funMessage: "",
    createdBy: "SYSTEM",
    createdDt: new Date().toISOString(),
    updatedBy: "SYSTEM",
    updatedDt: new Date().toISOString(),
    isActive: true,
  });

  const formatDate = (dateString) => {
    return format(new Date(dateString), "dd/MM/yyyy");
  };

  const handleEdit = (func) => {
    setFormData({
      id: func.id,
      customerId: func.customerId,
      functionName: func.functionName,
      functionDate: func.functionDate
        ? formatDate(func.functionDate)
        : "",
      mahalName: func.mahalName,
      funPersionNames: func.funPersionNames,
      remarks: func.remarks,
      funMessage: func.funMessage,
      createdBy: func.createdBy,
      createdDt: func.createdDt,
      updatedBy: func.updatedBy,
      updatedDt: func.updatedDt,
      isActive: func.isActive,
    });
  };

  const fetchFunctions = async () => {
    try {
      const response = await API_SERVICE.get(LIST_FUNCTION_API, {
        id: null,
        customer_id: formData.customerId,
        function_name: "",
        current_page: 1,
        page_size: 10,
      });
      if (response.data.result) {
        setFunctions(response.data.data.functions);
      } else {
        toast.error(
          response.data.message || "Something went wrong while fetching functions"
        );
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "API call error");
      console.error("API call error:", error);
    }
  };

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      const userDetail = JSON.parse(user);
      setFormData((prevFormData) => ({
        ...prevFormData,
        customerId: userDetail.customerID,
      }));
      console.log(userDetail.customerID, "testcustomer");
    } else {
      setIsAuthenticated(false);
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchFunctions();
    }
  }, [isAuthenticated, formData.customerId]);

  if (!isAuthenticated) {
    return (
      <div className="text-danger">
        {t("authentication_required")}{" "}
        <span className="text-primary">
          <Link to="/login">{t("login_here")}</Link>
        </span>
      </div>
    );
  }

  return (
    <Card>
      <h5 style={{ color: "#0e2238", fontWeight: "bold" }}>
        {t("function_list")}
      </h5>
      <CardBody>
        <ClientTable striped bordered hover>
          <thead>
            <tr>
              <th>{t("functionName")}</th>
              <th>{t("functionDate")}</th>
              <th>{t("mahalName")}</th>
              <th>{t("functionPersonNames")}</th>
              <th>{t("remarks")}</th>
              <th>{t("functionMessage")}</th>
              <th>{t("actions")}</th>
            </tr>
          </thead>
          <tbody>
            {functions.map((func) => (
              <tr key={func.id}>
                <td>{func.functionName}</td>
                <td>{formatDate(func.functionDate)}</td>
                <td>{func.mahalName}</td>
                <td>{func.funPersionNames}</td>
                <td>{func.remarks}</td>
                <td>{func.funMessage}</td>
                <td>
                    <i
                      className="fa-solid fa-pen-to-square text-primary me-2"
                      role="presentation"
                      title={t("edit")}
                      onClick={() => handleEdit(func)}
                    ></i>
                  </td>
              </tr>
            ))}
          </tbody>
        </ClientTable>
      </CardBody>
    </Card>
  );
};

export default FunctionList;
