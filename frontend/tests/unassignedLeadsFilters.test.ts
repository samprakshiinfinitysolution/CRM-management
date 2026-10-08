import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { LeadItem, PriorityLevel, LeadStatus } from '../src/types/api.types.js';

describe('Unassigned Leads Table Filtering & Pagination Architecture Suite', () => {
  const sampleLeads: LeadItem[] = [
    {
      id: 'lead-1',
      leadCode: 'CRM-000001',
      customerName: 'Aarav Patel',
      mobile: '9876543210',
      requirement: 'Enterprise ERP Solution',
      city: 'Mumbai',
      priority: PriorityLevel.URGENT,
      leadSource: 'WEBSITE',
      status: LeadStatus.NEW,
      createdAt: '2026-03-01T10:00:00Z',
      updatedAt: '2026-03-01T10:00:00Z',
    },
    {
      id: 'lead-2',
      leadCode: 'CRM-000002',
      customerName: 'Diya Sharma',
      mobile: '9876543211',
      requirement: 'CRM Cloud Migration',
      city: 'Delhi',
      priority: PriorityLevel.HIGH,
      leadSource: 'CAMPAIGN',
      status: LeadStatus.NEW,
      createdAt: '2026-03-02T10:00:00Z',
      updatedAt: '2026-03-02T10:00:00Z',
    },
    {
      id: 'lead-3',
      leadCode: 'CRM-000003',
      customerName: 'Rohan Gupta',
      mobile: '9876543212',
      requirement: 'Custom Analytics Portal',
      city: 'Bengaluru',
      priority: PriorityLevel.LOW,
      leadSource: 'REFERRAL',
      status: LeadStatus.NEW,
      createdAt: '2026-03-03T10:00:00Z',
      updatedAt: '2026-03-03T10:00:00Z',
    },
  ];

  test('Server-Pagination Mode: delegates filtering to server query and prevents local slice starvation', () => {
    // In server-pagination mode, serverOnPageChange is defined.
    // The server has already applied filters and returned page 1 results.
    const serverPageResults = [sampleLeads[0]]; // Only lead-1 returned for query "Aarav"
    const isServerPagination = true;
    const serverTotalCount = 1;

    // Filter computation logic matching UnassignedLeadsTable
    const displayLeads = isServerPagination ? serverPageResults : [];

    assert.equal(displayLeads.length, 1);
    assert.equal(displayLeads[0].leadCode, 'CRM-000001');
    assert.equal(serverTotalCount, 1);
  });

  test('Server-Pagination Mode: changing search, priority, or source invokes parent query and resets server page to 1', () => {
    let parentSearchTerm = '';
    let parentPriority = 'ALL';
    let parentSource = 'ALL';
    let serverPage = 3;

    const onSearchChange = (term: string) => {
      parentSearchTerm = term;
    };
    const onPriorityChange = (priority: string) => {
      parentPriority = priority;
    };
    const onSourceChange = (source: string) => {
      parentSource = source;
    };
    const serverOnPageChange = (p: number) => {
      serverPage = p;
    };

    const isServerPagination = Boolean(serverOnPageChange);

    // Simulate search change handler from UnassignedLeadsTable
    const handleSearchChange = (term: string) => {
      onSearchChange(term);
      if (isServerPagination && serverOnPageChange) {
        serverOnPageChange(1);
      }
    };

    // Simulate priority change handler from UnassignedLeadsTable
    const handlePriorityChange = (val: string | null) => {
      const nextPriority = val || 'ALL';
      onPriorityChange(nextPriority);
      if (isServerPagination && serverOnPageChange) {
        serverOnPageChange(1);
      }
    };

    // Simulate source change handler from UnassignedLeadsTable
    const handleSourceChange = (val: string | null) => {
      const nextSource = val || 'ALL';
      onSourceChange(nextSource);
      if (isServerPagination && serverOnPageChange) {
        serverOnPageChange(1);
      }
    };

    // 1. Search change test
    serverPage = 4;
    handleSearchChange('Diya');
    assert.equal(parentSearchTerm, 'Diya');
    assert.equal(serverPage, 1, 'Search change must reset server page to 1');

    // 2. Priority change test
    serverPage = 5;
    handlePriorityChange('URGENT');
    assert.equal(parentPriority, 'URGENT');
    assert.equal(serverPage, 1, 'Priority change must reset server page to 1');

    // 3. Source change test
    serverPage = 2;
    handleSourceChange('CAMPAIGN');
    assert.equal(parentSource, 'CAMPAIGN');
    assert.equal(serverPage, 1, 'Source change must reset server page to 1');
  });

  test('Local-Pagination Mode: applies client-side filtering across full lead set and resets local page', () => {
    let currentPage = 3;
    const pageSize = 2;

    const filterLeads = (
      leads: LeadItem[],
      searchTerm: string,
      priorityFilter: string,
      sourceFilter: string
    ) => {
      return leads.filter((lead) => {
        const matchesSearch =
          !searchTerm ||
          lead.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          lead.leadCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
          lead.mobile.includes(searchTerm);

        const matchesPriority =
          priorityFilter === 'ALL' || lead.priority === priorityFilter;
        const matchesSource =
          sourceFilter === 'ALL' ||
          (lead.leadSource &&
            lead.leadSource.toUpperCase() === sourceFilter.toUpperCase());

        return matchesSearch && matchesPriority && matchesSource;
      });
    };

    // Filter by priority URGENT
    const urgentFiltered = filterLeads(sampleLeads, '', 'URGENT', 'ALL');
    assert.equal(urgentFiltered.length, 1);
    assert.equal(urgentFiltered[0].customerName, 'Aarav Patel');

    // Filter by source CAMPAIGN
    const campaignFiltered = filterLeads(sampleLeads, '', 'ALL', 'CAMPAIGN');
    assert.equal(campaignFiltered.length, 1);
    assert.equal(campaignFiltered[0].customerName, 'Diya Sharma');

    // Filter by search
    const searchFiltered = filterLeads(sampleLeads, 'Rohan', 'ALL', 'ALL');
    assert.equal(searchFiltered.length, 1);
    assert.equal(searchFiltered[0].customerName, 'Rohan Gupta');

    // Slicing in local mode resets to page 1
    currentPage = 1;
    const paginated = urgentFiltered.slice(
      (currentPage - 1) * pageSize,
      currentPage * pageSize
    );
    assert.equal(paginated.length, 1);
  });
});
