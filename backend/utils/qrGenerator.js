const QRCode = require('qrcode');

// Generate QR code as Data URL (base64 image)
const generateQRCode = async (data) => {
  try {
    // Convert data to string if it's not already
    const qrData = typeof data === 'string' ? data : JSON.stringify(data);
    
    // Generate QR code as Data URL
    const qrCodeDataURL = await QRCode.toDataURL(qrData, {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      width: 300,
      margin: 2,
    });
    
    return qrCodeDataURL;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw new Error('Failed to generate QR code');
  }
};

// Generate QR code as buffer (for saving to file)
const generateQRCodeBuffer = async (data) => {
  try {
    const qrData = typeof data === 'string' ? data : JSON.stringify(data);
    const buffer = await QRCode.toBuffer(qrData, {
      errorCorrectionLevel: 'M',
      type: 'png',
      width: 300,
      margin: 2,
    });
    return buffer;
  } catch (error) {
    console.error('Error generating QR code buffer:', error);
    throw new Error('Failed to generate QR code buffer');
  }
};

module.exports = {
  generateQRCode,
  generateQRCodeBuffer,
};
