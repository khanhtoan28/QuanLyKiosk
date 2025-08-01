import { useRef } from "react";

const ImportExcelButton = ({ onFileSelect, disabled, className = "" }) => {
  const inputRef = useRef();

  const handleChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
      "application/vnd.ms-excel", // .xls
    ];

    if (!allowedTypes.includes(file.type)) {
      alert("Chỉ chấp nhận file Excel .xlsx hoặc .xls");
      // reset input để lần sau vẫn chọn lại file cũ
      inputRef.current.value = null;
      return;
    }

    onFileSelect(file);

    // reset input để có thể chọn lại cùng file đó nếu cần
    inputRef.current.value = null;
  };

  return (
    <label className={`cursor-pointer ${className}`}>
      📥 Import Excel
      <input
        ref={inputRef}
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
