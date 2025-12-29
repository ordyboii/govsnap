/**
 * Sanitizes a URL path for use as a filename
 * Examples:
 *   /apply/name -> apply-name
 *   /check-your-answers -> check-your-answers
 *   / -> index
 *   /apply/personal-details?ref=123 -> apply-personal-details
 */
export function sanitizeUrlForFilename(url: string): string {
  try {
    const urlObj = new URL(url);
    let pathname = urlObj.pathname;

    // Remove leading and trailing slashes
    pathname = pathname.replace(/^\/+|\/+$/g, '');

    // If empty (root path), use 'index'
    if (!pathname) {
      return 'index';
    }

    // Replace slashes with hyphens
    let sanitized = pathname.replace(/\//g, '-');

    // Remove any characters that aren't alphanumeric, hyphens, or underscores
    sanitized = sanitized.replace(/[^a-zA-Z0-9\-_]/g, '');

    // Replace multiple consecutive hyphens with single hyphen
    sanitized = sanitized.replace(/-+/g, '-');

    // Remove leading/trailing hyphens
    sanitized = sanitized.replace(/^-+|-+$/g, '');

    // Limit length to 50 characters
    if (sanitized.length > 50) {
      sanitized = sanitized.substring(0, 50);
      sanitized = sanitized.replace(/-+$/, '');
    }

    return sanitized || 'page';
  } catch {
    return 'unknown-page';
  }
}

/**
 * Generates a timestamp string for filenames
 * Format: YYYYMMDD-HHMMSS
 */
export function generateTimestamp(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');

  return `${year}${month}${day}-${hours}${minutes}${seconds}`;
}

/**
 * Generates a full filename for a screenshot
 * Pattern: [Sequence_No]__[Sanitized_URL_Slug]__[Timestamp].png
 * Example: 04__check-your-answers__20231027-143052.png
 */
export function generateScreenshotFilename(
  url: string,
  sequenceNo: number
): string {
  const sanitizedSlug = sanitizeUrlForFilename(url);
  const timestamp = generateTimestamp();
  const paddedSequence = sequenceNo.toString().padStart(2, '0');

  return `${paddedSequence}__${sanitizedSlug}__${timestamp}.png`;
}

/**
 * Generates a timestamped directory name for a project
 * Format: project-name_YYYYMMDD-HHMMSS
 */
export function generateProjectDirectoryName(projectName: string): string {
  const sanitizedName = projectName
    .replace(/[^a-zA-Z0-9\-_\s]/g, '')
    .replace(/\s+/g, '-')
    .toLowerCase();

  const timestamp = generateTimestamp();
  return `${sanitizedName}_${timestamp}`;
}
