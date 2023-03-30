const Docxtemplater = require('docxtemplater');
const Pizzip = require('pizzip');
const fs = require('fs');

interface rule{
    keyword:string;
    replaceKeyword:string
}

export function rep(filePath: string,destPath:string, rules:Set<rule>) {
    // Load the docx file as a binary
    const content = fs.readFileSync(filePath, "binary");

    // Create a new JSZip object
    const zip = new Pizzip(content);

    // Load the "word/document.xml" file from the zip
    const doc = new Docxtemplater();
    doc.loadZip(zip);
    let xml = doc.getZip().file('word/document.xml').asText();
    rules.forEach(item =>{
        const searchRegex = new RegExp(item.keyword, 'g');
        xml = xml.replace(searchRegex, item.replaceKeyword);
    })
    doc.getZip().file('word/document.xml', xml);
    // Save the updated docx file
    const buf  =  doc.getZip().generate({type: "nodebuffer"});
    if(destPath.trim().length!==0){
        console.log(filePath)
        const regex = /\\([^\\]+\.(doc|docx))$/;
        let filename = regex.exec(filePath)[1]
        filePath = destPath+"/"+filename
    }
    fs.writeFileSync(filePath, buf);

}


