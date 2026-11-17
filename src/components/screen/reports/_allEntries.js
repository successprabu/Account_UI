import { API_SERVICE } from "../../common/CommonMethod";
import { REPORT_GET_ALLDATA_API } from "../../common/CommonApiURL";
import { readUser } from "../../moitech/ReportPage";

/**
 * Every entry of one type for the current function, filtered by name / place / mobile.
 * Same call and parameters the reports' Excel export always used.
 */
export const loadEntries = (transType, reportType) => async (filters) => {
  const user = readUser();
  const response = await API_SERVICE.get(REPORT_GET_ALLDATA_API, {
    customer_id: user?.customerID,
    trans_type: transType,
    report_type: reportType,
    userId: 0,
    customer_name: filters.name || "",
    village_name: filters.placeName || "",
    mobile: filters.mobile || "",
    function_id: user?.functionId || 0,
  });
  return response?.data?.result ? response.data.data?.transactions || [] : [];
};
