import xlsx from "xlsx";

const parseExcelFile = (filePath) => {
  const workbook = xlsx.readFile(filePath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const raw = xlsx.utils.sheet_to_json(sheet, { defval: "" });

  return raw.map((row) => ({
    stt: row["STT \n"],
    hospitalName: row["BỆNH VIỆN"],
    noteHistory: row["Note lịch sử làm việc"],
    hospitalRequest: row["Yêu cầu thêm của Bệnh viện"],
    requestDate: row["NGÀY PHÁT SINH YÊU CẦU"],
    deadline: row["DEADLINE"],
    transferDate: row["Ngày chuyển nghiệm thu"],
    quantity: row["SỐ LƯỢNG"],
    cardReaderType: row["Đầu đọc CCCD"],
    deviceType: row["CHỦNG LOẠI"],
    priority: row["Mức độ ưu tiên"],
    responsiblePerson: row["PHỤ TRÁCH TRIỂN KHAI"],
    devStatus: row["TRẠNG THÁI LÀM VIỆC VỚI VIỆN - Dev"],
    handlingStatus: row["TRẠNG THÁI XỬ LÝ YÊU CẦU"],
    handler: row["NGƯỜI XỬ LÝ"],
    his: row["HIS"],
    url: row["URL"],
    bhxhAccount: row["TK CHECK BHXH"],
  }));
};

export default parseExcelFile;
