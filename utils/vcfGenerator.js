exports.generateVCF = (contacts) => {
  let vcf = '';
  const now = new Date().toISOString();
  
  contacts.forEach((contact, index) => {
    vcf += 'BEGIN:VCARD\n';
    vcf += 'VERSION:3.0\n';
    vcf += `FN:${contact.firstName} ${contact.lastName}\n`;
    vcf += `N:${contact.lastName};${contact.firstName};;;\n`;
    vcf += `TEL;TYPE=CELL:${contact.phone}\n`;
    vcf += `EMAIL:${contact.email}\n`;
    
    if (contact.profilePic) {
      vcf += `PHOTO;TYPE=JPEG:${contact.profilePic}\n`;
    }
    
    vcf += `NOTE:Added on ${now}\n`;
    vcf += `X-WHATSAPP:${contact.isWhatsApp ? 'YES' : 'NO'}\n`;
    vcf += 'END:VCARD\n\n';
  });
  
  return vcf;
};
