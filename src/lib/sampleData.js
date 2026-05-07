// =====================================================================
// Sample data — three realistic Telangana High Court cases.
// Used when Supabase is not configured, so the app demos out of the box.
// All IDs are stable strings so React keys stay consistent across reloads.
// =====================================================================
//
// Each case carries:
//   - the structured fields (cases / directions / actions / appeal_analysis)
//   - judgment_pages: synthetic page text used for the in-PDF source-highlighting view
//   - audit_log entries (some pre-seeded so the audit tab isn't empty)
//
// =====================================================================

export const SAMPLE_CASES = [
  // ============================================================
  // CASE 1 — Municipal Workers Regularization (VERIFIED, CRITICAL)
  // ============================================================
  {
    id: 'case-001',
    case_number: 'WP(C) No. 4528/2025',
    title: 'Regularization of contract workers — GHMC sanitation wing',
    court: 'High Court for the State of Telangana',
    bench: "Hon'ble Sri Justice P. Naveen Rao & Hon'ble Sri Justice N. Tukaramji",
    date_of_order: '2026-02-18',
    date_of_filing: '2025-04-12',
    petitioner: 'Telangana State Sanitation Workers Welfare Association (Regd.), Hyderabad',
    respondent: 'State of Telangana, rep. by Principal Secretary, Municipal Administration & Urban Development Dept.',
    dept_role: 'respondent',
    disposal_status: 'disposed',
    document_type: 'digital',
    extraction_quality: 92,
    summary:
      'A writ petition filed by the Sanitation Workers Welfare Association seeking regularization of 2,847 contract workers who have served the GHMC for over 10 years. The Division Bench held that prolonged engagement on contract basis amounts to unfair labour practice and directed the State to frame a regularization scheme within 90 days. The court further directed payment of arrears at minimum wage rates from the date of filing of the petition. The judgment carries an estimated financial implication of ₹4.2 Cr in arrears alone.',
    department: 'Municipal Administration & Urban Development',
    priority: 'critical',
    status: 'verified',
    reviewed_by: 'D. Anitha (Deputy Secretary)',
    reviewed_at: '2026-02-22T09:30:00Z',
    verified_by: 'K. Ramesh Reddy (Joint Secretary, MA&UD)',
    verified_at: '2026-02-25T11:42:00Z',
    pdf_url: null,
    cis_origin: 'cis_api',
    cis_diary_no: 'CIS-2026-HC-TS-04528',
    created_at: '2026-02-20T09:00:00Z',
    directions: [
      {
        id: 'dir-001-1',
        direction_text:
          'State to frame a regularization scheme for contract sanitation workers with 10+ years of continuous service within 90 days from the date of this order.',
        source_quote:
          'The respondent State is directed to formulate, within a period of ninety (90) days from the date of receipt of a certified copy of this order, a comprehensive scheme for regularization of all contract sanitation workers engaged by the Greater Hyderabad Municipal Corporation who have rendered continuous service of not less than ten years.',
        timeline: '90 days from order',
        timeline_type: 'explicit',
        calculated_deadline: '2026-05-19',
        confidence: 96,
        confidence_reason:
          'Directly stated in the operative portion of the order with an explicit 90-day timeline. No ambiguity in the language.',
        page_reference: 14,
        sort_order: 0,
      },
      {
        id: 'dir-001-2',
        direction_text:
          'Pay arrears computed at the prescribed minimum wage rate from the date of filing of the writ petition (12 April 2025).',
        source_quote:
          'The respondents shall further compute and disburse arrears of wages at the rates notified under the Minimum Wages Act, 1948 reckoned from the date of institution of this writ petition, namely 12.04.2025, until the date of regularization.',
        timeline: 'On or before scheme implementation',
        timeline_type: 'inferred',
        calculated_deadline: '2026-05-19',
        confidence: 88,
        confidence_reason:
          'Court mandated arrears but did not specify a separate payment deadline. We infer the deadline aligns with the 90-day scheme implementation window.',
        page_reference: 15,
        sort_order: 1,
      },
      {
        id: 'dir-001-3',
        direction_text:
          'File a compliance report before this court on or before the next date of hearing.',
        source_quote:
          'A compliance report, duly affirmed by the Principal Secretary, MA&UD Department, shall be placed before this Court on or before the next date of hearing, fixed for 28.05.2026.',
        timeline: 'By 28 May 2026',
        timeline_type: 'explicit',
        calculated_deadline: '2026-05-28',
        confidence: 95,
        confidence_reason: 'Specific date stated in the order with named officer responsible.',
        page_reference: 16,
        sort_order: 2,
      },
    ],
    appeal_analysis: {
      id: 'aa-001',
      recommendation: 'consider_appeal',
      limitation_period: '90 days for SLP under Article 136 of the Constitution',
      limitation_deadline: '2026-05-19',
      appeal_court: 'Supreme Court of India (SLP)',
      grounds:
        'Possible grounds: (i) reliance on Umadevi (2006) 4 SCC 1 — Constitution Bench held that mere length of service does not entitle regularization; (ii) absence of sanctioned posts; (iii) financial implications on State exchequer.',
      reasoning:
        'The order imposes a recurring financial burden of approximately ₹4.2 Cr in arrears plus an estimated ₹38 Cr per annum on regularization. While the Division Bench has applied a sympathetic lens, settled Supreme Court precedent (Umadevi) provides a strong legal basis for appeal. However, an SLP would need to weigh the optics of contesting workers welfare against the financial exposure. Recommend convening a meeting of the Empowered Committee before final decision.',
      risk_if_no_appeal:
        'The State will be bound to absorb 2,847 workers as regular employees, creating a permanent recurring liability and a precedent that the Welfare Associations of similarly placed contract workers (estimated 18,000 across the State) will rely upon in future litigation.',
    },
    actions: [
      {
        id: 'act-001-1',
        action_type: 'compliance',
        nature_of_action: 'administrative',
        description:
          'Issue Government Order constituting a scheme committee chaired by Principal Secretary, MA&UD with members from Finance and Law Departments. Committee to draft regularization scheme covering eligibility, pay-fitment, and absorption modalities.',
        department: 'Municipal Administration & Urban Development',
        responsible_authority: 'Principal Secretary, MA&UD Department',
        timeline: 'Within first 30 days of the 90-day compliance window',
        timeline_type: 'inferred',
        deadline: '2026-04-15',
        priority: 'critical',
        status: 'in_progress',
        status_updated_by: 'K. Ramesh Reddy (Joint Secretary, MA&UD)',
        status_updated_at: '2026-03-10T14:00:00Z',
        completion_note: 'Scheme committee constituted. First meeting held 09.03.2026.',
        sort_order: 0,
      },
      {
        id: 'act-001-2',
        action_type: 'compliance',
        nature_of_action: 'financial',
        description:
          'Estimate arrears liability at minimum wage rate (Rs. 26,500/month for unskilled workers) for 2,847 workers from 12.04.2025 and seek supplementary budget allocation through the Finance Department.',
        department: 'Finance Department',
        responsible_authority: 'Principal Finance Secretary',
        timeline: 'Before scheme implementation',
        timeline_type: 'inferred',
        deadline: '2026-04-30',
        priority: 'critical',
        status: 'pending',
        sort_order: 1,
      },
      {
        id: 'act-001-3',
        action_type: 'appeal_consideration',
        nature_of_action: 'legal',
        description:
          'Place case before the Empowered Committee for SLP decision. If appeal is decided upon, brief the Advocate-General to draft and file SLP within the 90-day limitation. Prepare paperbook drawing on Umadevi precedent.',
        department: 'Law Department',
        responsible_authority: 'Advocate-General, State of Telangana',
        timeline: '4 days before the 90-day SLP limitation expires',
        timeline_type: 'inferred',
        deadline: '2026-05-15',
        priority: 'high',
        status: 'pending',
        sort_order: 2,
      },
      {
        id: 'act-001-4',
        action_type: 'compliance',
        nature_of_action: 'legal',
        description:
          'Draft and file compliance affidavit before the High Court on or before 28.05.2026, signed by the Principal Secretary, attaching the GO constituting the scheme committee and progress on arrears computation.',
        department: 'Municipal Administration & Urban Development',
        responsible_authority: 'Principal Secretary, MA&UD Department',
        timeline: 'By 28 May 2026 — court-fixed next date of hearing',
        timeline_type: 'explicit',
        deadline: '2026-05-28',
        priority: 'critical',
        status: 'pending',
        sort_order: 3,
      },
    ],
    judgment_pages: [
      {
        page_number: 13,
        text:
          'After hearing learned counsel for both sides at length and on a careful perusal of the rival pleadings, this Court is persuaded that the engagement of the petitioner-workmen on a notionally "contract" basis for periods exceeding ten years amounts, in substance, to perennial employment dressed in the garb of contractual engagement. This Court has, in a long line of decisions, deprecated such practice as being violative of Articles 14 and 21 of the Constitution. The plea of the State that there exist no sanctioned posts is, in our considered view, no answer where the work itself is admittedly perennial. We accordingly proceed to issue the following directions.',
      },
      {
        page_number: 14,
        text:
          'The respondent State is directed to formulate, within a period of ninety (90) days from the date of receipt of a certified copy of this order, a comprehensive scheme for regularization of all contract sanitation workers engaged by the Greater Hyderabad Municipal Corporation who have rendered continuous service of not less than ten years. The said scheme shall, at the minimum, address (i) eligibility criteria with cut-off dates; (ii) pay-fitment in accordance with the prevailing pay matrix; and (iii) consequential service benefits, including provident fund and gratuity.',
      },
      {
        page_number: 15,
        text:
          'On the question of arrears: The respondents shall further compute and disburse arrears of wages at the rates notified under the Minimum Wages Act, 1948 reckoned from the date of institution of this writ petition, namely 12.04.2025, until the date of regularization. The computation shall be undertaken department-wise, district-wise, and ward-wise. We make it abundantly clear that the said arrears shall be in addition to, and not in substitution of, any wages already paid for the corresponding period.',
      },
      {
        page_number: 16,
        text:
          'A compliance report, duly affirmed by the Principal Secretary, MA&UD Department, shall be placed before this Court on or before the next date of hearing, fixed for 28.05.2026. List the matter accordingly. The Writ Petition is, in the above terms, allowed. There shall be no order as to costs.',
      },
    ],
    audit_log: [
      {
        id: 'al-001-1',
        action: 'edit',
        entity_table: 'directions',
        field_name: 'timeline',
        old_value: '90 days',
        new_value: '90 days from order',
        performed_by: 'D. Anitha (Deputy Secretary)',
        performed_at: '2026-02-22T09:14:00Z',
      },
      {
        id: 'al-001-2',
        action: 'reviewed',
        performed_by: 'D. Anitha (Deputy Secretary)',
        performed_at: '2026-02-22T09:30:00Z',
      },
      {
        id: 'al-001-3',
        action: 'approved',
        performed_by: 'K. Ramesh Reddy (Joint Secretary, MA&UD)',
        performed_at: '2026-02-25T11:42:00Z',
      },
      {
        id: 'al-001-4',
        action: 'status_changed',
        entity_table: 'actions',
        field_name: 'status',
        old_value: 'pending',
        new_value: 'in_progress',
        performed_by: 'K. Ramesh Reddy (Joint Secretary, MA&UD)',
        performed_at: '2026-03-10T14:00:00Z',
      },
    ],
  },

  // ============================================================
  // CASE 2 — Revenue Land Return (VERIFIED, HIGH)
  // ============================================================
  {
    id: 'case-002',
    case_number: 'WA No. 892/2025',
    title: 'Revenue land return — Outer Ring Road land acquisition',
    court: 'High Court for the State of Telangana',
    bench: "Hon'ble Sri Chief Justice & Hon'ble Sri Justice Vinod Kumar",
    date_of_order: '2026-03-04',
    date_of_filing: '2025-08-22',
    petitioner: 'Special Collector (Land Acquisition), Outer Ring Road Project',
    respondent: 'Smt. K. Lakshmi Devi & 17 others (Pattadars of Sy. No. 312/A, Mokila village)',
    dept_role: 'petitioner',
    disposal_status: 'disposed',
    document_type: 'digital',
    extraction_quality: 90,
    summary:
      "Writ Appeal filed by the State (Special Collector) challenging the order of the learned Single Judge directing return of 45 acres of acquired but unutilized land to the original pattadars and payment of compensation at current market rate. The Division Bench dismissed the appeal, affirming the Single Judge's view that land acquired under urgency provisions but kept idle for over 8 years cannot be retained without restoration of the pattadars' rights. The order has both a land-restoration and a monetary component (₹12 lakh per acre).",
    department: 'Revenue Department',
    priority: 'high',
    status: 'verified',
    reviewed_by: 'M. Suresh Babu (Section Officer, Revenue)',
    reviewed_at: '2026-03-08T17:10:00Z',
    verified_by: 'D. Anitha (Deputy Secretary, Revenue)',
    verified_at: '2026-03-10T15:18:00Z',
    pdf_url: null,
    cis_origin: 'cis_api',
    cis_diary_no: 'CIS-2026-HC-TS-WA-00892',
    created_at: '2026-03-06T10:00:00Z',
    directions: [
      {
        id: 'dir-002-1',
        direction_text:
          'Return 45 acres of unutilized acquired land to the original pattadars, with mutation of revenue records to be effected within 60 days.',
        source_quote:
          'The Writ Appeal is dismissed. The State is directed to restore possession of the unutilized 45 acres comprised in Sy. No. 312/A of Mokila village to the original pattadars, with consequential mutation in the revenue records to be effected within sixty days from today.',
        timeline: '60 days',
        timeline_type: 'explicit',
        calculated_deadline: '2026-05-03',
        confidence: 95,
        confidence_reason: 'Direct order with explicit 60-day timeline. Survey number and extent specified clearly.',
        page_reference: 22,
        sort_order: 0,
      },
      {
        id: 'dir-002-2',
        direction_text:
          'Pay compensation at the current market rate of ₹12 lakh per acre for any portion that has been encumbered or cannot be restored physically.',
        source_quote:
          'In the event that any portion of the said land has been encumbered or cannot be restored in specie, the State shall pay compensation at the prevailing market rate, which is determined for the present purposes at Rupees Twelve Lakhs per acre.',
        timeline: 'Within 60 days alongside restoration',
        timeline_type: 'inferred',
        calculated_deadline: '2026-05-03',
        confidence: 86,
        confidence_reason:
          'Compensation rate is explicit but the payment timeline is inferred from the broader 60-day restoration window.',
        page_reference: 23,
        sort_order: 1,
      },
    ],
    appeal_analysis: {
      id: 'aa-002',
      recommendation: 'strong_consider_appeal',
      limitation_period: '90 days for SLP under Article 136 of the Constitution',
      limitation_deadline: '2026-06-02',
      appeal_court: 'Supreme Court of India (SLP)',
      grounds:
        'Strong grounds available: (i) lapsing under Section 24(2) of the LA Act, 2013 has been read down by Indore Development Authority v. Manoharlal (2020); (ii) "unutilized" determination is contested; (iii) the State has incurred development cost on adjoining land that benefits the disputed parcel.',
      reasoning:
        'The combined exposure — return of 45 acres + ₹5.4 Cr compensation + precedent value across 11 similar pending matters — makes this a strong candidate for SLP. The Indore Development Authority Constitution Bench provides a robust legal basis. Recommend immediate engagement of a senior counsel and SLP filing without delay.',
      risk_if_no_appeal:
        "Loss of 45 acres of strategically located land near the ORR corridor, ₹5.4 Cr compensation outflow, and a binding precedent that will weaken the State's position in 11 similar pending matters across Ranga Reddy and Medchal districts.",
    },
    actions: [
      {
        id: 'act-002-1',
        action_type: 'appeal_consideration',
        nature_of_action: 'legal',
        description:
          'URGENT: Convene a special meeting of the Land Acquisition Committee to take a decision on filing SLP. Brief Senior Counsel (preferably one with prior IDA v. Manoharlal exposure) within 7 days.',
        department: 'Revenue Department',
        responsible_authority: 'Chief Commissioner of Land Administration (CCLA)',
        timeline: 'Within 7 days of the order — well before SLP limitation',
        timeline_type: 'inferred',
        deadline: '2026-04-15',
        priority: 'critical',
        status: 'in_progress',
        status_updated_by: 'D. Anitha (Deputy Secretary, Revenue)',
        status_updated_at: '2026-03-15T10:30:00Z',
        completion_note: 'LAC meeting scheduled for 2026-04-02. Senior counsel briefed.',
        sort_order: 0,
      },
      {
        id: 'act-002-2',
        action_type: 'compliance',
        nature_of_action: 'administrative',
        description:
          'In parallel (without prejudice to the appeal), prepare a survey-of-record of the 45 acres identifying which portions are physically restorable and which are encumbered (roads, drains, plantations).',
        department: 'Revenue Department',
        responsible_authority: 'District Collector, Ranga Reddy',
        timeline: 'Within 7 weeks of order — to align with 60-day restoration window',
        timeline_type: 'inferred',
        deadline: '2026-04-22',
        priority: 'high',
        status: 'pending',
        sort_order: 1,
      },
      {
        id: 'act-002-3',
        action_type: 'compliance',
        nature_of_action: 'financial',
        description:
          'If appeal is not filed (or denied stay): release ₹5.4 Cr compensation through the LA Compensation Account and effect mutations in revenue records.',
        department: 'Finance Department',
        responsible_authority: 'Principal Finance Secretary',
        timeline: 'Within 60 days of order — court-fixed restoration deadline',
        timeline_type: 'explicit',
        deadline: '2026-05-03',
        priority: 'high',
        status: 'pending',
        sort_order: 2,
      },
    ],
    judgment_pages: [
      {
        page_number: 21,
        text:
          'The point urged by the learned Advocate-General that the lands stood vested in the State free from all encumbrances by virtue of the urgency notification under Section 17 of the now-repealed Land Acquisition Act, 1894 cannot be accepted in light of the admitted position that, eight (8) years post-acquisition, the State has neither commenced nor undertaken any developmental activity on the said extent of 45 acres. We are constrained to hold that retention without utilization is, on these facts, antithetical to the very object of acquisition.',
      },
      {
        page_number: 22,
        text:
          'For the foregoing reasons, the Writ Appeal is dismissed. The State is directed to restore possession of the unutilized 45 acres comprised in Sy. No. 312/A of Mokila village to the original pattadars, with consequential mutation in the revenue records to be effected within sixty days from today. The Mandal Revenue Officer concerned shall, within the said period, complete all consequential entries in the records of rights and place a compliance report before the Office of the Special Collector.',
      },
      {
        page_number: 23,
        text:
          'In the event that any portion of the said land has been encumbered or cannot be restored in specie, the State shall pay compensation at the prevailing market rate, which is determined for the present purposes at Rupees Twelve Lakhs per acre. We make it clear that this rate has been arrived at on the basis of the registered sale-deed values of the immediately surrounding parcels, as placed on record by the respondents. There shall be no order as to costs.',
      },
    ],
    audit_log: [
      {
        id: 'al-002-1',
        action: 'edit',
        entity_table: 'appeal_analysis',
        field_name: 'reasoning',
        old_value: 'Strong appeal candidate.',
        new_value:
          'The combined exposure — return of 45 acres + ₹5.4 Cr compensation + precedent value across 11 similar pending matters — makes this a strong candidate for SLP. The Indore Development Authority Constitution Bench provides a robust legal basis. Recommend immediate engagement of a senior counsel and SLP filing without delay.',
        performed_by: 'M. Suresh Babu (Section Officer, Revenue)',
        performed_at: '2026-03-08T16:48:00Z',
      },
      {
        id: 'al-002-2',
        action: 'reviewed',
        performed_by: 'M. Suresh Babu (Section Officer, Revenue)',
        performed_at: '2026-03-08T17:10:00Z',
      },
      {
        id: 'al-002-3',
        action: 'approved',
        performed_by: 'D. Anitha (Deputy Secretary, Revenue)',
        performed_at: '2026-03-10T15:18:00Z',
      },
    ],
  },

  // ============================================================
  // CASE 3 — Road Safety PIL (PENDING — for review demo, SCANNED)
  // ============================================================
  {
    id: 'case-003',
    case_number: 'WP(C) No. 7712/2025 (PIL)',
    title: 'Road safety on State Highways — black-spot remediation',
    court: 'High Court for the State of Telangana',
    bench: "Hon'ble Sri Chief Justice & Hon'ble Sri Justice Sambasivarao Naidu",
    date_of_order: '2026-04-08',
    date_of_filing: '2025-11-14',
    petitioner: 'Sri V. Ravinder Reddy, Advocate (PIL Petitioner)',
    respondent: 'State of Telangana, rep. by Principal Secretary, Roads & Buildings Department',
    dept_role: 'respondent',
    disposal_status: 'partially_disposed',
    document_type: 'scanned',
    extraction_quality: 78,
    summary:
      'A Public Interest Litigation seeking remediation of 47 identified accident black-spots on State Highways. The court directed the R&B Department to implement engineering measures (signages, rumble strips, crash barriers, junction redesign) at all 47 locations within 6 months and to constitute a District Road Safety Committee in every district. The matter is partially disposed with directions to file periodic compliance reports.',
    department: 'Roads & Buildings',
    priority: 'high',
    status: 'pending',
    reviewed_by: null,
    reviewed_at: null,
    verified_by: null,
    verified_at: null,
    pdf_url: null,
    cis_origin: 'cis_api',
    cis_diary_no: 'CIS-2026-HC-TS-PIL-07712',
    created_at: '2026-04-09T08:00:00Z',
    directions: [
      {
        id: 'dir-003-1',
        direction_text:
          'Implement remedial engineering measures at all 47 identified black-spots within 6 months from the date of order.',
        source_quote:
          'The Roads & Buildings Department shall, within a period of six (6) months from today, undertake and complete remedial engineering interventions — including but not limited to signages, rumble strips, crash barriers, and re-engineering of road geometry where required — at each of the forty-seven (47) accident black-spots identified by the Telangana Road Safety Authority.',
        timeline: '6 months from order',
        timeline_type: 'explicit',
        calculated_deadline: '2026-10-08',
        confidence: 82,
        confidence_reason:
          'Explicit timeline stated, but the scanned document had OCR artifacts on the dates page; the 6-month figure is corroborated across two paragraphs.',
        page_reference: 11,
        sort_order: 0,
      },
      {
        id: 'dir-003-2',
        direction_text:
          'Constitute a District Road Safety Committee in every district headed by the District Collector with members from R&B, Police, RTA, and Health.',
        source_quote:
          'In every revenue district of the State, there shall be constituted, within ninety (90) days, a District Road Safety Committee chaired by the District Collector with members drawn from the R&B Department, the District Police, the Regional Transport Authority and the Health Department.',
        timeline: '90 days from order',
        timeline_type: 'explicit',
        calculated_deadline: '2026-07-07',
        confidence: 85,
        confidence_reason: 'Clear directive with specified composition and timeline; OCR confidence on this page was high.',
        page_reference: 12,
        sort_order: 1,
      },
      {
        id: 'dir-003-3',
        direction_text:
          'File a quarterly compliance report indicating progress at each of the 47 black-spots and the activities of every District Road Safety Committee.',
        source_quote:
          'Quarterly compliance reports shall be filed before this Court, the first such report being due three months from the date of this order.',
        timeline: 'Every 3 months',
        timeline_type: 'explicit',
        calculated_deadline: '2026-07-08',
        confidence: 80,
        confidence_reason:
          'Recurring directive — explicit but recurrence pattern required interpretation. First report deadline is firm.',
        page_reference: 13,
        sort_order: 2,
      },
      {
        id: 'dir-003-4',
        direction_text:
          'Earmark a dedicated budget line for road safety in the next annual budget cycle and not less than ₹50 crore for FY 2026-27.',
        source_quote:
          'The State shall, in the ensuing annual budget exercise, create a dedicated budget head for road safety interventions and shall, for the financial year 2026-27, allocate not less than Rupees Fifty Crores.',
        timeline: 'FY 2026-27 budget',
        timeline_type: 'inferred',
        calculated_deadline: '2027-03-31',
        confidence: 72,
        confidence_reason:
          'Direction is explicit but the calculated deadline (end of FY) is inferred. OCR quality on the budget page was lower than the rest of the document.',
        page_reference: 14,
        sort_order: 3,
      },
    ],
    appeal_analysis: {
      id: 'aa-003',
      recommendation: 'no_appeal',
      limitation_period: '90 days for SLP — but typically not pursued in PILs of this nature',
      limitation_deadline: '2026-07-07',
      appeal_court: 'Supreme Court of India (SLP)',
      grounds:
        'Limited grounds. The directions are remedial and consistent with statutory duties under the Motor Vehicles Act, the Code on Wages, and the State Highways Act.',
      reasoning:
        "This is a PIL on a matter of public safety. Appealing would carry significant reputational risk and is unlikely to succeed on merits. The Supreme Court has consistently upheld High Court directions on road-safety remediation. The directions, while exacting, are within the State's statutory mandate. Compliance is the recommended path.",
      risk_if_no_appeal:
        'Compliance burden of ₹50+ Cr in capital expenditure, 90-day deadlines for committee constitution, and continuous reporting obligations. However, these are obligations the State already owes under the MV Act framework.',
    },
    actions: [
      {
        id: 'act-003-1',
        action_type: 'compliance',
        nature_of_action: 'administrative',
        description:
          'Issue GO constituting District Road Safety Committees in all 33 districts with the prescribed composition. Notify members and convene first meeting within 90 days.',
        department: 'Roads & Buildings',
        responsible_authority: 'Principal Secretary, R&B Department',
        timeline: '90 days from order — court-fixed for committee constitution',
        timeline_type: 'explicit',
        deadline: '2026-07-07',
        priority: 'high',
        status: 'pending',
        sort_order: 0,
      },
      {
        id: 'act-003-2',
        action_type: 'compliance',
        nature_of_action: 'regulatory',
        description:
          'Prepare detailed project reports (DPRs) for all 47 black-spot interventions; tender out engineering work in batches; commence physical works at the 12 most-critical spots within 60 days.',
        department: 'Roads & Buildings',
        responsible_authority: 'Engineer-in-Chief (R&B)',
        timeline: '6 months from order — court-fixed black-spot remediation window',
        timeline_type: 'explicit',
        deadline: '2026-10-08',
        priority: 'critical',
        status: 'pending',
        sort_order: 1,
      },
      {
        id: 'act-003-3',
        action_type: 'compliance',
        nature_of_action: 'financial',
        description:
          'Process budget proposal for ₹50 Cr dedicated road-safety head in FY 2026-27 budget; coordinate with Finance Department to create the new budget line.',
        department: 'Finance Department',
        responsible_authority: 'Principal Finance Secretary',
        timeline: 'Aligned with FY 2026-27 budget exercise',
        timeline_type: 'inferred',
        deadline: '2026-12-15',
        priority: 'high',
        status: 'pending',
        sort_order: 2,
      },
      {
        id: 'act-003-4',
        action_type: 'compliance',
        nature_of_action: 'legal',
        description:
          'Prepare and file the first quarterly compliance affidavit before the High Court on or before 08.07.2026, attaching evidence of GO issuance, committee constitution, and works commencement.',
        department: 'Roads & Buildings',
        responsible_authority: 'Principal Secretary, R&B Department',
        timeline: 'First quarterly report due 3 months from order — court-fixed',
        timeline_type: 'explicit',
        deadline: '2026-07-08',
        priority: 'high',
        status: 'pending',
        sort_order: 3,
      },
    ],
    judgment_pages: [
      {
        page_number: 10,
        text:
          'The petitioner, drawing extensively from data placed on record by the Telangana Road Safety Authority, has demonstrated that 47 stretches on the State Highways have, in the preceding three years, accounted for a disproportionate share of fatal road traffic accidents. The State, through its counter, has not seriously contested the identification of these stretches as "black-spots". The remaining question is the appropriate remedial framework.',
      },
      {
        page_number: 11,
        text:
          'Having heard learned counsel for the parties and given our anxious consideration to the matter, we proceed to issue the following directions, which we trust shall be implemented in letter and spirit. The Roads & Buildings Department shall, within a period of six (6) months from today, undertake and complete remedial engineering interventions — including but not limited to signages, rumble strips, crash barriers, and re-engineering of road geometry where required — at each of the forty-seven (47) accident black-spots identified by the Telangana Road Safety Authority.',
      },
      {
        page_number: 12,
        text:
          'Institutional framework: In every revenue district of the State, there shall be constituted, within ninety (90) days, a District Road Safety Committee chaired by the District Collector with members drawn from the R&B Department, the District Police, the Regional Transport Authority and the Health Department. The said Committee shall meet at least once a month and shall be the nodal body for monitoring black-spot remediation, public awareness, post-crash care, and inter-departmental coordination.',
      },
      {
        page_number: 13,
        text:
          'On reporting: Quarterly compliance reports shall be filed before this Court, the first such report being due three months from the date of this order. The said reports shall be in the form of an affidavit sworn by the Principal Secretary, R&B Department, and shall set out, location-wise, the status of each of the 47 black-spot interventions and the constitution and deliberations of every District Road Safety Committee.',
      },
      {
        page_number: 14,
        text:
          'On budgetary commitment: The State shall, in the ensuing annual budget exercise, create a dedicated budget head for road safety interventions and shall, for the financial year 2026-27, allocate not less than Rupees Fifty Crores. List the matter for compliance after twelve weeks. The Writ Petition is, in the above terms, partially disposed of, with the directions noted herein remaining open for monitoring.',
      },
    ],
    audit_log: [],
  },
]

