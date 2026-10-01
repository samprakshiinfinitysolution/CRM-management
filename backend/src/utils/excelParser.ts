import * as XLSX from 'xlsx';
import { PriorityLevel, StagedLeadRow } from '../types/index.js';

// Header aliases mapping dictionaries (lowercase normalized key matching)
const FIELD_ALIASES: Record<string, string[]> = {
  customerName: [
    'customer name',
    'customer',
    'name',
    'client name',
    'client',
    'contact name',
    'full name',
    'lead name',
    'customername',
    'customer_name',
    'prospect name',
  ],
  mobile: [
    'mobile',
    'mobile number',
    'phone',
    'phone number',
    'contact',
    'contact number',
    'cell',
    'cell phone',
    'whatsapp number',
    'whatsapp',
    'mob',
    'primary phone',
    'mobile_number',
    'phonenumber',
  ],
  alternateMobile: [
    'alternate mobile',
    'alt mobile',
    'alternate phone',
    'alt phone',
    'secondary phone',
    'alternate_mobile',
    'alt_phone',
    'secondary contact',
    'alternatemobile',
  ],
  email: [
    'email',
    'email id',
    'email address',
    'mail',
    'e-mail',
    'email_id',
    'emailid',
  ],
  companyName: [
    'company name',
    'company',
    'organization',
    'business name',
    'firm name',
    'company_name',
    'org',
    'org name',
  ],
  city: ['city', 'location', 'town', 'district', 'city/state', 'city / state', 'city state'],
  state: ['state', 'province', 'region'],
  requirement: [
    'requirement',
    'requirements',
    'required product',
    'project description',
    'description',
    'enquiry details',
    'query',
    'need',
    'service required',
    'details',
    'inquiry',
  ],
  productService: [
    'product / service',
    'product/service',
    'product',
    'service',
    'package',
    'interested in',
    'product_service',
    'item',
  ],
  budget: [
    'budget',
    'value',
    'deal value',
    'amount',
    'estimated budget',
    'price',
    'deal_value',
    'cost',
    'project budget',
  ],
  leadSource: [
    'lead source',
    'source',
    'channel',
    'campaign',
    'medium',
    'origin',
    'lead_source',
  ],
  priority: ['priority', 'priority level', 'urgency', 'priority_level'],
  remarks: [
    'remarks',
    'notes',
    'comments',
    'additional notes',
    'comment',
    'remark',
  ],
  status: ['status', 'lead status', 'lead_status'],
};

/**
 * Normalizes header string for comparison
 */
const normalizeHeader = (header: string): string => {
  return header.toString().trim().toLowerCase().replace(/[_\-\s]+/g, ' ');
};

/**
 * Finds the matched internal field name from arbitrary raw header
 */
export const matchFieldKey = (rawHeader: string): string | null => {
  const norm = normalizeHeader(rawHeader);
  for (const [canonicalField, aliases] of Object.entries(FIELD_ALIASES)) {
    if (canonicalField.toLowerCase() === norm || aliases.includes(norm)) {
      return canonicalField;
    }
  }
  return null;
};

/**
 * Clean & normalize phone numbers
 */
export const sanitizePhoneNumber = (phone: any): string => {
  if (!phone) return '';
  const str = String(phone).trim();
  // Remove formatting characters like spaces, dashes, dots, brackets
  const cleaned = str.replace(/[\s\-\(\)\.]/g, '');
  return cleaned;
};

/**
 * Email validation regex
 */
export const isValidEmail = (email: string): boolean => {
  if (!email) return false;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email.trim().toLowerCase());
};

/**
 * Parse priority string into PriorityLevel enum
 */
export const parsePriority = (val: any): PriorityLevel => {
  if (!val) return PriorityLevel.MEDIUM;
  const str = String(val).trim().toUpperCase();
  if (str === 'URGENT' || str === 'CRITICAL') return PriorityLevel.URGENT;
  if (str === 'HIGH') return PriorityLevel.HIGH;
  if (str === 'LOW') return PriorityLevel.LOW;
  return PriorityLevel.MEDIUM;
};

/**
 * Parse budget numeric value
 */
export const parseBudget = (val: any): number | null => {
  if (val === null || val === undefined || val === '') return null;
  if (typeof val === 'number') return isNaN(val) ? null : val;
  const cleanStr = String(val).replace(/[^0-9.-]+/g, '');
  const parsed = parseFloat(cleanStr);
  return isNaN(parsed) ? null : parsed;
};

/**
 * Parses an Excel or CSV buffer and extracts staged lead records
 */
