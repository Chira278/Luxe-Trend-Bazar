const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Ensure invoices directory exists
const invoicesDir = path.join(__dirname, '../invoices');
if (!fs.existsSync(invoicesDir)) {
  fs.mkdirSync(invoicesDir, { recursive: true });
}

function generateInvoice(order) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const fileName = `invoice-${order.orderId}.pdf`;
      const filePath = path.join(invoicesDir, fileName);
      
      // Pipe to file
      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);
      
      // Header
      doc.fontSize(20)
         .fillColor('#ff6b35')
         .text('LUXE', 50, 50)
         .fontSize(10)
         .fillColor('#666666')
         .text('Premium E-commerce', 50, 75);
      
      // Invoice title
      doc.fontSize(20)
         .fillColor('#000000')
         .text('INVOICE', 400, 50, { align: 'right' });
      
      doc.fontSize(10)
         .fillColor('#666666')
         .text(`Invoice #: ${order.orderId}`, 400, 75, { align: 'right' })
         .text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, 400, 90, { align: 'right' })
         .text(`Status: ${order.status.toUpperCase()}`, 400, 105, { align: 'right' });
      
      // Line
      doc.moveTo(50, 140)
         .lineTo(550, 140)
         .strokeColor('#ff6b35')
         .lineWidth(2)
         .stroke();
      
      // Bill To
      doc.fontSize(12)
         .fillColor('#000000')
         .text('Bill To:', 50, 160);
      
      doc.fontSize(10)
         .fillColor('#666666')
         .text(order.customerInfo.name, 50, 180)
         .text(order.customerInfo.email, 50, 195)
         .text(order.customerInfo.phone || '', 50, 210);
      
      // Ship To
      doc.fontSize(12)
         .fillColor('#000000')
         .text('Ship To:', 300, 160);
      
      doc.fontSize(10)
         .fillColor('#666666')
         .text(order.shippingAddress.street, 300, 180)
         .text(`${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zip}`, 300, 195)
         .text(order.shippingAddress.country, 300, 210);
      
      // Items table header
      const tableTop = 260;
      doc.fontSize(10)
         .fillColor('#ffffff')
         .rect(50, tableTop, 500, 25)
         .fill('#ff6b35');
      
      doc.fillColor('#ffffff')
         .text('Item', 60, tableTop + 8)
         .text('Qty', 350, tableTop + 8)
         .text('Price', 420, tableTop + 8)
         .text('Total', 490, tableTop + 8);
      
      // Items
      let yPosition = tableTop + 35;
      order.items.forEach((item, index) => {
        const bgColor = index % 2 === 0 ? '#f9f9f9' : '#ffffff';
        doc.rect(50, yPosition - 5, 500, 25).fill(bgColor);
        
        doc.fillColor('#000000')
           .text(item.name, 60, yPosition, { width: 280 })
           .text(item.quantity.toString(), 350, yPosition)
           .text(`$${item.price.toFixed(2)}`, 420, yPosition)
           .text(`$${(item.price * item.quantity).toFixed(2)}`, 490, yPosition);
        
        yPosition += 30;
      });
      
      // Totals
      yPosition += 20;
      doc.moveTo(50, yPosition)
         .lineTo(550, yPosition)
         .strokeColor('#cccccc')
         .lineWidth(1)
         .stroke();
      
      yPosition += 15;
      
      doc.fontSize(10)
         .fillColor('#666666')
         .text('Subtotal:', 400, yPosition)
         .fillColor('#000000')
         .text(`$${order.pricing.subtotal.toFixed(2)}`, 490, yPosition);
      
      yPosition += 20;
      doc.fillColor('#666666')
         .text('Shipping:', 400, yPosition)
         .fillColor('#000000')
         .text(order.pricing.shipping === 0 ? 'FREE' : `$${order.pricing.shipping.toFixed(2)}`, 490, yPosition);
      
      yPosition += 20;
      doc.fillColor('#666666')
         .text('Tax:', 400, yPosition)
         .fillColor('#000000')
         .text(`$${order.pricing.tax.toFixed(2)}`, 490, yPosition);
      
      if (order.pricing.discount > 0) {
        yPosition += 20;
        doc.fillColor('#4caf50')
           .text('Discount:', 400, yPosition)
           .text(`-$${order.pricing.discount.toFixed(2)}`, 490, yPosition);
      }
      
      yPosition += 20;
      doc.moveTo(400, yPosition)
         .lineTo(550, yPosition)
         .strokeColor('#ff6b35')
         .lineWidth(2)
         .stroke();
      
      yPosition += 15;
      doc.fontSize(14)
         .fillColor('#ff6b35')
         .text('Total:', 400, yPosition)
         .text(`$${order.pricing.total.toFixed(2)}`, 490, yPosition);
      
      // Payment info
      yPosition += 40;
      doc.fontSize(10)
         .fillColor('#000000')
         .text('Payment Information', 50, yPosition);
      
      yPosition += 20;
      doc.fillColor('#666666')
         .text(`Payment Method: ${order.paymentMethod.toUpperCase()}`, 50, yPosition)
         .text(`Transaction ID: ${order.paymentDetails.transactionId}`, 50, yPosition + 15)
         .text(`Payment Status: ${order.paymentStatus.toUpperCase()}`, 50, yPosition + 30);
      
      // Tracking info
      if (order.trackingNumber) {
        yPosition += 60;
        doc.fontSize(10)
           .fillColor('#000000')
           .text('Shipping Information', 50, yPosition);
        
        yPosition += 20;
        doc.fillColor('#666666')
           .text(`Tracking Number: ${order.trackingNumber}`, 50, yPosition)
           .text(`Estimated Delivery: ${new Date(order.estimatedDelivery).toLocaleDateString()}`, 50, yPosition + 15);
      }
      
      // Footer
      const footerY = 750;
      doc.moveTo(50, footerY)
         .lineTo(550, footerY)
         .strokeColor('#cccccc')
         .lineWidth(1)
         .stroke();
      
      doc.fontSize(8)
         .fillColor('#999999')
         .text('Thank you for shopping with LUXE!', 50, footerY + 10, { align: 'center', width: 500 })
         .text('For support, contact: chiragvijan278@gmail.com | +91 7668669092', 50, footerY + 25, { align: 'center', width: 500 })
         .text('© 2025 LUXE Premium E-commerce. All rights reserved.', 50, footerY + 40, { align: 'center', width: 500 });
      
      // Finalize PDF
      doc.end();
      
      stream.on('finish', () => {
        resolve({
          fileName,
          filePath,
          url: `/api/invoices/${fileName}`
        });
      });
      
      stream.on('error', reject);
      
    } catch (error) {
      reject(error);
    }
  });
}

module.exports = { generateInvoice };