// =====================================================================
// Cause list — daily hearing list pulled from CIS
// =====================================================================
export const SAMPLE_CAUSE_LIST = [
  {
    id: 'cl-001',
    hearing_date: '2026-05-08',
    court: 'High Court for the State of Telangana',
    bench: "Hon'ble Sri Justice P. Naveen Rao & Hon'ble Sri Justice N. Tukaramji",
    case_number: 'WP(C) No. 4528/2025',
    case_id: 'case-001',
    parties: 'TS Sanitation Workers Welfare Assn. vs State of Telangana',
    listing_type: 'compliance_report',
    item_no: 4,
    remarks: 'Compliance affidavit due. State to demonstrate progress on regularization scheme.',
  },
  {
    id: 'cl-002',
    hearing_date: '2026-05-08',
    court: 'High Court for the State of Telangana',
    bench: "Hon'ble Sri Chief Justice & Hon'ble Sri Justice Vinod Kumar",
    case_number: 'WP(C) No. 9821/2024',
    case_id: null,
    parties: 'M/s Sai Constructions vs APIIC',
    listing_type: 'admission',
    item_no: 11,
    remarks: 'For admission. Respondent counter not yet filed.',
  },
  {
    id: 'cl-003',
    hearing_date: '2026-05-09',
    court: 'High Court for the State of Telangana',
    bench: "Hon'ble Sri Chief Justice & Hon'ble Sri Justice Sambasivarao Naidu",
    case_number: 'WP(C) No. 7712/2025 (PIL)',
    case_id: 'case-003',
    parties: 'V. Ravinder Reddy vs State of Telangana',
    listing_type: 'compliance_report',
    item_no: 1,
    remarks: 'First quarterly compliance report on road-safety black-spots.',
  },
  {
    id: 'cl-004',
    hearing_date: '2026-05-09',
    court: 'High Court for the State of Telangana',
    bench: "Hon'ble Sri Justice P. Naveen Rao",
    case_number: 'WP(C) No. 12451/2025',
    case_id: null,
    parties: 'K. Mallesh & 12 others vs State of Telangana',
    listing_type: 'final_hearing',
    item_no: 7,
    remarks: 'Pension arrears matter. Final arguments.',
  },
  {
    id: 'cl-005',
    hearing_date: '2026-05-12',
    court: 'High Court for the State of Telangana',
    bench: "Hon'ble Sri Chief Justice & Hon'ble Sri Justice Vinod Kumar",
    case_number: 'WA No. 892/2025',
    case_id: 'case-002',
    parties: 'Special Collector (LA), ORR vs Smt. K. Lakshmi Devi & Ors.',
    listing_type: 'pronouncement',
    item_no: 2,
    remarks: 'Pronouncement on review petition.',
  },
  {
    id: 'cl-006',
    hearing_date: '2026-05-12',
    court: 'High Court for the State of Telangana',
    bench: "Hon'ble Sri Justice Vinod Kumar",
    case_number: 'WP(C) No. 16782/2025',
    case_id: null,
    parties: 'TS Discoms Employees Union vs TGSPDCL',
    listing_type: 'fresh',
    item_no: 23,
    remarks: 'For mention. Stay sought against transfer order.',
  },
]

