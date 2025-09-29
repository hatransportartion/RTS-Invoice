const createObjectCsvWriter = require("csv-writer").createObjectCsvWriter;
const pLimit = require("p-limit").default;
const fetch = require("node-fetch");
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
const envFile = process.env.NODE_ENV === "production" ? ".env.prod" : ".env.local";
dotenv.config({ path: envFile });



const limit = pLimit(5);

const uploadSingleLoad = async (load, sftp, csvWriter) => {
    const { recordId, invoiceNumber, invoiceDate, amount, pdfUrl, customer } = load;
    try {

        const pdfResponse = await fetch(pdfUrl, {
            method: "GET",
            headers: {
                "Content-Type": "application/pdf",
            }, 
        });
        if (!pdfResponse.ok) throw new Error("Failed to download PDF");
        const pdfBuffer = await pdfResponse.buffer();

        // locally save the pdf for debugging
        // fs.writeFileSync(`./uploads/${invoiceNumber}.pdf`, pdfBuffer);
        // const localPath = path.resolve(`./uploads/${invoiceNumber}.pdf`);
// 
        // console.log("LocalPath:", localPath);

        // await sftp.put(pdfBuffer, `/${invoiceNumber}.pdf`);
        console.log(`✅ Uploaded ${invoiceNumber}`);

        const USERNAME = process.env.RTS_USERNAME || "";
        // append CSV
        await csvWriter.writeRecords([{
            Client: USERNAME,
            "Invoice#": invoiceNumber,
            DebtorNo: customer,
            "Debtor Name": customer,
            "Load #": invoiceNumber,
            InvDate: invoiceDate,
            InvAmt: amount
        }]);

        

        return recordId; // success
    } catch (err) {
        console.error(`❌ Error with ${invoiceNumber}:`, err.message);
        return null; // failed
    }
};

module.exports = uploadSingleLoad;