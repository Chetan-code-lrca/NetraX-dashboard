export const MAX_TRAFFIC_UPLOAD_BYTES = 100 * 1024 * 1024;

const SUPPORTED_EXTENSIONS = new Set([".pcap", ".pcapng", ".csv"]);

export function validateTrafficFile(file) {
  if (!file || typeof file.name !== "string") {
    return "Choose a PCAP, PCAPNG, or CSV capture file.";
  }

  const extension = file.name.toLowerCase().slice(file.name.lastIndexOf("."));
  if (!SUPPORTED_EXTENSIONS.has(extension)) {
    return "Unsupported file type. Choose a PCAP, PCAPNG, or CSV capture.";
  }

  if (!Number.isFinite(file.size) || file.size <= 0) {
    return "The selected capture file is empty or has an invalid size.";
  }

  if (file.size > MAX_TRAFFIC_UPLOAD_BYTES) {
    return "Capture files must be 100 MiB or smaller.";
  }

  return null;
}
