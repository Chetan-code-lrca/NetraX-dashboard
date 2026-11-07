import assert from "node:assert/strict";
import test from "node:test";

import {
  MAX_TRAFFIC_UPLOAD_BYTES,
  validateTrafficFile,
} from "../src/services/file-validation.js";

test("accepts supported capture formats case-insensitively", () => {
  for (const name of ["capture.pcap", "capture.PCAPNG", "flows.csv"]) {
    assert.equal(validateTrafficFile({ name, size: 100 }), null);
  }
});

test("rejects unsupported and missing files", () => {
  assert.match(validateTrafficFile(null), /Choose a PCAP/);
  assert.match(validateTrafficFile({ name: "capture.txt", size: 100 }), /Unsupported file type/);
});

test("rejects empty and invalid-size captures", () => {
  assert.match(validateTrafficFile({ name: "empty.pcap", size: 0 }), /empty/);
  assert.match(validateTrafficFile({ name: "bad.pcap", size: Number.NaN }), /invalid size/);
});

test("accepts the backend upload limit and rejects larger files", () => {
  assert.equal(
    validateTrafficFile({ name: "limit.pcap", size: MAX_TRAFFIC_UPLOAD_BYTES }),
    null,
  );
  assert.match(
    validateTrafficFile({ name: "too-large.pcap", size: MAX_TRAFFIC_UPLOAD_BYTES + 1 }),
    /100 MiB/,
  );
});
