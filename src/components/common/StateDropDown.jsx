import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { API_SERVICE } from "./CommonMethod";
import { DROPDOWN_STATE_API } from "./CommonApiURL";

const StateDropdown = ({ countryId, onChange, value }) => {
  const [states, setStates] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (countryId) {
      fetchStates(countryId);
    } else {
      setStates([]); // Clear states if no country is selected
    }
  }, [countryId]);

  const fetchStates = async (countryId) => {
    try {
      setLoading(true);
      const response = await API_SERVICE.get(DROPDOWN_STATE_API, {
        countryId: countryId || 1,
      });

      if (response.data.result) {
        setStates(response.data.data);
      } else {
        toast.error(response.data.message || "Failed to load states");
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
      value={value} // Bind the selected value
      name="state" // Add a name for react-hook-form
      disabled={!countryId || loading}
    >
      <option value="">Select State</option>
      {loading ? (
        <option disabled>Loading...</option>
      ) : (
        states.map((state) => (
          <option key={state.id} value={state.id}>
            {state.stateName}
          </option>
        ))
      )}
    </select>
  );
};

export default StateDropdown;
