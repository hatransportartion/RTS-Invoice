const express = require("express");
const multer = require("multer");
const SftpClient = require("ssh2-sftp-client");

const app = express();
const upload = multer({ dest: "uploads/" }); // local temp storage

// RTS SFTP config
const sftpConfig = {
  host: "ftps.rtsfinancial.com",
  port: 22,
  username: "101212REC",
  password: "1+1PECuBTvQMiUUt5qBv",
  algorithms: { serverHostKey: ["rsa-sha2-256", "rsa-sha2-512"] }
};

async function testSftpConnection() {
  const sftp = new SftpClient();
  try {
    await sftp.connect(sftpConfig);
    console.log("SFTP connection successful ✅");
    const files = await sftp.list('.');
    console.log("Files in root directory:", files);
  } catch (err) {
    console.error("SFTP connection error:", err);
  }
}


app.post("/upload", upload.single("file"), async (req, res) => {
  const sftp = new SftpClient();
  try {
    await sftp.connect(sftpConfig);

    const localPath = req.file.path;
    const remotePath = `/inbox/${req.file.originalname}`;

    await sftp.put(localPath, remotePath);

    await sftp.end();
    res.json({ success: true, message: "File uploaded to RTS SFTP ✅" });
  } catch (err) {
    console.error("SFTP Upload error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(3000, () => {
  console.log("EC2 Airtable-SFTP bridge running on port 3000");
  testSftpConnection();
});
