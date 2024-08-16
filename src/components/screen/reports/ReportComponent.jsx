import React, { useState, useEffect } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';

pdfMake.vfs = pdfFonts.pdfMake.vfs;

const ReportComponent = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Function to fetch data from the API
  const fetchData = async () => {
    try {
      const response = await axios.get('https://localhost:44393/api/Report/GetTransactionReport', {
        params: {
          customer_id: 2,
          report_type: 'TEST',
          userId: 0,
          current_page: 1,
          page_size: 10,
          // Optional parameters
          d: 1,
          customer_name: '',
          village_name: '',
          mobile: '',
          user_type: ''
        }
      });
      setData(response.data.data.transactions);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Function to generate and download PDF
  const generatePDF = () => {
    const docDefinition = {
      content: [
        { text: 'Transaction Report', style: 'header' },
        {
          table: {
            body: [
              ['ID', 'Customer ID', 'Village Name', 'Amount', 'Type'],
              ...data.map(item => [item.id, item.customerId, item.villageName, item.amount, item.type])
            ]
          }
        }
      ],
      styles: {
        header: {
          fontSize: 18,
          bold: true
        }
      }
    };
    pdfMake.createPdf(docDefinition).download('report.pdf');
  };

  // Function to generate and download Excel
  const generateExcel = () => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Transactions');
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    saveAs(new Blob([wbout], { type: 'application/octet-stream' }), 'report.xlsx');
  };

  // Function to handle sending reports via email and WhatsApp
  const handleSendReport = (format) => {
    if (format === 'pdf') {
      generatePDF();
    } else if (format === 'excel') {
      generateExcel();
    }
  };

  // Email and WhatsApp links
  const emailLink = 'mailto:?subject=Transaction Report&body=Please find the attached report.';
  const whatsappLink = 'https://wa.me/?text=Please find the attached report.';

  return (
    <div>
      {loading ? <p>Loading...</p> : (
        <div>
          <h2>Transaction Report</h2>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Customer ID</th>
                <th>Village Name</th>
                <th>Amount</th>
                <th>Type</th>
              </tr>
            </thead>
            <tbody>
              {data.map(item => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td>{item.customerId}</td>
                  <td>{item.villageName}</td>
                  <td>{item.amount}</td>
                  <td>{item.type}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <button onClick={() => handleSendReport('pdf')}>Download PDF</button>
          <button onClick={() => handleSendReport('excel')}>Download Excel</button>
          <a href={emailLink} target="_blank" rel="noopener noreferrer">Send via Email</a>
          <a href={whatsappLink} target="_blank" rel="noopener noreferrer">Send via WhatsApp</a>
        </div>
      )}
    </div>
  );
};

export default ReportComponent;
