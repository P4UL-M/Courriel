import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { AndFilter, Filter, MailFolder, SearchParams } from './db/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatEmailString(
  userEmail: {
    email: string;
    name?: string;
  },
  opts: { includeFullEmail: boolean } = { includeFullEmail: false },
) {
  if (userEmail.name) {
    return `${userEmail.name} ${opts.includeFullEmail ? `<${userEmail.email}>` : ''
      }`;
  }
  return userEmail.email;
}

export function toTitleCase(str: string) {
  return str.replace(/\w\S*/g, function (txt: string) {
    return txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase();
  });
}

export function highlightText(text: string, query: string | undefined) {
  if (!query) return text;
  const parts = text.split(new RegExp(`(${query})`, 'gi'));

  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase() ? (
      <mark key={i} className="bg-gray-200 dark:bg-gray-800 dark:text-gray-200">
        {part}
      </mark>
    ) : (
      part
    )
  );
}

export function flattenAndFilter(filter: AndFilter | Filter): Filter[] {
  if (!('and' in filter)) return [filter];
  const filters: Filter[] = [];
  for (const f of filter.and) {
    if ('and' in f) {
      filters.push(...flattenAndFilter(f));
    } else {
      filters.push(f);
    }
  }
  return filters;
}

export function decomposeFilter(filter: Filter | AndFilter): string {
  if ('and' in filter) {
    // If it's an AndFilter, recursively decompose each sub-filter and join them with "AND"
    return filter.and.map(decomposeFilter).join(' AND ');
  } else {
    // Otherwise, it's a Filter, so process each field in the Filter
    const conditions: string[] = [];

    if (filter.subject) conditions.push(`subject:${filter.subject}`);
    if (filter.sender) conditions.push(`from:${filter.sender}`);
    if (filter.recipient) conditions.push(`to:${filter.recipient}`);
    if (filter.startDate) conditions.push(`startDate:${filter.startDate}`);
    if (filter.endDate) conditions.push(`endDate:${filter.endDate}`);
    if (filter.hasAttachment !== undefined) conditions.push(`hasAttachment:${filter.hasAttachment}`);
    if (filter.folder) conditions.push(`folder:${filter.folder}`);
    if (filter.q) conditions.push(`${filter.q}`);

    // Join all conditions for the current filter with " AND "
    return conditions.join(' AND ');
  }
}

// return a tuple of SearchParams and the string with embedded html tags
export function parseFilter(filter: string): [SearchParams, JSX.Element[]] {
  // Split the filter string by " " (a space means "AND")
  // Use a regular expression to split by spaces, but keep quoted strings together
  const parts = filter.match(/"[^"]+"|[^ ]+/g) || [];

  // Initialize an empty filter object
  const searchParams: SearchParams = {};
  // Initialize an empty string to store the HTML string with embedded tags
  const htmlPart = [];

  // Iterate over each part of the filter
  for (const part of parts) {
    // Split the part by ":" to separate the field name and value
    const [field, value] = part.split(':');
    console.log('part :', field, value);

    // if there is no field, then it's a search query
    if (value === undefined) {
      searchParams.q = part;
      htmlPart.push(<span>{part}</span>);
      continue;
    }
    // Otherwise, set the appropriate field in the filter object
    else if (field === 'subject') searchParams.subject = value;
    else if (field === 'from') searchParams.sender = value;
    else if (field === 'to') searchParams.recipient = value;
    else if (field === 'startDate') searchParams.startDate = value;
    else if (field === 'endDate') searchParams.endDate = value;
    else if (field === 'hasAttachment') searchParams.hasAttachment = value === 'true';
    else if (field === 'folder') {
      // check if the folder is a valid folder
      if (Object.values(MailFolder).includes(value as MailFolder)) {
        searchParams.folder = value as MailFolder;
      }
    }
    // Make a small embedded HTML string for each field with a rounded border for all and bold for field name
    htmlPart.push(<span className="rounded-lg bg-gray-100 px-2 py-1"><b>{field}</b>:{value}</span>);
  }

  // Join all HTML parts with a space
  return [searchParams, htmlPart];
}