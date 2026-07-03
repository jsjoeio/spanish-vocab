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
  level: string,
  feedback: string,
  knownCount: number,
  totalCount: number
): string {
  const formatted = estimate.toLocaleString('en-US');

  return `
    <div class="text-center">
      <p class="text-xs font-medium tracking-wide text-gray-700 uppercase">Estimated vocabulary</p>
      <p class="mt-2 text-5xl font-bold text-gray-900 sm:text-6xl">${formatted}</p>
      <p class="mt-1 text-lg text-gray-500">words</p>
      <div class="mt-6">
        <span class="${badge}">${level}</span>
      </div>
      <p class="mt-6 text-left text-sm text-gray-700 leading-relaxed">${feedback}</p>
      <p class="mt-4 text-xs text-gray-500">
        You marked ${knownCount} of ${totalCount} words as known.
      </p>
    </div>
  `;
}