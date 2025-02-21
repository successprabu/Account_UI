import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { API_SERVICE } from "./CommonMethod";
import { DROPDOWN_COUNTRY_API } from "./CommonApiURL";

const CountryDropdown = ({ onChange, value }) => {
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCountries();
  }, []);

  const fetchCountries = async () => {
    try {
      setLoading(true);
      const response = await API_SERVICE.get(DROPDOWN_COUNTRY_API);

      if (response.data.result) {
        setCountries(response.data.data); // Ensure the API response has the correct structure
      } else {
        toast.error(response.data.message || "Failed to load countries");
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
      onChange={(e) => onChange && onChange(e.target.value)} // Pass the selected value to the parent
      value={value} // Bind the selected value
      name="country" // Add a name for react-hook-form
    >
      <option value="">Select Country</option>
      {loading ? (
        <option disabled>Loading...</option>
      ) : (
        countries.map((country) => (
          <option key={country.id} value={country.id}>
            {country.countryName}
          </option>
        ))
      )}
    </select>
  );
};

export default CountryDropdown;