// =====================================================================
// Notifications — pre-seeded so the bell isn't empty
// =====================================================================
export const SAMPLE_NOTIFICATIONS = [
  {
    id: 'n-001',
    case_id: 'case-001',
    type: 'limitation_warning',
    severity: 'critical',
    message:
      'SLP limitation for WP(C) 4528/2025 expires 19-May-2026. Empowered Committee meeting outcome pending.',
    link: '/case/case-001',
    created_at: '2026-05-06T07:00:00Z',
    read_at: null,
  },
  {
    id: 'n-002',
    case_id: 'case-002',
    type: 'deadline_approaching',
    severity: 'warning',
    message:
      'Action deadline 15-Apr-2026 (LAC meeting on SLP decision) — 8 days remaining for WA 892/2025.',
    link: '/case/case-002',
    created_at: '2026-05-06T07:00:00Z',
    read_at: null,
  },
  {
    id: 'n-003',
    case_id: 'case-003',
    type: 'pending_review',
    severity: 'info',
    message:
      'Road Safety PIL extraction is awaiting first review. Auto-fetched from CIS on 09-Apr-2026.',
    link: '/review',
    created_at: '2026-04-09T08:05:00Z',
    read_at: null,
  },
  {
    id: 'n-004',
    case_id: null,
    type: 'cis_synced',
    severity: 'info',
    message: 'CIS sync completed — 0 new disposals since last check (07-May-2026 06:00).',
    link: '/upload',
    created_at: '2026-05-07T06:00:00Z',
    read_at: '2026-05-07T08:30:00Z',
  },
]

