import xlsx from "xlsx";

const parseExcelFile = (filePath) => {
  const workbook = xlsx.readFile(filePath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const raw = xlsx.utils.sheet_to_json(sheet, { defval: "" });

  if (!raw.length) {
    throw new Error("File Excel không có dữ liệu.");
  }

  const requiredFields = ["STT", "Tên bệnh viện", "Deadline", "Mức độ ưu tiên"];

  // Tìm dòng đầu tiên có ít nhất 3 field → dùng làm mẫu header
  const firstValidRow = jsonData.find(r => Object.keys(r).length >= 3);
  if (!firstValidRow) {
    return res.status(400).json({
      message: "Không tìm thấy dòng hợp lệ trong file Excel.",
      invalidFormat: true,
    });
  }

  const headers = Object.keys(firstValidRow);
  const missingFields = requiredFields.filter(f => !headers.includes(f));
  if (missingFields.length > 0) {
    return res.status(400).json({
      message: `Thiếu cột bắt buộc: ${missingFields.join(", ")}`,
      invalidFormat: true,
    });
  }

  const mapped = raw.map((row, index) => ({
    stt: row["STT"],
    hospitalName: row["Tên bệnh viện"],
    lastNote: row["Ghi chú làm việc gần nhất"],
    additionalRequest: row["Yêu cầu thêm của bệnh viện"],
    requestDate: row["Ngày phát sinh yêu cầu"],
    deadline: row["Deadline"],
    deliveryDate: row["Ngày chuyển nghiệm thu"],
    quantity: row["Số lượng"],
    cccdReaderType: row["Loại đầu đọc CCCD"],
    deviceType: row["Loại thiết bị"],
    priorityLevel: row["Mức độ ưu tiên"],
    personInCharge: row["Người phụ trách"],
    devStatus: row["Trạng thái làm việc với viện - dev"],
    requestStatus: row["Trạng thái xử lý yêu cầu"],
    handler: row["Người xử lý"],
    his: row["His"],
    urlPort: row["Url port"],
    bhxhAccount: row["Tài khoản check BHXH"],
    excelOrder: index,
  }));

  // ❗ Dòng nào thiếu thông tin quan trọng thì reject toàn bộ
  const invalid = mapped.filter(
    r => !r.hospitalName || !r.deadline || !r.priorityLevel
  );
  if (invalid.length > 0) {
    throw new Error("Có dòng thiếu Tên bệnh viện / Deadline / Ưu tiên. Kiểm tra lại file.");
  }

  return mapped;
};

export default parseExcelFile;
