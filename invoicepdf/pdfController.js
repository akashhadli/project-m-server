const express = require("express");
const app = express();
const ejs = require("ejs");
const pdf = require("html-pdf");
const path = require("path");
const qr = require("qrcode");
const fs = require("fs");
const moment = require('moment');
const commaNumber = require('comma-number');
const { ToWords } = require('to-words');

app.use(express.static('public'));

var API = process.env.DOWNLOAD_BASE_URL || `https://squid-app-og92j.ondigitalocean.app/`;

const toWords = new ToWords({
  localeCode: 'en-IN',
  converterOptions: {
    currency: true,
    ignoreDecimal: false,
    ignoreZeroCurrency: false,
    doNotAddOnly: false,
    currencyOptions: {
      name: 'Rupee',
      plural: 'Rupees',
      symbol: '₹',
      fractionalUnit: {
        name: 'Paisa',
        plural: 'Paise',
        symbol: '',
      },
    }
  }
});

exports.generatePdf = async (result, callback) => {
  const resultid = result._id;
  const fileId = result._id + '.pdf';
  const targetLocation = `./public/download/${fileId}`;
  const logoLocation = `./public/logo/logo.jpg`;
  const logoPath = path.join(publicFolder, logoLocation);

  try {
      // If PDF already exists, delete it and create a new PDF
      if (fs.existsSync(targetLocation)) {
        fs.unlinkSync(targetLocation);
      }
  
      // Generate QR code and get base64 string
      const qrCodeData = `${API}download/${resultid}`;
      const qrCodeBase64 = await generateQRCodeBase64(qrCodeData);

    // Render PDF HTML
    ejs.renderFile('./views/pdf/report-template-original.ejs', {
      invoiceData: result,
      imagePath: qrCodeBase64,
      logoPath: `data:image/jpeg;base64,${fs.readFileSync(logoPath, { encoding: 'base64' })}`,
      moment: moment,
      commaNumber: commaNumber,
      toWords: toWords
    }, function (err, result) {
      if (result) {
        const html1 = result;
        let options1 = {
          // "height": "12.25in",
          // "width": "11.25in",
          // "header": { "height": "0mm" },
          // "footer": { "height": "0mm" },
          format: 'A4',
          childProcessOptions: {
            env: {
              OPENSSL_CONF: '/dev/null',
            },
          }
        };

        pdf.create(html1, options1)
          .toFile(targetLocation , function (error) {
            if (error) {
              console.error('Error creating PDF:', error);
              if (callback) callback(null, error);
            } else {
              console.log('PDF created successfully.');
              if (callback) callback(targetLocation);
            }
          });
      } else {
        console.error('An error occurred during render ejs:', err);
        if (callback) callback(null, err);
      }
    });
        // Render PDF HTML
        ejs.renderFile('./views/pdf/report-template-duplicate.ejs', {
          invoiceData: result,
          imagePath: qrCodeBase64,
          logoPath: `data:image/jpeg;base64,${fs.readFileSync(logoPath, { encoding: 'base64' })}`,
          moment: moment,
          commaNumber: commaNumber,
          toWords: toWords
        }, function (err, result) {
          if (result) {
            const html2 = result;
            let options2 = {
              // "height": "12.25in",
              // "width": "11.25in",
              // "header": { "height": "0mm" },
              // "footer": { "height": "0mm" },
              format: 'A4',
              childProcessOptions: {
                env: {
                  OPENSSL_CONF: '/dev/null',
                },
              }
            };
    
            pdf.create(html2, options2)
              .toFile(targetLocation, function (error) {
                if (error) {
                  console.error('Error creating PDF:', error);
                  if (callback) callback(null, error);
                } else {
                  console.log('PDF created successfully.');
                  if (callback) callback(targetLocation);
                }
              });
          } else {
            console.error('An error occurred during render ejs:', err);
            if (callback) callback(null, err);
          }
        });
  } catch (error) {
    console.error('Error:', error);
    if (callback) callback(null, error);
  }
  };

const generateQRCodeBase64 = async (data) => {
  try {
    const qrCodeData = await qr.toDataURL(data);
    console.log("QR code string generated successfully");
    return qrCodeData;
  } catch (error) {
    console.error("Error generating QR code string:", error);
    throw error;
  }
};