// =====================================================================
// Mock CIS pool — pretend "new" judgments the CIS API can deliver
// =====================================================================
export const MOCK_CIS_POOL = [
  {
    cis_diary_no: 'CIS-2026-HC-TS-WP-21443',
    case_number: 'WP(C) No. 21443/2025',
    title: 'Tender re-bid direction — Mission Bhagiratha pumping station works',
    court: 'High Court for the State of Telangana',
    bench: "Hon'ble Sri Justice K. Lakshman",
    date_of_order: '2026-04-28',
    date_of_filing: '2025-12-03',
    petitioner: 'M/s Aqua Engineering Ltd., Hyderabad',
    respondent: 'State of Telangana, rep. by Principal Secretary, Panchayat Raj & Rural Water Supply Dept.',
    dept_role: 'respondent',
    disposal_status: 'disposed',
    document_type: 'digital',
    summary:
      'Single Judge has set aside the tender award and directed a fresh bidding process to be completed within 45 days, holding that the L1 evaluation methodology was vitiated by a procedural infirmity. State to be guided accordingly.',
    department: 'Panchayat Raj & Rural Water Supply',
    priority: 'high',
    directions: [
      {
        text: 'Conduct fresh bidding within 45 days strictly in compliance with the General Financial Rules.',
        sourceQuote:
          'The respondent is directed to conduct a fresh bidding process for the said works strictly in conformity with the General Financial Rules within a period of forty-five (45) days from the date of receipt of a certified copy of this order.',
        timeline: '45 days',
        timelineType: 'explicit',
        calculatedDeadline: '2026-06-12',
        confidence: 94,
        confidenceReason: 'Operative direction with explicit timeline. Procedural infirmity stated unambiguously.',
        page: 9,
      },
      {
        text: 'Refund earnest money deposit to the petitioner.',
        sourceQuote:
          'The earnest money deposit of Rupees Eighty-Five Lakhs furnished by the petitioner shall stand refunded forthwith.',
        timeline: 'Forthwith',
        timelineType: 'explicit',
        calculatedDeadline: '2026-05-12',
        confidence: 92,
        confidenceReason: 'Clear monetary direction with no ambiguity.',
        page: 9,
      },
    ],
    appealAnalysis: {
      recommendation: 'consider_appeal',
      limitationPeriod: '30 days for Writ Appeal under Letters Patent / 90 days for SLP',
      limitationDeadline: '2026-05-28',
      appealCourt: 'Division Bench of the High Court (Writ Appeal) or Supreme Court (SLP)',
      grounds:
        'L1 evaluation methodology is supportable on multiple administrative-circular precedents. The procedural infirmity flagged is a remediable, not fatal, defect.',
      reasoning:
        'Re-tendering will delay the Mission Bhagiratha works by 3-4 months and may invite arbitration claims from the original L1 bidder. A Writ Appeal preserves position without committing to the SC route.',
      riskIfNoAppeal: 'Project schedule slippage; potential cost overrun of ₹6-8 Cr; political sensitivity in arid mandals.',
    },
    actions: [
      {
        type: 'appeal_consideration',
        natureOfAction: 'legal',
        description: 'Convene departmental review meeting with Advocate-General to take a call on Writ Appeal vs. compliance.',
        department: 'Panchayat Raj & Rural Water Supply',
        responsibleAuthority: 'Principal Secretary, PR&RWS Department',
        deadline: '2026-05-15',
        priority: 'high',
        status: 'pending',
      },
      {
        type: 'compliance',
        natureOfAction: 'administrative',
        description: 'Prepare fresh bid documents incorporating procedural fixes; obtain Finance Department concurrence on revised cost estimate.',
        department: 'Panchayat Raj & Rural Water Supply',
        responsibleAuthority: 'Engineer-in-Chief, PR&RWS',
        deadline: '2026-06-12',
        priority: 'high',
        status: 'pending',
      },
      {
        type: 'compliance',
        natureOfAction: 'financial',
        description: 'Process EMD refund of ₹85 Lakhs to the petitioner through Treasury sanction.',
        department: 'Finance Department',
        responsibleAuthority: 'Treasury Officer, Hyderabad',
        deadline: '2026-05-12',
        priority: 'medium',
        status: 'pending',
      },
    ],
    judgment_pages: [
      {
        page_number: 8,
        text:
          'The grievance of the petitioner is that the second-lowest bidder was awarded the contract notwithstanding that the petitioner was the L1 bidder on the duly published evaluation matrix. On a perusal of the bid evaluation report, this Court finds substance in the contention that an unannounced "weighted experience" criterion was deployed at the final stage, which had the effect of vitiating the otherwise transparent evaluation.',
      },
      {
        page_number: 9,
        text:
          'In the result, the impugned tender award is set aside. The respondent is directed to conduct a fresh bidding process for the said works strictly in conformity with the General Financial Rules within a period of forty-five (45) days from the date of receipt of a certified copy of this order. The earnest money deposit of Rupees Eighty-Five Lakhs furnished by the petitioner shall stand refunded forthwith. The Writ Petition is allowed in the above terms.',
      },
    ],
  },
  {
    cis_diary_no: 'CIS-2026-HC-TS-WP-19002',
    case_number: 'WP(C) No. 19002/2025',
    title: 'TS-bPASS approval timelines — non-compliance by HMDA',
    court: 'High Court for the State of Telangana',
    bench: "Hon'ble Sri Justice T. Vinod Kumar",
    date_of_order: '2026-04-30',
    date_of_filing: '2025-10-19',
    petitioner: 'Sri Naveen Goud, Builder',
    respondent: 'Hyderabad Metropolitan Development Authority',
    dept_role: 'respondent',
    disposal_status: 'disposed',
    document_type: 'scanned',
    summary:
      'Single Judge directs HMDA to dispose the petitioner\'s pending TS-bPASS application within 30 days and to publish a quarterly dashboard of pendency across all categories. Order has system-wide implications for HMDA processes.',
    department: 'Municipal Administration & Urban Development',
    priority: 'medium',
    directions: [
      {
        text: 'Dispose the petitioner\'s TS-bPASS application within 30 days.',
        sourceQuote:
          'The respondent HMDA is directed to dispose of the petitioner\'s application bearing reference number bPASS/HMDA/2024/24891 within a period of thirty (30) days from the date of this order.',
        timeline: '30 days',
        timelineType: 'explicit',
        calculatedDeadline: '2026-05-30',
        confidence: 80,
        confidenceReason: 'Explicit and clear; some OCR uncertainty on the application reference number.',
        page: 7,
      },
      {
        text: 'Publish a quarterly pendency dashboard for all TS-bPASS approval categories.',
        sourceQuote:
          'HMDA shall, on a quarterly basis, publish on its official portal a dashboard reflecting the pendency of applications under each TS-bPASS category, with separate columns for those breaching statutory timelines.',
        timeline: 'Recurring quarterly',
        timelineType: 'explicit',
        calculatedDeadline: '2026-07-30',
        confidence: 78,
        confidenceReason: 'Recurring obligation; first quarterly publication date was inferred from the order date.',
        page: 8,
      },
    ],
    appealAnalysis: {
      recommendation: 'no_appeal',
      limitationPeriod: '30 days for Writ Appeal',
      limitationDeadline: '2026-05-30',
      appealCourt: 'Division Bench of the High Court',
      grounds: 'No substantive grounds; HMDA\'s own service-level commitments support the directions.',
      reasoning: 'Compliance is the recommended path. The transparency dashboard is broadly aligned with State digital-governance commitments.',
      riskIfNoAppeal: 'None of significance; minor implementation effort to publish the dashboard.',
    },
    actions: [
      {
        type: 'compliance',
        natureOfAction: 'administrative',
        description: 'Process the petitioner\'s pending TS-bPASS application end-to-end and communicate decision in writing.',
        department: 'Municipal Administration & Urban Development',
        responsibleAuthority: 'Commissioner, HMDA',
        deadline: '2026-05-30',
        priority: 'medium',
        status: 'pending',
      },
      {
        type: 'compliance',
        natureOfAction: 'regulatory',
        description: 'Build and launch the quarterly pendency dashboard on the HMDA portal; coordinate with IT Department for data feeds.',
        department: 'Municipal Administration & Urban Development',
        responsibleAuthority: 'Director (IT), HMDA',
        deadline: '2026-07-30',
        priority: 'medium',
        status: 'pending',
      },
    ],
    judgment_pages: [
      {
        page_number: 7,
        text:
          'The respondent HMDA is directed to dispose of the petitioner\'s application bearing reference number bPASS/HMDA/2024/24891 within a period of thirty (30) days from the date of this order. While doing so, the authority shall record reasons in writing for any rejection or modification of the originally proposed plan.',
      },
      {
        page_number: 8,
        text:
          'On the larger systemic issue raised by the petitioner regarding pendency: HMDA shall, on a quarterly basis, publish on its official portal a dashboard reflecting the pendency of applications under each TS-bPASS category, with separate columns for those breaching statutory timelines. The first such publication shall be no later than 30.07.2026.',
      },
    ],
  },
]

export function sampleCases() {
  return SAMPLE_CASES
}
export function sampleCauseList() {
  return SAMPLE_CAUSE_LIST
}
export function sampleNotifications() {
  return SAMPLE_NOTIFICATIONS
}
