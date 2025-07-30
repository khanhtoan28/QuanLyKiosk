import React from "react";

const ImportExcelButton = ({ onFileSelect  }) => {
    return (
        <div className="my-4">
            <label className="inline-block bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 cursor-pointer">
                📁 Chọn file Excel
                <input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={(e) => onFileSelect(e.target.files[0])}
                    className="hidden"
                />
            </label>
        </div>
    );
};

export default ImportExcelButton;
