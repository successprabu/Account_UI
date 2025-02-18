import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { API_SERVICE } from "./CommonMethod";
import { DROPDOWN_STATE_API } from "./CommonApiURL";

const StateDropdown = ({ onChange }) => {
  const [states, setStates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStates();
  }, []);

  const fetchStates = async () => {
    try {
      setLoading(true);
      const response = await API_SERVICE.get(DROPDOWN_STATE_API);

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