export const parseExcelBuffer = (
  buffer: Buffer,
  _originalFileName: string = 'leads.xlsx'
): {
  rawRows: Record<string, any>[];
  headersDetected: string[];
  stagedRows: StagedLeadRow[];
} => {
  const workbook = XLSX.read(buffer, {
    type: 'buffer',
    cellDates: true,
    raw: false,
    dateNF: 'yyyy-mm-dd',
  });

  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) {
    return {
      rawRows: [],
      headersDetected: [],
      stagedRows: [],
    };
  }

  const worksheet = workbook.Sheets[firstSheetName];
  const rawRows = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, {
    defval: '',
    blankrows: false,
  });

  if (rawRows.length === 0) {
    return {
      rawRows: [],
      headersDetected: [],
      stagedRows: [],
    };
  }

  // Detect and collect headers from the first few rows
  const rawHeaderKeys = new Set<string>();
  rawRows.slice(0, 10).forEach((row) => {
    Object.keys(row).forEach((k) => rawHeaderKeys.add(k));
  });
  const headersDetected = Array.from(rawHeaderKeys);

  // Map header keys to canonical fields
  const columnMap: Record<string, string> = {};
  for (const rawHeader of headersDetected) {
    const matched = matchFieldKey(rawHeader);
    if (matched) {
      columnMap[rawHeader] = matched;
    }
  }

  // In-file duplicate tracker
  const seenMobilesInFile = new Map<string, number>(); // mobile -> rowNumber
  const seenEmailsInFile = new Map<string, number>(); // email -> rowNumber

  const stagedRows: StagedLeadRow[] = rawRows.map((rawRow, idx) => {
    const rowNumber = idx + 2; // Row 1 is header in Excel, data starts at Row 2
    const mappedData: Record<string, any> = {};

    // Apply header mappings
    for (const [rawKey, val] of Object.entries(rawRow)) {
      const canonicalKey = columnMap[rawKey] || matchFieldKey(rawKey);
      if (canonicalKey) {
        mappedData[canonicalKey] = val;
      }
    }

    const customerName = String(
      mappedData.customerName ||
        rawRow['Customer Name'] ||
        rawRow['Name'] ||
        ''
    ).trim();

    const rawMobile =
      mappedData.mobile || rawRow['Mobile'] || rawRow['Phone'] || '';
    const mobile = sanitizePhoneNumber(rawMobile);

    const rawAltMobile =
      mappedData.alternateMobile ||
      rawRow['Alternate Mobile'] ||
      rawRow['Alt Mobile'] ||
      '';
    const alternateMobile = rawAltMobile
      ? sanitizePhoneNumber(rawAltMobile)
      : null;

    const rawEmail = String(
      mappedData.email || rawRow['Email'] || rawRow['Email ID'] || ''
    ).trim();
    const email = rawEmail ? rawEmail.toLowerCase() : null;

    const companyName =
      String(
        mappedData.companyName ||
          rawRow['Company Name'] ||
          rawRow['Company'] ||
          ''
      ).trim() || null;

    const city =
      String(
        mappedData.city || rawRow['City'] || rawRow['Location'] || ''
      ).trim() || null;

    const state =
      String(mappedData.state || rawRow['State'] || '').trim() || null;

    const requirement = String(
      mappedData.requirement ||
        rawRow['Requirement'] ||
        rawRow['Description'] ||
        rawRow['Query'] ||
        ''
    ).trim();

    const productService =
      String(
        mappedData.productService ||
          rawRow['Product / Service'] ||
          rawRow['Product'] ||
          ''
      ).trim() || null;

    const rawBudget =
      mappedData.budget ?? rawRow['Budget'] ?? rawRow['Value'];
    const budget = parseBudget(rawBudget);

    const leadSource =
      String(
        mappedData.leadSource ||
          rawRow['Lead Source'] ||
          rawRow['Source'] ||
          'EXCEL_IMPORT'
      ).trim() || 'EXCEL_IMPORT';

    const priority = parsePriority(
      mappedData.priority || rawRow['Priority']
    );

    const remarks =
      String(
        mappedData.remarks || rawRow['Remarks'] || rawRow['Notes'] || ''
      ).trim() || null;

    // Row Validation Rules
    const validationErrors: string[] = [];

    if (!customerName || customerName.length < 2) {
      validationErrors.push('Customer Name is required (minimum 2 characters)');
    }

    if (!mobile || mobile.replace(/\D/g, '').length < 10) {
      validationErrors.push(
        'Valid Mobile number is required (minimum 10 digits)'
      );
    }

    if (!requirement) {
      validationErrors.push('Requirement / Enquiry details are required');
    }

    if (email && !isValidEmail(email)) {
      validationErrors.push(`Invalid email address format: "${email}"`);
    }

    // Check In-File Duplicates
    let status: 'VALID' | 'DUPLICATE' | 'INVALID' = 'VALID';
    let validationNote = 'Ready for ingestion';

    if (validationErrors.length > 0) {
      status = 'INVALID';
      validationNote = validationErrors.join('; ');
    } else {
      // Check if duplicate mobile in file
      if (mobile && seenMobilesInFile.has(mobile)) {
        const firstRow = seenMobilesInFile.get(mobile);
        status = 'DUPLICATE';
        validationNote = `Duplicate mobile with row #${firstRow} in uploaded sheet`;
      } else if (email && seenEmailsInFile.has(email)) {
        const firstRow = seenEmailsInFile.get(email);
        status = 'DUPLICATE';
        validationNote = `Duplicate email with row #${firstRow} in uploaded sheet`;
      } else {
        if (mobile) seenMobilesInFile.set(mobile, rowNumber);
        if (email) seenEmailsInFile.set(email, rowNumber);
      }
    }

    return {
      rowNumber,
      customerName: customerName || 'Unnamed Lead',
      mobile: mobile || 'N/A',
      alternateMobile,
      email,
      companyName,
      city,
      state,
      requirement: requirement || 'General enquiry',
      productService,
      budget,
      leadSource,
      priority,
      remarks,
      status,
      validationNote,
      rawRowData: rawRow,
    };
  });

  return {
    rawRows,
    headersDetected,
    stagedRows,
  };
};

