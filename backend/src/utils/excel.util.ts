import ExcelJS from 'exceljs';

export interface LeadExportRow {
  leadCode: string;
  customerName: string;
  mobile: string;
  alternateMobile?: string | null;
  email?: string | null;
  companyName?: string | null;
  city?: string | null;
  state?: string | null;
  requirement: string;
  productService?: string | null;
  budget?: number | string | null;
  leadSource?: string | null;
  priority: string;
  status: string;
  assignedToName?: string | null;
  assignedByName?: string | null;
  assignedAt?: Date | string | null;
  createdAt: Date | string;
};

/**
 * Prevents spreadsheet formula injection.
 *
 * Excel/LibreOffice may interpret cells beginning with:
 * =, +, -, @
 * as formulas when the exported file is opened.
 *
 * Prefixing with an apostrophe forces the value to be treated as text.
 */
const sanitizeSpreadsheetCell = (
  value: string | null | undefined,
): string => {
  if (value == null) {
    return '';
  }

  const normalized = String(value);

  if (/^[=+\-@]/.test(normalized)) {
    return `'${normalized}`;
  }

  return normalized;
};

/**
 * Generates a professionally formatted Excel workbook buffer for Leads export.
 */
export const generateLeadsExcelBuffer = async (
  leads: LeadExportRow[],
): Promise<Buffer> => {
  const workbook = new ExcelJS.Workbook();

  workbook.creator = 'CRM System';
  workbook.lastModifiedBy = 'CRM System';
  workbook.created = new Date();
  workbook.modified = new Date();

  const worksheet = workbook.addWorksheet('Leads Export', {
    views: [{ showGridLines: true }],
  });

  worksheet.columns = [
    { header: 'Lead Code', key: 'leadCode', width: 16 },
    { header: 'Customer Name', key: 'customerName', width: 24 },
    { header: 'Mobile Number', key: 'mobile', width: 16 },
    { header: 'Alternate Mobile', key: 'alternateMobile', width: 18 },
    { header: 'Email Address', key: 'email', width: 28 },
    { header: 'Company Name', key: 'companyName', width: 24 },
    { header: 'City', key: 'city', width: 16 },
    { header: 'State', key: 'state', width: 16 },
    { header: 'Requirement', key: 'requirement', width: 32 },
    { header: 'Product / Service', key: 'productService', width: 22 },
    { header: 'Budget (INR)', key: 'budget', width: 16 },
    { header: 'Lead Source', key: 'leadSource', width: 16 },
    { header: 'Priority', key: 'priority', width: 14 },
    { header: 'Status', key: 'status', width: 20 },
    { header: 'Assigned Executive', key: 'assignedToName', width: 22 },
    { header: 'Assigned By', key: 'assignedByName', width: 20 },
    { header: 'Assigned At', key: 'assignedAt', width: 20 },
    { header: 'Created At', key: 'createdAt', width: 20 },
  ];

  // Header row formatting
  const headerRow = worksheet.getRow(1);

  headerRow.height = 28;

  headerRow.font = {
    name: 'Segoe UI',
    size: 11,
    bold: true,
    color: { argb: 'FFFFFFFF' },
  };

  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF1E40AF' },
  };

  headerRow.alignment = {
    vertical: 'middle',
    horizontal: 'center',
  };

  // Add lead data rows
  for (const lead of leads) {
    const row = worksheet.addRow({
      leadCode: sanitizeSpreadsheetCell(lead.leadCode),
      customerName: sanitizeSpreadsheetCell(lead.customerName),
      mobile: sanitizeSpreadsheetCell(lead.mobile),
      alternateMobile: sanitizeSpreadsheetCell(
        lead.alternateMobile || '—',
      ),
      email: sanitizeSpreadsheetCell(lead.email || '—'),
      companyName: sanitizeSpreadsheetCell(lead.companyName || '—'),
      city: sanitizeSpreadsheetCell(lead.city || '—'),
      state: sanitizeSpreadsheetCell(lead.state || '—'),
      requirement: sanitizeSpreadsheetCell(lead.requirement),
      productService: sanitizeSpreadsheetCell(
        lead.productService || '—',
      ),
      budget: lead.budget ? Number(lead.budget) : null,
      leadSource: sanitizeSpreadsheetCell(
        lead.leadSource || 'Direct',
      ),
      priority: sanitizeSpreadsheetCell(lead.priority),
      status: sanitizeSpreadsheetCell(
        lead.status.replace(/_/g, ' '),
      ),
      assignedToName: sanitizeSpreadsheetCell(
        lead.assignedToName || 'Unassigned',
      ),
      assignedByName: sanitizeSpreadsheetCell(
        lead.assignedByName || '—',
      ),
      assignedAt: lead.assignedAt
        ? new Date(lead.assignedAt)
        : null,
      createdAt: new Date(lead.createdAt),
    });

    row.height = 20;

    row.font = {
      name: 'Segoe UI',
      size: 10,
    };

    row.alignment = {
      vertical: 'middle',
    };
  }

  // Column-specific formatting
  const budgetCol = worksheet.getColumn('budget');

  budgetCol.numFmt = '#,##0.00';

  budgetCol.alignment = {
    vertical: 'middle',
    horizontal: 'right',
  };

  const assignedAtCol = worksheet.getColumn('assignedAt');

  assignedAtCol.numFmt = 'yyyy-mm-dd hh:mm';

  assignedAtCol.alignment = {
    vertical: 'middle',
    horizontal: 'center',
  };

  const createdAtCol = worksheet.getColumn('createdAt');

  createdAtCol.numFmt = 'yyyy-mm-dd hh:mm';

  createdAtCol.alignment = {
    vertical: 'middle',
    horizontal: 'center',
  };

  const leadCodeCol = worksheet.getColumn('leadCode');

  leadCodeCol.alignment = {
    vertical: 'middle',
    horizontal: 'center',
  };

  const priorityCol = worksheet.getColumn('priority');

  priorityCol.alignment = {
    vertical: 'middle',
    horizontal: 'center',
  };

  const statusCol = worksheet.getColumn('status');

  statusCol.alignment = {
    vertical: 'middle',
    horizontal: 'center',
  };

  const buffer = await workbook.xlsx.writeBuffer();

  return Buffer.from(buffer);
};

