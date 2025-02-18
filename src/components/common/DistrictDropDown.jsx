import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { API_SERVICE } from "./CommonMethod";
import { DROPDOWN_DISTRICT_API } from "./CommonApiURL";

const DistrictDropDown = ({ onChange }) => {
  const [districts, setDistrict] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDistrict();
  }, []);

  const fetchDistrict = async () => {
    try {
      setLoading(true);
      const response = await API_SERVICE.get(DROPDOWN_DISTRICT_API);

      if (response.data.result) {
        setDistrict(response.data.data);
      } else {
        toast.error(response.data.message || "Failed to load Districts");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "API call error");
      console.error("API Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <select
      className="form-control"
      onChange={(e) => onChange && onChange(e.target.value)}
    >
      <option value="">Select District</option>
      {loading ? (
        <option disabled>Loading...</option>
      ) : (
        districts.map((district) => (
          <option key={district.id} value={district.id}>
            {district.districtName}
          </option>
        ))
      )}
    </select>
  );
};

export default DistrictDropDown;
