const mockScenarios = [
    {
        id: "IC-01",
        title: "Motor collision",
        status: "Pending",
        triggerReason: "Estimate total and extracted total disagree",
        issues: [
            "Extracted repair total is $8,420; source estimate shows $6,420",
            "Rental period was extracted as 14 days; policy limit is 10 days"
        ],
        documents: [
            { id: "doc1", title: "Repair Estimate", content: "SYNTHETIC REPAIR ESTIMATE\n\nVehicle: 2021 Compact SUV\nDate of Loss: 7 Oct 2026\n\nParts: $4,000\nLabor: $2,420\n---------------------\nTOTAL: <span class='highlight'>$6,420</span>" },
            { id: "doc2", title: "Policy Schedule", content: "POLICY: PA-773190\n\nDeductible: $500\nRental Coverage: Maximum <span class='highlight'>10 days</span> per incident." }
        ],
        outputs: [
            { key: "repairTotal", label: "Repair Total ($)", value: "8420", isStale: false },
            { key: "rentalDays", label: "Rental Days", value: "14", isStale: false }
        ],
        rules: [
            { name: "Coverage Limits Check", status: "fail", detail: "Rental days (14) exceed policy limit (10)." }
        ],
        action: {
            destination: "Payment System API",
            payload: { payee: "Maya Chen", amount: "$5,920", deductible: "$500" },
            authorized: false
        }
    },
    {
        id: "IC-02",
        title: "Home water loss",
        status: "Pending",
        triggerReason: "Missing cause-of-loss evidence",
        issues: [
            "Photos show ceiling damage, but plumber report is missing",
            "Contractor estimate contains two rooms; agent extracted only one"
        ],
        documents: [
            { id: "doc1", title: "Contractor Estimate", content: "ROOM 1: Kitchen ceiling repair - $10,000\nROOM 2: <span class='highlight'>Living room floor - $8,760</span>\nTOTAL: $18,760" }
        ],
        outputs: [
            { key: "roomsDamaged", label: "Rooms Damaged", value: "1", isStale: false },
            { key: "causeOfLoss", label: "Cause of Loss", value: "Unverified", isStale: false }
        ],
        rules: [
            { name: "Sudden Pipe Damage Coverage", status: "missing", detail: "Requires licensed plumber cause report." }
        ],
        action: {
            destination: "Reserve System",
            payload: { reserveUpdate: "$18,760", claimId: "CLM-HO-88317" },
            authorized: false
        }
    },
    {
        id: "IC-03",
        title: "Workers' compensation",
        status: "Pending",
        triggerReason: "Causation conflict requiring medical review",
        issues: ["Incident report dates onset to 2 Sep; clinic note mentions symptoms two weeks earlier."],
        documents: [
            { id: "doc1", title: "Medical Record", content: "Patient: Jordan Kim\nNote page 39: Corrected work-status note indicates symptoms began prior to warehouse lifting event." }
        ],
        outputs: [
            { key: "symptomOnset", label: "Symptom Onset Date", value: "2 Sep 2026", isStale: false },
            { key: "causation", label: "Causation Match", value: "Inconclusive", isStale: false }
        ],
        rules: [
            { name: "Medical Necessity & Causation", status: "inconclusive", detail: "Requires Specialist Override." }
        ],
        action: {
            destination: "Benefits System",
            payload: { updatePeriod: "Pending Review" },
            authorized: false
        }
    },
    {
        id: "IC-04",
        title: "Urgent health authorization",
        status: "Urgent",
        triggerReason: "Missing therapy start/end dates (Due in 58m)",
        issues: ["Progress note references physical therapy but does not state duration."],
        documents: [
            { id: "doc1", title: "Progress Notes", content: "Patient: Taylor Morgan\nDiagnosis: Lumbar condition\nRequested Procedure: PX-204\nNote: Patient completed physical therapy. (Dates omitted)" }
        ],
        outputs: [
            { key: "therapyDuration", label: "Therapy Duration (Weeks)", value: "Unknown", isStale: false }
        ],
        rules: [
            { name: "Conservative Treatment Requirement", status: "missing", detail: "Requires exact duration to approve." }
        ],
        action: {
            destination: "Provider Notification",
            payload: { status: "Pending Additional Info" },
            authorized: false
        }
    },
    {
        id: "IC-05",
        title: "Travel baggage",
        status: "Pending",
        triggerReason: "Duplicate receipt fingerprint signal",
        issues: ["Receipt fingerprint resembles prior claim. Agent proposes automatic denial."],
        documents: [
            { id: "doc1", title: "Receipts", content: "Current Claim Receipt:\nDate: 1 Oct 2026\nAmount: €2,180\nTxn ID: <span class='highlight'>TX-99812</span>\n\nPrior Claim Receipt:\nDate: 15 Aug 2026\nAmount: €2,180\nTxn ID: TX-11234" }
        ],
        outputs: [
            { key: "fraudMatch", label: "Duplicate Match Found", value: "Yes", isStale: false },
            { key: "proposedOutcome", label: "Agent Proposal", value: "Automatic Denial", isStale: false }
        ],
        rules: [
            { name: "Fraud Signal Check", status: "fail", detail: "Potential duplicate. Investigation required." }
        ],
        action: {
            destination: "Claims System",
            payload: { outcome: "Deny Claim" },
            authorized: false
        }
    },
    {
        id: "IC-06",
        title: "Catastrophe queue",
        status: "Unassigned",
        triggerReason: "Surge overflow - High Severity",
        issues: ["No eligible coverage specialist on duty for this region."],
        documents: [
            { id: "doc1", title: "Loss Notice", content: "Coastal windstorm damage report.\nPriority: High\nLocation: Zone B" }
        ],
        outputs: [
            { key: "severity", label: "Severity Classification", value: "High", isStale: false }
        ],
        rules: [
            { name: "Assignment Check", status: "fail", detail: "Requires regional specialist." }
        ],
        action: {
            destination: "Queue Manager",
            payload: { assignTo: "Pending" },
            authorized: false
        }
    },
    {
        id: "IC-07",
        title: "Pet reimbursement",
        status: "Execution Uncertain",
        triggerReason: "Payment API Timeout",
        issues: ["Approved v2 for $815 timed out during execution."],
        documents: [
            { id: "doc1", title: "Vet Invoice v2", content: "Patient: Milo\nCorrected charge: $815\nDuplicate line removed." }
        ],
        outputs: [
            { key: "approvedAmount", label: "Approved Reimbursement", value: "815", isStale: false }
        ],
        rules: [
            { name: "Benefit Calculation", status: "pass", detail: "Eligible amount $815." }
        ],
        action: {
            destination: "Payment Gateway",
            payload: { actionId: "PAY-33041-V2", amount: "$815" },
            authorized: true
        }
    },
    {
        id: "IC-08",
        title: "Claim appeal",
        status: "Pending",
        triggerReason: "Appeal package received with new evidence",
        issues: ["Original denial cited wear-and-tear. New engineer report attributes damage to sudden event."],
        documents: [
            { id: "doc1", title: "Engineer Report", content: "Upon inspection, the structural failure was precipitated by a sudden impact event, not gradual wear and tear." }
        ],
        outputs: [
            { key: "appealOutcome", label: "Appeal Decision", value: "Pending", isStale: false }
        ],
        rules: [
            { name: "Exclusion Clause", status: "inconclusive", detail: "Conflict between original assessment and new report." }
        ],
        action: {
            destination: "Notice Generator",
            payload: { result: "Pending" },
            authorized: false
        }
    },
    {
        id: "IC-09",
        title: "Concurrent review",
        status: "Pending",
        triggerReason: "Atomic claim required",
        issues: ["Another user has a stale copy open. User payment authority revoked mid-task."],
        documents: [
            { id: "doc1", title: "Auto Claim", content: "Standard settlement package." }
        ],
        outputs: [
            { key: "settlement", label: "Settlement Amount", value: "4500", isStale: false }
        ],
        rules: [
            { name: "Authority Check", status: "fail", detail: "Payment authority revoked for current user." }
        ],
        action: {
            destination: "Payment System API",
            payload: { amount: "$4,500" },
            authorized: false
        }
    }
];
