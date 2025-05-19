import { Parser } from "json2csv";

/**
 * Exports data as CSV and sends it as a response
 * @param {Object} res - Express response object
 * @param {Array} data - Array of objects to convert into CSV
 * @param {String} filename - Name of the CSV file (default: 'data.csv')
 */
const exportCSV = (res, data, filename = "data.csv") => {
  try {
    const parser = new Parser();
    const csv = parser.parse(data);

    res.header("Content-Type", "text/csv");
    res.attachment(filename);
    res.send(csv);
  } catch (error) {
    console.error("CSV Export Error:", error);
    res.status(500).json({ message: "Failed to export CSV" });
  }
};

export default exportCSV;
