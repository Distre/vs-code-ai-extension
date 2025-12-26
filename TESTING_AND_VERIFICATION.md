# Testing and Verification

This document describes all manual tests performed for the
VS Code AI Extension.

The goal is to verify:
- safety
- user control
- predictable behavior
- correct failure handling

All tests were executed manually in a VS Code
**Extension Development Host**.

---

## Test environment

- VS Code: 1.107.1
- OS: Windows 64-bit
- Node.js (via VS Code): 22.x
- Extension mode: Extension Development Host
- AI: Local stub only (no network, no real AI)

---

## Test file used

All tests used the same reference file to ensure consistency.

**File:** `test.ts`

```ts
function add(a: number, b: number): number {
  return a + b;
}

const result = add(2, 3);
console.log(result);
```
---

## TEST 1 – Global AI ON/OFF switch

### Purpose
Verify that AI functionality is fully blocked when disabled.

### Preconditions
- Setting: `VS Code AI › Enable AI` = OFF

### Steps
1. Open a code file
2. Select code
3. Run command:  
   **VS Code AI: Explain selected code**

### Expected result
- Warning message shown
- No consent dialog
- No explanation
- Status: Cancelled
- Log entry indicates AI is disabled

### Result
✅ PASS

---

## TEST 2 – User consent (AI enabled, user says NO)

### Purpose
Verify that the user can cancel after AI is enabled.

### Preconditions
- Setting: `VS Code AI › Enable AI` = ON

### Steps
1. Select code
2. Run **Explain selected code**
3. When prompted, choose **No**

### Expected result
- No explanation generated
- Status: Cancelled
- Log entry indicates user cancellation

### Result
✅ PASS

---

## TEST 3 – Full explanation flow (AI enabled, user says YES)

### Purpose
Verify that the full explanation pipeline works.

### Preconditions
- AI enabled
- Code selected

### Steps
1. Select code
2. Run **Explain selected code**
3. Choose **Yes**

### Expected result
- Status flow: Waiting → Explaining → Completed
- Output panel opens
- Explanation text is shown
- Selected code is echoed
- Log entries show start and completion

### Result
✅ PASS

---

## TEST 4 – Timeout / fail-safe

### Purpose
Verify that long-running explanations are stopped safely.

### Temporary setup
A delay was added inside `LocalExplainerStub.explain()`:

```ts
await new Promise(resolve => setTimeout(resolve, 3000));
```

Timeout limit is 2000 ms.

### Steps
1. Select code
2. Run **Explain selected code**
3. Choose **Yes**

### Expected result
- Timeout warning shown
- Explanation cancelled
- Status: Cancelled
- Log entry indicates timeout
- No output produced

### Result
✅ PASS

### Cleanup
The temporary delay code was removed after the test.

---

## Additional validation – No code selected

### Purpose
Verify safe handling of user error.

### Steps
1. Run **Explain selected code** with no selection

### Expected result
- Warning message shown
- No explanation
- No output panel

### Result
✅ PASS

---

## Conclusion

All critical safety, control, and UX behaviors were verified:

- AI is OFF by default
- User consent is mandatory
- Timeouts are enforced
- No hidden execution
- Errors are handled gracefully
- Behavior is predictable and reversible

The extension is verified and ready for further development.
