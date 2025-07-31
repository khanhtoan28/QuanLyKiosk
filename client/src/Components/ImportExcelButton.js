const ImportExcelButton = ({ onFileSelect, disabled, className = "" }) => {
  const handleChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
      "application/vnd.ms-excel", // .xls
    ];

    if (!allowedTypes.includes(file.type)) {
      alert("Chỉ chấp nhận file Excel .xlsx hoặc .xls");
      return;
    }

    onFileSelect(file);
  };

  return (
    <label className={`cursor-pointer ${className}`}>
      📥 Import Excel
      <input
        type="file"
        accept=".xlsx,.xls"
        onChange={handleChange}
        disabled={disabled}
        hidden
      />
    </label>
  );
};

export default ImportExcelButton;