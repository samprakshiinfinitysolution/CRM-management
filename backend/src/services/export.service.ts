import prisma from '../config/db.js';
import { UserRole } from '../types/index.js';
import {
  generateLeadsExcelBuffer,
  generateLeadsCsvString,
  LeadExportRow,
} from '../utils/excel.util.js';
import { AppError } from '../middleware/errorHandler.js';

export interface ExportLeadsFilterInput {
  leadIds?: string[];
  status?: string;
  source?: string;
  city?: string;
  priority?: string;
  assignedToUserId?: string;
  search?: string;
  fromDate?: string;
  toDate?: string;
  format?: 'xlsx' | 'csv';
}

export class ExportService {
  /**
   * Generates an Excel export buffer for leads based on filters and role-based security rules.
   * Sales Executives are strictly restricted to leads assigned to their own user ID.
   */
  static async exportLeadsToExcel(
    filter: ExportLeadsFilterInput,
    user: { id: string; role: string }
  ): Promise<{ buffer: Buffer; count: number; fileName: string; contentType: string }> {
    const whereClause: any = {
      isDeleted: false,
    };

    // Role-based security isolation (Rule 10: Sales Executive Isolation)
    if (user.role === UserRole.SALES_EXECUTIVE) {
      whereClause.assignedToUserId = user.id;
    } else if (filter.assignedToUserId) {
      whereClause.assignedToUserId =
        filter.assignedToUserId === 'UNASSIGNED' ? null : filter.assignedToUserId;
    }

    // Filter by specific lead IDs (e.g. Selected rows in frontend)
    if (filter.leadIds && filter.leadIds.length > 0) {
      whereClause.id = { in: filter.leadIds };
    }

    // Status filter
    if (filter.status && filter.status !== 'ALL') {
      whereClause.status = filter.status;
    }

    // Source filter
    if (filter.source && filter.source !== 'ALL') {
      whereClause.leadSource = filter.source;
    }

    // Priority filter
    if (filter.priority && filter.priority !== 'ALL') {
      whereClause.priority = filter.priority;
    }

    // City filter
    if (filter.city && filter.city.trim() !== '') {
      whereClause.city = { contains: filter.city.trim(), mode: 'insensitive' };
    }

    // Date range filter
    if (filter.fromDate || filter.toDate) {
      whereClause.createdAt = {};
      if (filter.fromDate) {
        whereClause.createdAt.gte = new Date(filter.fromDate);
      }
      if (filter.toDate) {
        const endDate = new Date(filter.toDate);
        endDate.setHours(23, 59, 59, 999);
        whereClause.createdAt.lte = endDate;
      }
    }

    // Search query across name, mobile, email, company, and leadCode
    if (filter.search && filter.search.trim() !== '') {
      const q = filter.search.trim();
      whereClause.OR = [
        { customerName: { contains: q, mode: 'insensitive' } },
        { mobile: { contains: q } },
        { email: { contains: q, mode: 'insensitive' } },
        { companyName: { contains: q, mode: 'insensitive' } },
        { leadCode: { contains: q, mode: 'insensitive' } },
      ];
    }

    const leads = await prisma.lead.findMany({
      where: whereClause,
      include: {
        assignedTo: {
          select: { id: true, name: true, email: true },
        },
        assignedBy: {
          select: { id: true, name: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100, // Safe upper boundary for single workbook export
    });

    if (leads.length === 0) {
      throw new AppError('No leads found matching the selected export criteria', 404, 'NO_LEADS_FOUND');
    }

    const exportRows: LeadExportRow[] = leads.map((lead) => ({
      leadCode: lead.leadCode,
      customerName: lead.customerName,
      mobile: lead.mobile,
      alternateMobile: lead.alternateMobile,
      email: lead.email,
      companyName: lead.companyName,
      city: lead.city,
      state: lead.state,
      requirement: lead.requirement,
      productService: lead.productService,
      budget: lead.budget ? lead.budget.toString() : null,
      leadSource: lead.leadSource,
      priority: lead.priority,
      status: lead.status,
      assignedToName: lead.assignedTo?.name || null,
      assignedByName: lead.assignedBy?.name || null,
      assignedAt: lead.assignedAt,
      createdAt: lead.createdAt,
    }));

    const dateStamp = new Date().toISOString().split('T')[0];
    const isCsv = filter.format === 'csv';

    if (isCsv) {
      const csvString = generateLeadsCsvString(exportRows);
      return {
        buffer: Buffer.from(csvString, 'utf-8'),
        contentType: 'text/csv; charset=utf-8',
        count: exportRows.length,
        fileName: `leads_export_${dateStamp}.csv`,
      };
    }

    const buffer = await generateLeadsExcelBuffer(exportRows);
    return {
      buffer,
      contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      count: exportRows.length,
      fileName: `leads_export_${dateStamp}.xlsx`,
    };
  }
}