/**
 * Creates an official Lead Excel template workbook buffer
 */
export const createLeadExcelTemplateBuffer = (
  includeSampleRows: boolean = true
): Buffer => {
  const headers = [
    'Customer Name',
    'Mobile',
    'Alternate Mobile',
    'Email',
    'Company Name',
    'City',
    'State',
    'Requirement',
    'Product / Service',
    'Budget',
    'Lead Source',
    'Priority',
    'Remarks',
  ];

  const sampleRows = includeSampleRows
    ? [
        [
          'Rahul Sharma',
          '9876543210',
          '9811223344',
          'rahul.sharma@example.com',
          'Sharma Enterprise',
          'Mumbai',
          'Maharashtra',
          'Requires Cloud CRM software for 25 sales reps',
          'CRM Enterprise Edition',
          50000,
          'Website Inquiry',
          'High',
          'Requested live product demo this Friday',
        ],
        [
          'Priya Patel',
          '9123456789',
          '',
          'priya.patel@techno.in',
          'Techno Global Solutions',
          'Bangalore',
          'Karnataka',
          'Looking for Lead distribution & WhatsApp API integration',
          'Lead Automation Module',
          75000,
          'Referral',
          'Urgent',
          'Urgent requirement, budget pre-approved',
        ],
        [
          'Amit Verma',
          '9988776655',
          '',
          'amit.verma@apexgroup.com',
          'Apex Industrial Supplies',
          'Delhi',
          'Delhi',
          'Needs ERP & sales pipeline tracking tool',
          'Sales Pipeline Standard',
          35000,
          'LinkedIn Ads',
          'Medium',
          'Comparing with 2 other vendors',
        ],
        [
          'Sneha Reddy',
          '9844332211',
          '9844332212',
          'sneha@hyderabadventures.com',
          'Hyderabad Ventures',
          'Hyderabad',
          'Telangana',
          'Real estate CRM customization with follow-up tracking',
          'Custom Real Estate CRM',
          120000,
          'Cold Call',
          'High',
          'Decision maker is Managing Director',
        ],
        [
          'Vikram Malhotra',
          '9765432190',
          '',
          'vikram.m@malhotratech.com',
          'Malhotra Technologies',
          'Pune',
          'Maharashtra',
          'Inquiring about sales executive commission tracking & reports',
          'Analytics & Reporting Addon',
          25000,
          'Google Search',
          'Low',
          'Initial inquiry stage',
        ],
      ]
    : [];

  const wsData = [headers, ...sampleRows];
  const worksheet = XLSX.utils.aoa_to_sheet(wsData);

  // Set column widths for beautiful readability
  worksheet['!cols'] = [
    { wch: 22 }, // Customer Name
    { wch: 15 }, // Mobile
    { wch: 18 }, // Alternate Mobile
    { wch: 28 }, // Email
    { wch: 25 }, // Company Name
    { wch: 16 }, // City
    { wch: 16 }, // State
    { wch: 45 }, // Requirement
    { wch: 26 }, // Product / Service
    { wch: 14 }, // Budget
    { wch: 18 }, // Lead Source
    { wch: 12 }, // Priority
    { wch: 38 }, // Remarks
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Leads');

  const buffer = XLSX.write(workbook, {
    type: 'buffer',
    bookType: 'xlsx',
  });

  return buffer;
};
