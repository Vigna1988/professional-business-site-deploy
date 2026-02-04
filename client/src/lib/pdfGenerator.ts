import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Specification {
  parameter: string;
  value?: string;
  unit?: string;
  adb?: string;
  arb?: string;
  merged?: string;
}

interface Commodity {
  name: string;
  hasBasis?: boolean;
  specifications: Specification[];
}

export function generateCommodityPDF(
  categoryName: string,
  commodity: Commodity
) {
  const doc = new jsPDF();
  
  // Company branding colors
  const goldColor: [number, number, number] = [218, 165, 32]; // RGB for gold
  const brownColor: [number, number, number] = [74, 56, 41]; // RGB for brown
  
  // Header with company branding
  doc.setFillColor(...goldColor);
  doc.rect(0, 0, 210, 40, 'F');
  
  // Company name
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('HARVEST COMMODITIES', 105, 20, { align: 'center' });
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Premium Quality Commodities Trading', 105, 28, { align: 'center' });
  
  // Document title
  doc.setTextColor(...brownColor);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(`${categoryName} Specifications`, 105, 55, { align: 'center' });
  
  // Commodity name
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(commodity.name, 105, 65, { align: 'center' });
  
  // Specifications table
  if (commodity.hasBasis) {
    // Special table format for Coal with ADB/ARB basis
    const tableData = commodity.specifications.map(spec => {
      if (spec.merged) {
        return [spec.parameter, spec.unit || '', { content: spec.merged, colSpan: 2, styles: { halign: 'center' as const } }];
      }
      return [spec.parameter, spec.unit || '', spec.adb || '', spec.arb || ''];
    });
    
    autoTable(doc, {
      startY: 75,
      head: [['Parameter', 'Units', 'ADB', 'ARB']],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: goldColor,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        halign: 'center'
      },
      bodyStyles: {
        textColor: brownColor
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      },
      margin: { left: 20, right: 20 }
    });
  } else {
    // Standard table format
    const tableData = commodity.specifications.map(spec => [
      spec.parameter,
      spec.value || ''
    ]);
    
    autoTable(doc, {
      startY: 75,
      head: [['Parameter', 'Specification']],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: goldColor,
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      bodyStyles: {
        textColor: brownColor
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      },
      columnStyles: {
        0: { cellWidth: 80 },
        1: { cellWidth: 90 }
      },
      margin: { left: 20, right: 20 }
    });
  }
  
  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    
    // Footer line
    doc.setDrawColor(...goldColor);
    doc.setLineWidth(0.5);
    doc.line(20, 280, 190, 280);
    
    // Contact information
    doc.setFontSize(9);
    doc.setTextColor(...brownColor);
    doc.setFont('helvetica', 'normal');
    doc.text('Unit 2A, 17F, Glenealy Tower, No.1 Glenealy Central, Hong Kong', 105, 285, { align: 'center' });
    doc.text('Email: jericho.ang@theharvestman.com', 105, 290, { align: 'center' });
    
    // Page number
    doc.setFontSize(8);
    doc.text(`Page ${i} of ${pageCount}`, 190, 295, { align: 'right' });
  }
  
  // Generate filename
  const filename = `${commodity.name.replace(/[^a-z0-9]/gi, '_')}_Specifications.pdf`;
  
  // Download the PDF
  doc.save(filename);
}
