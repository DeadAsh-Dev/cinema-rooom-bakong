/**
 * KHQR (Cambodia Bakong Standard) Encoder, Decoder and CRC16 Utility
 * Compliant with National Bank of Cambodia (NBC) EMVCo Specification
 */

const QRCode = require('qrcode');

/**
 * Calculates CRC16-CCITT (0xFFFF, 0x1021)
 * Used by EMVCo / Bakong KHQR for Tag 63 checksum
 */
function calculateCRC16(data) {
  let crc = 0xFFFF;
  for (let i = 0; i < data.length; i++) {
    crc ^= (data.charCodeAt(i) << 8);
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ 0x1021) & 0xFFFF;
      } else {
        crc = (crc << 1) & 0xFFFF;
      }
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

/**
 * Formats a single EMVCo Tag-Length-Value (TLV) field
 */
function formatTLV(tag, value) {
  const str = String(value ?? '');
  const len = str.length.toString().padStart(2, '0');
  return `${tag}${len}${str}`;
}

/**
 * Parses an EMVCo / KHQR string into tag-value map
 */
function parseKHQR(qrString) {
  const tags = {};
  let i = 0;
  while (i < qrString.length) {
    if (i + 4 > qrString.length) break;
    const tag = qrString.substring(i, i + 2);
    const len = parseInt(qrString.substring(i + 2, i + 4), 10);
    const val = qrString.substring(i + 4, i + 4 + len);
    tags[tag] = val;
    i += 4 + len;
  }
  return tags;
}

// User's verified ABA PayWay / Bakong credentials
const DEFAULT_MERCHANT = {
  bakongAccount: 'abaakhppxxx@abaa',
  accountNumber: '124062615395144',
  bankName: 'ABA Bank',
  mcc: '8220',
  merchantName: 'UNG CHEADEVITH',
  merchantCity: 'PHNOM PENH',
  paywaySubtag: '0010PAYWAY@ABA010710004560209031392779',
  countryCode: 'KH'
};

/**
 * Generates a standard Bakong KHQR payload string
 * @param {Object} options
 * @param {number} [options.amount] - Transaction amount
 * @param {'USD'|'KHR'} [options.currency='USD'] - Currency ('USD' or 'KHR')
 * @param {string} [options.billNumber] - Optional invoice / booking reference
 * @param {string} [options.mobileNumber] - Customer or merchant mobile
 * @param {boolean} [options.isDynamic=true] - If dynamic (amount specified) or static
 */
function generateKHQR({
  amount,
  currency = 'USD',
  billNumber,
  mobileNumber,
  merchantName = DEFAULT_MERCHANT.merchantName,
  isDynamic = true
} = {}) {
  const currencyCode = currency === 'KHR' ? '116' : '840';
  const pointOfInitiation = (isDynamic && amount !== undefined && amount !== null) ? '12' : '11';

  // Tag 30: Merchant Account Information
  const tag30_00 = formatTLV('00', DEFAULT_MERCHANT.bakongAccount);
  const tag30_01 = formatTLV('01', DEFAULT_MERCHANT.accountNumber);
  const tag30_02 = formatTLV('02', DEFAULT_MERCHANT.bankName);
  const tag30Value = `${tag30_00}${tag30_01}${tag30_02}`;
  const tag30 = formatTLV('30', tag30Value);

  // Tag 62: Additional Data Field Template
  // Subtag 68 contains ABA PayWay routing payload
  let tag62Content = formatTLV('68', DEFAULT_MERCHANT.paywaySubtag);
  if (billNumber) {
    tag62Content += formatTLV('01', billNumber);
  }
  if (mobileNumber) {
    tag62Content += formatTLV('02', mobileNumber);
  }
  const tag62 = formatTLV('62', tag62Content);

  // Build payload sequentially according to EMVCo / NBC standards
  let payload = '';
  payload += formatTLV('00', '01'); // Payload Format Indicator
  payload += formatTLV('01', pointOfInitiation); // 11=Static, 12=Dynamic
  payload += tag30; // Tag 30: Bakong Merchant Account
  payload += formatTLV('52', DEFAULT_MERCHANT.mcc); // Tag 52: Merchant Category Code
  payload += formatTLV('53', currencyCode); // Tag 53: Currency (840=USD, 116=KHR)

  // Tag 54: Amount (dynamic only)
  if (pointOfInitiation === '12' && amount !== undefined && amount !== null) {
    const formattedAmount = currency === 'KHR'
      ? Math.round(Number(amount)).toString()
      : Number(amount).toFixed(2);
    payload += formatTLV('54', formattedAmount);
  }

  payload += formatTLV('58', DEFAULT_MERCHANT.countryCode); // Tag 58: Country Code (KH)
  payload += formatTLV('59', merchantName); // Tag 59: Merchant Name
  payload += formatTLV('60', DEFAULT_MERCHANT.merchantCity); // Tag 60: Merchant City
  payload += tag62; // Tag 62: Additional Data Template

  // Tag 63: CRC16 checksum
  payload += '6304';
  const checksum = calculateCRC16(payload);
  const fullKHQR = payload + checksum;

  return {
    qrString: fullKHQR,
    checksum,
    currency,
    amount: amount ? Number(amount) : null,
    merchantName,
    pointOfInitiation,
    bankName: DEFAULT_MERCHANT.bankName,
    bakongAccount: DEFAULT_MERCHANT.bakongAccount,
    billNumber
  };
}

/**
 * Generates Base64 Data URL for a KHQR string
 */
async function generateQRCodeDataUrl(text, options = {}) {
  return await QRCode.toDataURL(text, {
    errorCorrectionLevel: 'M',
    margin: 2,
    width: options.width || 360,
    color: {
      dark: '#111827',
      light: '#ffffff'
    }
  });
}

/**
 * Verifies if a KHQR string has valid CRC16
 */
function verifyKHQR(qrString) {
  if (!qrString || qrString.length < 8) return false;
  const dataWithoutCRC = qrString.substring(0, qrString.length - 4);
  const expectedCRC = qrString.substring(qrString.length - 4).toUpperCase();
  const calculatedCRC = calculateCRC16(dataWithoutCRC);
  return calculatedCRC === expectedCRC;
}

module.exports = {
  calculateCRC16,
  formatTLV,
  parseKHQR,
  generateKHQR,
  generateQRCodeDataUrl,
  verifyKHQR,
  DEFAULT_MERCHANT
};