/**
 * Generates a CSV string for Leads export using json-2-csv.
 */
export const generateLeadsCsvString = (
  leads: LeadExportRow[],
): string => {
  const { json2csv } = require('json-2-csv');

  const formattedLeads = leads.map((lead) => ({
    'Lead Code': sanitizeSpreadsheetCell(lead.leadCode),
    'Customer Name': sanitizeSpreadsheetCell(lead.customerName),
    'Mobile Number': sanitizeSpreadsheetCell(lead.mobile),
    'Alternate Mobile': sanitizeSpreadsheetCell(
      lead.alternateMobile,
    ),
    'Email Address': sanitizeSpreadsheetCell(lead.email),
    'Company Name': sanitizeSpreadsheetCell(lead.companyName),
    'City': sanitizeSpreadsheetCell(lead.city),
    'State': sanitizeSpreadsheetCell(lead.state),
    'Requirement': sanitizeSpreadsheetCell(lead.requirement),
    'Product / Service': sanitizeSpreadsheetCell(
      lead.productService,
    ),
    'Budget (INR)': lead.budget ?? '',
    'Lead Source': sanitizeSpreadsheetCell(
      lead.leadSource || 'Direct',
    ),
    'Priority': sanitizeSpreadsheetCell(lead.priority),
    'Status': sanitizeSpreadsheetCell(
      lead.status.replace(/_/g, ' '),
    ),
    'Assigned Executive': sanitizeSpreadsheetCell(
      lead.assignedToName || 'Unassigned',
    ),
    'Assigned By': sanitizeSpreadsheetCell(
      lead.assignedByName,
    ),
    'Assigned At': lead.assignedAt
      ? new Date(lead.assignedAt).toISOString()
      : '',
    'Created At': new Date(lead.createdAt).toISOString(),
  }));

  return json2csv(formattedLeads, {
    emptyFieldValue: '',
    excelBOM: true,
  });
};