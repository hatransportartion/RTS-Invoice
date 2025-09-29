
const route = require('express').Router();
const upload = require('multer')({ dest: 'uploads/' });
const SftpClient = require('ssh2-sftp-client');
const sftpConfig = require('./config');
const fs = require('fs');
const path = require('path');
const asyncHandler = require("express-async-handler");
const pLimit = require('p-limit').default;
const uploadSingleLoad = require('./service');
const createObjectCsvWriter = require("csv-writer").createObjectCsvWriter;


// ---- Test SFTP connection on startup ----
async function testSftpConnection() {
  const sftp = new SftpClient();
  try {

    console.log("🔌 Testing SFTP connection...");
    await sftp.connect(sftpConfig);

    console.log("✅ SFTP connection successful");
    const files = await sftp.list(".");
    console.log("Files in root directory:", files);
    await sftp.end();
  } catch (err) {
    console.error("❌ SFTP connection error:", err.message);
  }
}

route.post('/uploadInvoice', asyncHandler(async (req, res) => {
        const {loadsArray } = req.body;
        if (!loadsArray || !Array.isArray(loadsArray) || loadsArray.length === 0) {
            return res.status(400).json({ error: "Invalid or missing loadsArray in request body" });
        }

        const sftp = new SftpClient();
        try {
            await sftp.connect(sftpConfig);
            console.log("🔌 SFTP connected");
        } catch (err) {
            console.error("❌ SFTP connection error:", err.message);
            return res.status(500).json({ error: "Failed to connect to SFTP server" });
        }
        
        // Limit concurrency to 5 uploads at a time
        const limit = pLimit(5);
        const csvWriter = createObjectCsvWriter({
            path: "uploaded_loads.csv",
            header: [
                { id: "Client", title: "Client" },
                { id: "Invoice#", title: "Invoice#" },
                { id: "DebtorNo", title: "DebtorNo" },
                { id: "Debtor Name", title: "Debtor Name" },
                { id: "Load #", title: "Load #" },
                { id: "InvDate", title: "InvDate" },
                { id: "InvAmt", title: "InvAmt" }
            ],
            append: true
        });
        await csvWriter.writeRecords([{
            Client: "Client",
            "Invoice#": "Invoice#",
            DebtorNo: "DebtorNo",
            "Debtor Name": "Debtor Name",
            "Load #": "Load #",
            InvDate: "InvDate",
            InvAmt: "InvAmt"
        }]);
        const results = await Promise.allSettled(loadsArray.map(load => limit(() => uploadSingleLoad(load, sftp, csvWriter))));
        console.log("CSV write completed");
        //print the CSV here
        const csvContent = fs.readFileSync("uploaded_loads.csv", "utf-8");
        console.log("CSV Content:\n", csvContent);

        //Uplaod CSV to SFTP
        await sftp.put(path.resolve("uploaded_loads.csv"), "/uploaded_loads.csv");
        console.log("✅ CSV uploaded to SFTP");

         // Delete local CSV after upload

        try {
            fs.unlinkSync("uploaded_loads.csv");
            console.log("🗑️ Local CSV deleted");
        } catch (err) {
            console.error("⚠️ Failed to delete CSV:", err.message);
        }

        const successfulUploads = results
            .filter(r => r.status === "fulfilled" && r.value)
            .map(r => r.value);

        console.log("✅ Successfully uploaded recordIds:", successfulUploads);
        await sftp.end();
        res.json({ success: true, uploadedRecordIds: successfulUploads });
    }
));

module.exports = route;