// HyperUI component patterns — https://www.hyperui.dev/

export const card =
  'rounded-xl border-2 border-gray-100 bg-white p-6 sm:p-8';

export const btnPrimary =
  'inline-flex w-full items-center justify-center rounded-full border border-indigo-600 bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 focus-visible:ring-4 focus-visible:ring-indigo-200 focus-visible:outline-none sm:w-auto';

export const btnSecondary =
  'inline-flex w-full items-center justify-center rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:border-slate-400 hover:bg-slate-50 hover:text-slate-900 focus-visible:ring-4 focus-visible:ring-slate-200 focus-visible:outline-none';

export const btnYes =
  'inline-flex w-full items-center justify-center rounded-full border border-indigo-600 bg-indigo-600 px-6 py-4 text-base font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 focus-visible:ring-4 focus-visible:ring-indigo-200 focus-visible:outline-none';

export const btnNo =
  'inline-flex w-full items-center justify-center rounded-full border border-slate-300 bg-white px-6 py-4 text-base font-semibold text-slate-700 shadow-sm transition-colors hover:border-slate-400 hover:bg-slate-50 hover:text-slate-900 focus-visible:ring-4 focus-visible:ring-slate-200 focus-visible:outline-none';

export const btnQuiet =
  'inline-flex w-full items-center justify-center rounded-full px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-4 focus-visible:ring-slate-200 focus-visible:outline-none';

export const badge =
  'rounded-full bg-indigo-100 px-2.5 py-0.5 text-sm font-semibold whitespace-nowrap text-indigo-700';

export const btnFlag =
  'inline-flex items-center justify-center rounded-full border border-amber-400 bg-white px-4 py-2 text-sm font-semibold text-amber-700 shadow-sm transition-colors hover:border-amber-500 hover:bg-amber-50 hover:text-amber-800 focus-visible:ring-4 focus-visible:ring-amber-200 focus-visible:outline-none';

export const btnFlagActive =
  'inline-flex items-center justify-center rounded-full border border-green-500 bg-green-50 px-4 py-2 text-sm font-semibold text-green-700 shadow-sm transition-colors hover:bg-green-100 focus-visible:ring-4 focus-visible:ring-green-200 focus-visible:outline-none';

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function progressBarHtml(current: number, total: number): string {
  const percent = total > 0 ? Math.round((current / total) * 100) : 0;

  return `
    <div role="progressbar" aria-valuenow="${current}" aria-valuemin="0" aria-valuemax="${total}">
      <div class="flex justify-between gap-4">
        <span class="text-sm font-medium text-gray-900">Progress</span>
        <span class="text-sm font-medium text-gray-900">${current} / ${total}</span>
      </div>
      <div class="mt-2 h-2 w-full rounded-full bg-gray-200">
        <div class="h-full rounded-full bg-indigo-600 transition-all duration-300" style="width: ${percent}%"></div>
      </div>
    </div>
  `;
}

export function resultsHtml(
  estimate: number,
  low: number,
  high: number,
  level: string,
  cefr: string,
  feedback: string,
  knownCount: number,
  totalCount: number,
  sourceSize: number,
  sourceName: string,
  coveragePercent: number
): string {
  const formatted = estimate.toLocaleString('en-US');
  const formattedLow = low.toLocaleString('en-US');
  const formattedHigh = high.toLocaleString('en-US');
  const formattedSource = sourceSize.toLocaleString('en-US');
  const safeLevel = escapeHtml(level);
  const safeCefr = escapeHtml(cefr);
  const safeFeedback = escapeHtml(feedback);
  const safeSourceName = escapeHtml(sourceName);

  return `
    <div class="text-center">
      <p class="text-xs font-medium tracking-wide text-gray-700 uppercase">Estimated lemmas known</p>
      <p class="mt-1 text-sm text-gray-600">from <em>${safeSourceName}</em></p>
      <p class="mt-2 text-5xl font-bold text-gray-900 sm:text-6xl">${formatted}</p>
      <p class="mt-1 text-sm text-gray-500">of ${formattedSource} lemmas (±10%)</p>
      <p class="mt-1 text-xs text-gray-400">${formattedLow} – ${formattedHigh}</p>
      <p class="mt-2 text-xs text-gray-500">~${coveragePercent}% coverage of this word list</p>

      <div class="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-left text-sm text-amber-950 leading-relaxed">
        <p class="font-semibold">This is not your total Spanish vocabulary.</p>
        <p class="mt-2">
          We sampled ${totalCount} words across frequency bands from a list of
          ${formattedSource} lemmas drawn from <em>${safeSourceName}</em>.
          The number above is our best guess for how many lemmas from that
          <strong>entire list</strong> you know — based on ${knownCount} yes
          answers out of ${totalCount} tested.
        </p>
        <p class="mt-2 text-xs text-amber-900/80">
          Your real vocabulary is likely larger and includes words outside this
          corpus (other topics, regions, and registers).
        </p>
      </div>

      <div class="mt-6 flex items-center justify-center gap-2">
        <span class="${badge}">${safeCefr}</span>
        <span class="rounded-full border border-indigo-500 px-2.5 py-0.5 text-sm font-semibold whitespace-nowrap text-indigo-700">${safeLevel}</span>
      </div>
      <p class="mt-3 text-xs text-gray-500">${safeCefr} band is based on ~${coveragePercent}% list coverage — not an official CEFR exam score.</p>
      <p class="mt-4 text-left text-sm text-gray-700 leading-relaxed">${safeFeedback}</p>
    </div>
  `;
}