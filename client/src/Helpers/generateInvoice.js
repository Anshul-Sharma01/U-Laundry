import jsPDF from 'jspdf';
import 'jspdf-autotable';

const generateInvoice = (order, user) => {
    const doc = new jsPDF();

    // Add header
    doc.setFontSize(20);
    doc.text('U-Laundry Services - Invoice', 14, 22);
    doc.setFontSize(12);
    doc.text(`Order ID: ${order.orderId}`, 14, 32);
    doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, 14, 38);

    // Add user details
    doc.setFontSize(12);
    doc.text('Billed To:', 14, 50);
    doc.text(user?.fullName, 14, 56);
    doc.text(user?.email, 14, 62);

    // Add order summary table
    const tableColumn = ["Item", "Category", "Quantity", "Price"];
    const tableRows = [];

    order.items.forEach(item => {
        const itemData = [
            item.name,
            item.category,
            item.quantity,
            `₹${item.price.toFixed(2)}`
        ];
        tableRows.push(itemData);
    });

    doc.autoTable(tableColumn, tableRows, { startY: 70 });

    // Add total amount
    const finalY = doc.lastAutoTable.finalY || 80;
    doc.setFontSize(14);
    doc.text(`Total Amount: ₹${order.totalAmount.toFixed(2)}`, 14, finalY + 10);

    // Add footer
    doc.setFontSize(10);
    doc.text('Thank you for choosing U-Laundry Services!', 14, doc.internal.pageSize.height - 10);

    doc.save(`invoice_${order.orderId}.pdf`);
};

export default generateInvoice; 