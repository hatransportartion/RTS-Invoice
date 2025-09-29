const fetch = require("node-fetch");
const invoiceNumber = "TEST1234";
const fs = require("fs");
const path = require("path");
test();


async function test(){
    try{
        const URL = "https://v5.airtableusercontent.com/v3/u/45/45/1759176000000/qfDGOkTDwiK1MId6Gu6m0Q/RkiQ3egvkuewxgsZWqPp3dnhSECnx4J_hTEUakq2ubxasiUUkNfxry0CHwl7inC38zF0EADMXzvu-cn9MiZPpeIMev4gXIs1Skg25FugRUj0zfsviEsri5sZ_GAM_7VZgTcBD0fFpbpDFLYQqY57jcPAiN3-p01OapFosvjJpA0/VwOgb9hwaaTvhofYV4tm2DQFTa5BmjkmRmx079yzfDw";
        const pdfResponse = await fetch(URL, {
            method: "GET",
            headers: {
                "Content-Type": "application/pdf",
            }, 
            //body: JSON.stringify({ key: "value" }), // Only for POST/PUT requests
        });
        // console.log("Response:", pdfResponse);
        if (!pdfResponse.ok) throw new Error("Failed to download PDF");
        const pdfBuffer = await pdfResponse.buffer();

        console.log("PDF Buffer Length:", pdfBuffer);

        
        //locally save the pdf for debugging
        fs.writeFileSync(`./uploads/${invoiceNumber}.pdf`, pdfBuffer);
        // const localPath = path.resolve(`./uploads/${invoiceNumber}.pdf`);

    }catch(err){
        console.error(`❌ Error with ${invoiceNumber}:`, err.message);
        return null; // failed
    }
}