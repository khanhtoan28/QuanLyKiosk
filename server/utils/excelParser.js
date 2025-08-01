import xlsx from "xlsx";

const columnMap = {
  "STT": "stt",
  "Tên bệnh viện": "hospitalName",
  "Ghi chú làm việc gần nhất": "lastNote",
  "Yêu cầu thêm của bệnh viện": "additionalRequest",
  "Ngày phát sinh yêu cầu": "requestDate",
  "Deadline": "deadline",
  "Ngày chuyển nghiệm thu": "deliveryDate",
  "Số lượng": "quantity",
  "Loại đầu đọc CCCD": "cccdReaderType",
  "Loại thiết bị": "deviceType",
  "Mức độ ưu tiên": "priorityLevel",
  "Người phụ trách": "personInCharge",
  "Trạng thái làm việc với viện - dev": "devStatus",
  "Trạng thái xử lý yêu cầu": "requestStatus",
  "Người xử lý": "handler",
  "His": "his",
  "Url port": "urlPort",
  "Tài khoản check BHXH": "bhxhAccount",
};

const parseExcelFile = (buffer) => {
  const workbook = xlsx.read(buffer, { type: "buffer", cellDates: true, });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const raw = xlsx.utils.sheet_to_json(sheet, { defval: "" });

  if (!raw.length) throw new Error("❌ File Excel không có dữ liệu.");

  const mapped = raw.map((row, i) => {
    const obj = { excelOrder: i };
    for (const [vnCol, enKey] of Object.entries(columnMap)) {
      obj[enKey] = (row[vnCol] || "").toString().trim();
    }
    return obj;
  });

  const invalid = mapped.filter(r => !r.hospitalName);
  if (invalid.length) {
    console.warn("❌ Các dòng thiếu hospitalName:", invalid);
    throw new Error(`❌ Có ${invalid.length} dòng thiếu Tên bệnh viện (hospitalName).`);
  }

  return mapped;
};

export default parseExcelFile;