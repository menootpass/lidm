/**
 * @description Menangani permintaan POST dari website asesmen.
 * @param {Object} e - Parameter event yang berisi data yang dikirim.
 * @returns {ContentService.TextOutput} - Respon JSON yang menandakan sukses.
 */
function doPost(e) {
  try {
    // Log untuk debugging
    Logger.log('doPost called');
    Logger.log('e.postData: ' + JSON.stringify(e.postData));
    Logger.log('e.parameters: ' + JSON.stringify(e.parameters));
    
    // 1. Ambil data JSON yang dikirim dari formulir HTML
    let data;
    if (e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
        Logger.log('Parsed JSON data: ' + JSON.stringify(data));
      } catch (parseError) {
        Logger.log('JSON parse error, trying form data: ' + parseError.toString());
        // Coba ambil dari form data jika JSON gagal
        data = {
          nama_pengisi: e.parameters.nama_pengisi ? e.parameters.nama_pengisi[0] : '',
          q1: e.parameters.q1 ? e.parameters.q1[0] : '',
          q2: e.parameters.q2 ? e.parameters.q2[0] : '',
          q3: e.parameters.q3 ? e.parameters.q3[0] : '',
          q4: e.parameters.q4 ? e.parameters.q4[0] : '',
          q5: e.parameters.q5 ? e.parameters.q5[0] : ''
        };
        Logger.log('Parsed form data: ' + JSON.stringify(data));
      }
    } else if (e.parameters) {
      // Ambil dari form parameters
      data = {
        nama_pengisi: e.parameters.nama_pengisi ? e.parameters.nama_pengisi[0] : '',
        q1: e.parameters.q1 ? e.parameters.q1[0] : '',
        q2: e.parameters.q2 ? e.parameters.q2[0] : '',
        q3: e.parameters.q3 ? e.parameters.q3[0] : '',
        q4: e.parameters.q4 ? e.parameters.q4[0] : '',
        q5: e.parameters.q5 ? e.parameters.q5[0] : ''
      };
      Logger.log('Parsed parameters data: ' + JSON.stringify(data));
    } else {
      throw new Error('No post data or parameters received');
    }

    // 2. Tentukan Spreadsheet dan Sheet tujuan
    // Ganti ID_SPREADSHEET_ANDA dengan ID spreadsheet yang benar
    // const spreadsheet = SpreadsheetApp.openById('ID_SPREADSHEET_ANDA');
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    Logger.log('Active spreadsheet ID: ' + spreadsheet.getId());
    Logger.log('Spreadsheet name: ' + spreadsheet.getName());
    
    let sheet = spreadsheet.getSheetByName("Jawaban");
    Logger.log('Sheet "Jawaban" exists: ' + (sheet !== null));

    if (!sheet) {
      Logger.log('Creating new sheet "Jawaban"');
      sheet = spreadsheet.insertSheet("Jawaban");
      // Buat header jika sheet baru dibuat
      const headers = ["Timestamp", "nama_pengisi", "q1", "q2", "q3", "q4", "q5"];
      sheet.appendRow(headers);
      Logger.log('Created new sheet with headers');
    }
    
    Logger.log('Using sheet: ' + sheet.getName());
    Logger.log('Sheet has ' + sheet.getLastRow() + ' rows');
    
    // 3. Siapkan baris data untuk dimasukkan ke sheet
    const newRow = [
      new Date(), // Tambahkan timestamp kapan data diisi
      data.nama_pengisi || '',
      data.q1 || '',
      data.q2 || '',
      data.q3 || '',
      data.q4 || '',
      data.q5 || ''
    ];

    Logger.log('New row to insert: ' + JSON.stringify(newRow));

    // 4. Tambahkan baris baru ke dalam sheet
    try {
      sheet.appendRow(newRow);
      Logger.log('Data successfully inserted to sheet');
      Logger.log('Sheet now has ' + sheet.getLastRow() + ' rows');
      
      // Verifikasi data yang baru ditambahkan
      const lastRow = sheet.getLastRow();
      const lastRowData = sheet.getRange(lastRow, 1, 1, 7).getValues()[0];
      Logger.log('Last row data: ' + JSON.stringify(lastRowData));
      
    } catch (appendError) {
      Logger.log('Error appending row: ' + appendError.toString());
      throw appendError;
    }

    // 5. Kirim respon sukses
    return ContentService
      .createTextOutput(JSON.stringify({ 
        status: 'success', 
        message: 'Data berhasil disimpan.',
        timestamp: new Date().toISOString()
      }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    // Jika terjadi error, catat di log dan kirim respon error
    Logger.log('Error in doPost: ' + error.toString());
    Logger.log('Error stack: ' + error.stack);
    
    return ContentService
      .createTextOutput(JSON.stringify({ 
        status: 'error', 
        message: error.toString(),
        timestamp: new Date().toISOString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * @description Menangani permintaan OPTIONS untuk CORS preflight
 * @param {Object} e - Parameter event
 * @returns {ContentService.TextOutput} - Respon untuk CORS
 */
function doOptions(e) {
  return ContentService
    .createTextOutput('')
    .setMimeType(ContentService.MimeType.TEXT);
}

/**
 * @description Fungsi untuk testing - bisa dipanggil dari editor Apps Script
 */
function testDoPost() {
  const testData = {
    nama_pengisi: "Test User",
    q1: "Test answer 1",
    q2: "Test answer 2", 
    q3: "Test answer 3",
    q4: "Test answer 4",
    q5: "Test answer 5"
  };
  
  const mockEvent = {
    postData: {
      contents: JSON.stringify(testData)
    }
  };
  
  const result = doPost(mockEvent);
  Logger.log('Test result: ' + result.getContent());
}

/**
 * @description Fungsi untuk memeriksa spreadsheet dan sheet
 */
function checkSpreadsheet() {
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    Logger.log('Active spreadsheet ID: ' + spreadsheet.getId());
    Logger.log('Spreadsheet name: ' + spreadsheet.getName());
    Logger.log('Spreadsheet URL: ' + spreadsheet.getUrl());
    
    const sheets = spreadsheet.getSheets();
    Logger.log('Available sheets:');
    sheets.forEach((sheet, index) => {
      Logger.log(`  ${index + 1}. ${sheet.getName()} (${sheet.getLastRow()} rows)`);
    });
    
    let jawabanSheet = spreadsheet.getSheetByName("Jawaban");
    if (jawabanSheet) {
      Logger.log('Jawaban sheet found with ' + jawabanSheet.getLastRow() + ' rows');
      if (jawabanSheet.getLastRow() > 0) {
        const data = jawabanSheet.getDataRange().getValues();
        Logger.log('Sample data from Jawaban sheet:');
        data.slice(0, 3).forEach((row, index) => {
          Logger.log(`  Row ${index + 1}: ${JSON.stringify(row)}`);
        });
      }
    } else {
      Logger.log('Jawaban sheet not found');
    }
    
  } catch (error) {
    Logger.log('Error checking spreadsheet: ' + error.toString());
  }
}
