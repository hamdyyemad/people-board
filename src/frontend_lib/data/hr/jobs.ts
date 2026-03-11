export interface Job {
  id: string;
  title: string;
  department_id: string;
  department_name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export const JOBS_DATA: Job[] = [
  // Engineering
  { id: "job-001", title: "Senior Frontend Engineer", department_id: "dept-002", department_name: "Frontend", is_active: true, created_at: "2023-03-01T09:00:00Z", updated_at: "2024-11-10T10:00:00Z", deleted_at: null },
  { id: "job-002", title: "Frontend Engineer", department_id: "dept-002", department_name: "Frontend", is_active: true, created_at: "2023-03-01T09:00:00Z", updated_at: "2024-10-15T10:00:00Z", deleted_at: null },
  { id: "job-003", title: "Junior Frontend Engineer", department_id: "dept-002", department_name: "Frontend", is_active: true, created_at: "2023-06-01T09:00:00Z", updated_at: "2024-09-20T10:00:00Z", deleted_at: null },
  { id: "job-004", title: "Senior Backend Engineer", department_id: "dept-003", department_name: "Backend", is_active: true, created_at: "2023-03-01T09:00:00Z", updated_at: "2024-11-05T10:00:00Z", deleted_at: null },
  { id: "job-005", title: "Backend Engineer", department_id: "dept-003", department_name: "Backend", is_active: true, created_at: "2023-03-01T09:00:00Z", updated_at: "2024-10-01T10:00:00Z", deleted_at: null },
  { id: "job-006", title: "Staff Engineer", department_id: "dept-001", department_name: "Engineering", is_active: true, created_at: "2023-04-01T09:00:00Z", updated_at: "2024-09-15T10:00:00Z", deleted_at: null },
  { id: "job-007", title: "Engineering Manager", department_id: "dept-001", department_name: "Engineering", is_active: true, created_at: "2023-04-01T09:00:00Z", updated_at: "2024-08-20T10:00:00Z", deleted_at: null },
  { id: "job-008", title: "DevOps Engineer", department_id: "dept-004", department_name: "DevOps", is_active: true, created_at: "2023-05-01T09:00:00Z", updated_at: "2024-11-01T10:00:00Z", deleted_at: null },
  { id: "job-009", title: "Senior DevOps Engineer", department_id: "dept-004", department_name: "DevOps", is_active: true, created_at: "2023-05-01T09:00:00Z", updated_at: "2024-10-10T10:00:00Z", deleted_at: null },
  { id: "job-010", title: "QA Engineer", department_id: "dept-005", department_name: "QA", is_active: true, created_at: "2023-05-01T09:00:00Z", updated_at: "2024-09-05T10:00:00Z", deleted_at: null },
  { id: "job-011", title: "Senior QA Engineer", department_id: "dept-005", department_name: "QA", is_active: true, created_at: "2023-05-01T09:00:00Z", updated_at: "2024-08-10T10:00:00Z", deleted_at: null },
  { id: "job-012", title: "QA Lead", department_id: "dept-005", department_name: "QA", is_active: false, created_at: "2023-05-01T09:00:00Z", updated_at: "2024-07-15T10:00:00Z", deleted_at: null },

  // Product
  { id: "job-013", title: "Product Manager", department_id: "dept-008", department_name: "Product Management", is_active: true, created_at: "2023-04-15T09:00:00Z", updated_at: "2024-11-08T10:00:00Z", deleted_at: null },
  { id: "job-014", title: "Senior Product Manager", department_id: "dept-008", department_name: "Product Management", is_active: true, created_at: "2023-04-15T09:00:00Z", updated_at: "2024-10-12T10:00:00Z", deleted_at: null },
  { id: "job-015", title: "Product Designer", department_id: "dept-007", department_name: "Product Design", is_active: true, created_at: "2023-04-15T09:00:00Z", updated_at: "2024-09-18T10:00:00Z", deleted_at: null },
  { id: "job-016", title: "Senior Product Designer", department_id: "dept-007", department_name: "Product Design", is_active: true, created_at: "2023-04-15T09:00:00Z", updated_at: "2024-08-25T10:00:00Z", deleted_at: null },
  { id: "job-017", title: "UX Researcher", department_id: "dept-007", department_name: "Product Design", is_active: true, created_at: "2023-07-01T09:00:00Z", updated_at: "2024-07-30T10:00:00Z", deleted_at: null },

  // HR
  { id: "job-018", title: "HR Manager", department_id: "dept-009", department_name: "Human Resources", is_active: true, created_at: "2023-02-01T09:00:00Z", updated_at: "2024-11-15T10:00:00Z", deleted_at: null },
  { id: "job-019", title: "Recruiter", department_id: "dept-010", department_name: "Talent Acquisition", is_active: true, created_at: "2023-06-01T09:00:00Z", updated_at: "2024-10-20T10:00:00Z", deleted_at: null },
  { id: "job-020", title: "Senior Recruiter", department_id: "dept-010", department_name: "Talent Acquisition", is_active: true, created_at: "2023-06-01T09:00:00Z", updated_at: "2024-09-25T10:00:00Z", deleted_at: null },
  { id: "job-021", title: "HR Business Partner", department_id: "dept-011", department_name: "People Operations", is_active: true, created_at: "2023-06-01T09:00:00Z", updated_at: "2024-08-30T10:00:00Z", deleted_at: null },
  { id: "job-022", title: "Compensation Analyst", department_id: "dept-011", department_name: "People Operations", is_active: false, created_at: "2023-06-01T09:00:00Z", updated_at: "2024-07-05T10:00:00Z", deleted_at: null },

  // Finance
  { id: "job-023", title: "CFO", department_id: "dept-012", department_name: "Finance", is_active: true, created_at: "2023-02-01T09:00:00Z", updated_at: "2024-11-12T10:00:00Z", deleted_at: null },
  { id: "job-024", title: "Financial Analyst", department_id: "dept-014", department_name: "Financial Planning", is_active: true, created_at: "2023-07-01T09:00:00Z", updated_at: "2024-10-18T10:00:00Z", deleted_at: null },
  { id: "job-025", title: "Senior Financial Analyst", department_id: "dept-014", department_name: "Financial Planning", is_active: true, created_at: "2023-07-01T09:00:00Z", updated_at: "2024-09-22T10:00:00Z", deleted_at: null },
  { id: "job-026", title: "Accountant", department_id: "dept-013", department_name: "Accounting", is_active: true, created_at: "2023-07-01T09:00:00Z", updated_at: "2024-08-28T10:00:00Z", deleted_at: null },
  { id: "job-027", title: "Senior Accountant", department_id: "dept-013", department_name: "Accounting", is_active: true, created_at: "2023-07-01T09:00:00Z", updated_at: "2024-07-10T10:00:00Z", deleted_at: null },

  // Marketing
  { id: "job-028", title: "CMO", department_id: "dept-015", department_name: "Marketing", is_active: true, created_at: "2023-02-01T09:00:00Z", updated_at: "2024-11-20T10:00:00Z", deleted_at: null },
  { id: "job-029", title: "Content Writer", department_id: "dept-016", department_name: "Content", is_active: true, created_at: "2023-08-01T09:00:00Z", updated_at: "2024-10-25T10:00:00Z", deleted_at: null },
  { id: "job-030", title: "Content Manager", department_id: "dept-016", department_name: "Content", is_active: true, created_at: "2023-08-01T09:00:00Z", updated_at: "2024-09-30T10:00:00Z", deleted_at: null },
  { id: "job-031", title: "Growth Marketer", department_id: "dept-017", department_name: "Growth", is_active: true, created_at: "2023-08-01T09:00:00Z", updated_at: "2024-09-05T10:00:00Z", deleted_at: null },
  { id: "job-032", title: "SEO Specialist", department_id: "dept-017", department_name: "Growth", is_active: true, created_at: "2023-08-01T09:00:00Z", updated_at: "2024-08-12T10:00:00Z", deleted_at: null },
  { id: "job-033", title: "Brand Designer", department_id: "dept-018", department_name: "Brand", is_active: true, created_at: "2023-08-01T09:00:00Z", updated_at: "2024-07-18T10:00:00Z", deleted_at: null },
  { id: "job-034", title: "Brand Manager", department_id: "dept-018", department_name: "Brand", is_active: false, created_at: "2023-08-01T09:00:00Z", updated_at: "2024-06-25T10:00:00Z", deleted_at: null },

  // Sales
  { id: "job-035", title: "Account Executive", department_id: "dept-020", department_name: "Enterprise Sales", is_active: true, created_at: "2023-09-01T09:00:00Z", updated_at: "2024-11-22T10:00:00Z", deleted_at: null },
  { id: "job-036", title: "Senior Account Executive", department_id: "dept-020", department_name: "Enterprise Sales", is_active: true, created_at: "2023-09-01T09:00:00Z", updated_at: "2024-10-28T10:00:00Z", deleted_at: null },
  { id: "job-037", title: "Sales Development Rep", department_id: "dept-021", department_name: "SMB Sales", is_active: true, created_at: "2023-09-01T09:00:00Z", updated_at: "2024-10-02T10:00:00Z", deleted_at: null },
  { id: "job-038", title: "Sales Manager", department_id: "dept-019", department_name: "Sales", is_active: true, created_at: "2023-09-01T09:00:00Z", updated_at: "2024-09-08T10:00:00Z", deleted_at: null },

  // Customer Success
  { id: "job-039", title: "Customer Success Manager", department_id: "dept-022", department_name: "Customer Success", is_active: true, created_at: "2023-10-01T09:00:00Z", updated_at: "2024-11-05T10:00:00Z", deleted_at: null },
  { id: "job-040", title: "Support Engineer", department_id: "dept-023", department_name: "Support", is_active: true, created_at: "2023-10-01T09:00:00Z", updated_at: "2024-10-10T10:00:00Z", deleted_at: null },
  { id: "job-041", title: "Senior Support Engineer", department_id: "dept-023", department_name: "Support", is_active: true, created_at: "2023-10-01T09:00:00Z", updated_at: "2024-09-15T10:00:00Z", deleted_at: null },
  { id: "job-042", title: "Onboarding Specialist", department_id: "dept-024", department_name: "Onboarding", is_active: true, created_at: "2023-10-01T09:00:00Z", updated_at: "2024-08-20T10:00:00Z", deleted_at: null },

  // Legal
  { id: "job-043", title: "General Counsel", department_id: "dept-025", department_name: "Legal", is_active: true, created_at: "2023-02-01T09:00:00Z", updated_at: "2024-10-30T10:00:00Z", deleted_at: null },
  { id: "job-044", title: "Legal Counsel", department_id: "dept-025", department_name: "Legal", is_active: true, created_at: "2023-11-01T09:00:00Z", updated_at: "2024-09-28T10:00:00Z", deleted_at: null },
  { id: "job-045", title: "Compliance Officer", department_id: "dept-025", department_name: "Legal", is_active: false, created_at: "2023-11-01T09:00:00Z", updated_at: "2024-08-05T10:00:00Z", deleted_at: null },
];
