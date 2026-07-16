import { useEffect, useMemo, useRef, useState } from 'react';
import { Icon } from '@iconify/react';
import { cn } from '../../lib/cn';

export interface SerializedPost {
  id: string;
  title: string;
  excerpt: string;
  date: string; // ISO
  readingTime: string;
  tags: string[];
  coverUrl: string;
  coverSrcSet: string;
  coverWidth: number;
  coverHeight: number;
  href: string;
}

export interface ExplorerStrings {
  filters: string;
  search: string;
  searchPlaceholder: string;
  tags: string;
  date: string;
  dateAll: string;
  dateWeek: string;
  dateMonth: string;
  dateYear: string;
  clearFilters: string; // "Clear filters"
  clearFiltersWithCount: string; // "Clear filters ({n})"
  clearAll: string;
  galleryView: string;
  listView: string;
  sortLabel: string;
  sortNewest: string;
  sortOldest: string;
  sortShortest: string;
  sortLongest: string;
  empty: string;
  emptyHint: string;
  showOne: string;
  showMany: string; // "Show {n} posts"
  countOne: string;
  countMany: string; // "{n} posts"
  pagination: string;
  previous: string;
  next: string;
  previousPage: string;
  nextPage: string;
  removeFilter: string; // "Remove {label}"
  readSuffix: string;
}

interface Props {
  posts: SerializedPost[];
  allTags: string[];
  /** ISO date string used as "today" — passed in for stable filtering. */
  today: string;
  /** Locale for date formatting, e.g. "en-US" or "zh-CN". */
  locale: string;
  strings: ExplorerStrings;
}

const PER_PAGE = 6;

const DATE_RANGE_VALUES = ['week', 'month', 'year', 'all'] as const;
type DateRange = (typeof DATE_RANGE_VALUES)[number];

const SORT_VALUES = ['newest', 'oldest', 'shortest', 'longest'] as const;
type SortOption = (typeof SORT_VALUES)[number];

function fill(tmpl: string, params: Record<string, string | number>): string {
  return Object.entries(params).reduce((s, [k, v]) => s.replace(`{${k}}`, String(v)), tmpl);
}

function applyFilters({
  posts,
  search,
  tags,
  dateRange,
  sort,
  today,
}: {
  posts: SerializedPost[];
  search: string;
  tags: Set<string>;
  dateRange: DateRange;
  sort: SortOption;
  today: Date;
}) {
  let list = posts;
  const q = search.trim().toLowerCase();
  if (q) {
    list = list.filter(
      (p) => p.title.toLowerCase().includes(q) || p.excerpt.toLowerCase().includes(q),
    );
  }
  if (tags.size > 0) {
    list = list.filter((p) => p.tags.some((t) => tags.has(t)));
  }
  if (dateRange !== 'all') {
    const cutoff = new Date(today);
    if (dateRange === 'week') cutoff.setDate(cutoff.getDate() - 7);
    else if (dateRange === 'month') cutoff.setMonth(cutoff.getMonth() - 1);
    else if (dateRange === 'year') cutoff.setFullYear(cutoff.getFullYear() - 1);
    list = list.filter((p) => new Date(p.date) >= cutoff);
  }
  list = [...list];
  if (sort === 'newest') list.sort((a, b) => +new Date(b.date) - +new Date(a.date));
  else if (sort === 'oldest') list.sort((a, b) => +new Date(a.date) - +new Date(b.date));
  else if (sort === 'shortest')
    list.sort((a, b) => parseInt(a.readingTime, 10) - parseInt(b.readingTime, 10));
  else if (sort === 'longest')
    list.sort((a, b) => parseInt(b.readingTime, 10) - parseInt(a.readingTime, 10));
  return list;
}

export default function PostsExplorer({ posts, allTags, today, locale, strings }: Props) {
  const [search, setSearch] = useState('');
  const [selectedTags, setSelectedTags] = useState<Set<string>>(() => new Set());
  const [dateRange, setDateRange] = useState<DateRange>('all');
  const [viewMode, setViewMode] = useState<'gallery' | 'list'>('gallery');
  const [sort, setSort] = useState<SortOption>('newest');
  const [page, setPage] = useState(1);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    setPage(1);
  }, [search, selectedTags, dateRange, sort]);

  const resultsRef = useRef<HTMLDivElement | null>(null);
  const didMount = useRef(false);
  useEffect(() => {
    if (!didMount.current) {
      didMount.current = true;
      return;
    }
    if (resultsRef.current) {
      const top = resultsRef.current.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  }, [page]);

  useEffect(() => {
    if (!drawerOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setDrawerOpen(false);
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [drawerOpen]);

  const toggleTag = (t: string) =>
    setSelectedTags((prev) => {
      const next = new Set(prev);
      if (next.has(t)) next.delete(t);
      else next.add(t);
      return next;
    });

  const clearFilters = () => {
    setSearch('');
    setSelectedTags(new Set());
    setDateRange('all');
  };

  const activeCount = (search ? 1 : 0) + selectedTags.size + (dateRange !== 'all' ? 1 : 0);

  const todayDate = useMemo(() => new Date(today), [today]);

  const filtered = useMemo(
    () =>
      applyFilters({
        posts,
        search,
        tags: selectedTags,
        dateRange,
        sort,
        today: todayDate,
      }),
    [posts, search, selectedTags, dateRange, sort, todayDate],
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const pageItems = filtered.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);

  const dateRangeLabels: Record<DateRange, string> = {
    week: strings.dateWeek,
    month: strings.dateMonth,
    year: strings.dateYear,
    all: strings.dateAll,
  };
  const sortLabels: Record<SortOption, string> = {
    newest: strings.sortNewest,
    oldest: strings.sortOldest,
    shortest: strings.sortShortest,
    longest: strings.sortLongest,
  };

  const formatPostDate = (iso: string) =>
    new Date(iso).toLocaleDateString(locale, {
      year: 'numeric',
      month: locale.startsWith('zh') ? 'long' : 'short',
      day: 'numeric',
    });

  const panel = (
    <FilterPanel
      search={search}
      setSearch={setSearch}
      selectedTags={selectedTags}
      toggleTag={toggleTag}
      dateRange={dateRange}
      setDateRange={setDateRange}
      onClear={clearFilters}
      activeCount={activeCount}
      allTags={allTags}
      strings={strings}
      dateRangeLabels={dateRangeLabels}
    />
  );

  const countLabel = fill(filtered.length === 1 ? strings.countOne : strings.countMany, {
    n: filtered.length,
  });

  return (
    <div className="lg:grid lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10 xl:grid-cols-[260px_minmax(0,1fr)] xl:gap-14">
      <aside className="hidden lg:block">
        <div className="sticky top-24">{panel}</div>
      </aside>

      <div className="min-w-0">
        <div
          ref={resultsRef}
          className="flex flex-col gap-3 border-border border-b pb-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="inline-flex h-9 items-center gap-2 rounded-md border border-border bg-background px-3 font-medium text-sm transition-colors hover:bg-accent hover:text-accent-foreground lg:hidden"
            >
              <Icon icon="lucide:sliders-horizontal" width={14} height={14} />
              {strings.filters}
              {activeCount > 0 && (
                <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-foreground px-1.5 font-semibold text-[10px] text-background">
                  {activeCount}
                </span>
              )}
            </button>
            <p className="text-muted-foreground text-sm">{countLabel}</p>
          </div>

          <div className="flex items-center gap-2">
            <fieldset
              aria-label={`${strings.galleryView} / ${strings.listView}`}
              className="inline-flex h-9 items-center rounded-md border border-border bg-background p-0.5"
            >
              <ViewButton
                active={viewMode === 'gallery'}
                onClick={() => setViewMode('gallery')}
                label={strings.galleryView}
              >
                <Icon icon="lucide:layout-grid" width={15} height={15} />
              </ViewButton>
              <ViewButton
                active={viewMode === 'list'}
                onClick={() => setViewMode('list')}
                label={strings.listView}
              >
                <Icon icon="lucide:list" width={15} height={15} />
              </ViewButton>
            </fieldset>

            <div className="relative">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortOption)}
                aria-label={strings.sortLabel}
                className="h-9 appearance-none rounded-md border border-border bg-background pr-8 pl-3 font-medium text-sm transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {SORT_VALUES.map((s) => (
                  <option key={s} value={s}>
                    {sortLabels[s]}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 text-muted-foreground">
                <Icon icon="lucide:chevrons-up-down" width={13} height={13} />
              </span>
            </div>
          </div>
        </div>

        {activeCount > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-1.5">
            {search && (
              <FilterPill
                label={`"${search}"`}
                removeLabelTemplate={strings.removeFilter}
                onRemove={() => setSearch('')}
              />
            )}
            {[...selectedTags].map((t) => (
              <FilterPill
                key={t}
                label={`#${t}`}
                removeLabelTemplate={strings.removeFilter}
                onRemove={() => toggleTag(t)}
              />
            ))}
            {dateRange !== 'all' && (
              <FilterPill
                label={dateRangeLabels[dateRange]}
                removeLabelTemplate={strings.removeFilter}
                onRemove={() => setDateRange('all')}
              />
            )}
            <button
              type="button"
              onClick={clearFilters}
              className="ml-1 text-muted-foreground text-xs underline-offset-4 hover:text-foreground hover:underline"
            >
              {strings.clearAll}
            </button>
          </div>
        )}

        <div className="mt-8">
          {pageItems.length === 0 ? (
            <div className="rounded-lg border border-border border-dashed py-20 text-center">
              <Icon
                icon="lucide:file-search"
                width={22}
                height={22}
                className="mx-auto text-muted-foreground"
              />
              <p className="mt-3 font-medium text-sm">{strings.empty}</p>
              <p className="mt-1 text-muted-foreground text-xs">{strings.emptyHint}</p>
              {activeCount > 0 && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-5 inline-flex h-8 items-center justify-center rounded-md border border-border bg-background px-3 font-medium text-xs transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  {strings.clearFilters}
                </button>
              )}
            </div>
          ) : viewMode === 'gallery' ? (
            <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 xl:grid-cols-3">
              {pageItems.map((p) => (
                <GalleryCard
                  key={p.id}
                  post={p}
                  formatDate={formatPostDate}
                  readSuffix={strings.readSuffix}
                />
              ))}
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {pageItems.map((p) => (
                <li key={p.id}>
                  <ListRow post={p} formatDate={formatPostDate} readSuffix={strings.readSuffix} />
                </li>
              ))}
            </ul>
          )}
        </div>

        <Pagination page={safePage} totalPages={totalPages} onChange={setPage} strings={strings} />
      </div>

      <FilterDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={strings.filters}
        closeLabel={strings.filters}
      >
        {panel}
        <div className="mt-8 flex gap-2">
          <button
            type="button"
            onClick={() => setDrawerOpen(false)}
            className="inline-flex h-9 flex-1 items-center justify-center rounded-md bg-primary px-4 font-medium text-primary-foreground text-sm transition-colors hover:bg-primary/90"
          >
            {fill(filtered.length === 1 ? strings.showOne : strings.showMany, {
              n: filtered.length,
            })}
          </button>
        </div>
      </FilterDrawer>
    </div>
  );
}

function FilterPanel({
  search,
  setSearch,
  selectedTags,
  toggleTag,
  dateRange,
  setDateRange,
  onClear,
  activeCount,
  allTags,
  strings,
  dateRangeLabels,
}: {
  search: string;
  setSearch: (s: string) => void;
  selectedTags: Set<string>;
  toggleTag: (t: string) => void;
  dateRange: DateRange;
  setDateRange: (d: DateRange) => void;
  onClear: () => void;
  activeCount: number;
  allTags: string[];
  strings: ExplorerStrings;
  dateRangeLabels: Record<DateRange, string>;
}) {
  return (
    <div className="space-y-7">
      <div>
        <label
          htmlFor="post-search"
          className="font-medium text-muted-foreground text-xs uppercase tracking-wider"
        >
          {strings.search}
        </label>
        <div className="relative mt-2">
          <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground">
            <Icon icon="lucide:search" width={14} height={14} />
          </span>
          <input
            id="post-search"
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={strings.searchPlaceholder}
            className="h-9 w-full rounded-md border border-input bg-background pr-3 pl-9 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background"
          />
        </div>
      </div>

      <div>
        <p className="font-medium text-muted-foreground text-xs uppercase tracking-wider">
          {strings.tags}
        </p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {allTags.map((t) => {
            const active = selectedTags.has(t);
            return (
              <button
                key={t}
                type="button"
                onClick={() => toggleTag(t)}
                aria-pressed={active}
                className={cn(
                  'inline-flex h-7 items-center gap-1 rounded-full border px-2.5 font-medium text-xs transition-colors',
                  active
                    ? 'border-transparent bg-foreground text-background'
                    : 'border-border bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                )}
              >
                {active && <Icon icon="lucide:check" width={11} height={11} />}
                <span>{t}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <p className="font-medium text-muted-foreground text-xs uppercase tracking-wider">
          {strings.date}
        </p>
        <div className="mt-3 flex flex-col">
          {DATE_RANGE_VALUES.map((value) => {
            const active = dateRange === value;
            return (
              <label
                key={value}
                className="flex cursor-pointer items-center gap-2.5 rounded-md py-1.5 text-foreground/90 text-sm transition-colors hover:text-foreground"
              >
                <span
                  className={cn(
                    'relative inline-flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border transition-colors',
                    active ? 'border-foreground bg-background' : 'border-border bg-background',
                  )}
                >
                  {active && <span className="block h-1.5 w-1.5 rounded-full bg-foreground" />}
                </span>
                <input
                  type="radio"
                  name="date-range"
                  className="sr-only"
                  checked={active}
                  onChange={() => setDateRange(value)}
                />
                <span>{dateRangeLabels[value]}</span>
              </label>
            );
          })}
        </div>
      </div>

      <div className="pt-2">
        <button
          type="button"
          onClick={onClear}
          disabled={activeCount === 0}
          className="inline-flex h-8 w-full items-center justify-center gap-2 rounded-md border border-border bg-background px-3 font-medium text-xs transition-colors hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50"
        >
          <Icon icon="lucide:x" width={13} height={13} />
          {activeCount > 0
            ? fill(strings.clearFiltersWithCount, { n: activeCount })
            : strings.clearFilters}
        </button>
      </div>
    </div>
  );
}

function FilterDrawer({
  open,
  onClose,
  title,
  closeLabel,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  closeLabel: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        'fixed inset-0 z-60 lg:hidden',
        open ? 'pointer-events-auto' : 'pointer-events-none',
      )}
      aria-hidden={!open}
    >
      <button
        type="button"
        onClick={onClose}
        aria-hidden="true"
        tabIndex={-1}
        className={cn(
          'absolute inset-0 bg-foreground/30 backdrop-blur-sm transition-opacity duration-200',
          open ? 'opacity-100' : 'opacity-0',
        )}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          'absolute top-0 right-0 flex h-full w-[88%] max-w-sm flex-col border-border border-l bg-background shadow-xl transition-transform duration-300 ease-out',
          open ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        <div className="flex items-center justify-between border-border border-b px-5 py-4">
          <h2 className="font-semibold text-sm tracking-tight">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={closeLabel}
            className="inline-flex h-10 w-10 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            <Icon icon="lucide:x" width={18} height={18} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-5">{children}</div>
      </aside>
    </div>
  );
}

function GalleryCard({
  post,
  formatDate,
  readSuffix,
}: {
  post: SerializedPost;
  formatDate: (iso: string) => string;
  readSuffix: string;
}) {
  return (
    <a href={post.href} className="group block focus-visible:outline-none">
      <article className="flex h-full flex-col">
        <div className="relative aspect-16/10 w-full overflow-hidden rounded-lg border border-border bg-muted">
          <img
            src={post.coverUrl}
            srcSet={post.coverSrcSet}
            sizes="(min-width: 1280px) 25vw, (min-width: 640px) 50vw, 100vw"
            width={post.coverWidth}
            height={post.coverHeight}
            alt=""
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-500 ease-out lg:group-hover:scale-105"
          />
        </div>
        <div className="mt-4 flex flex-1 flex-col">
          <h3 className="font-semibold text-base text-foreground tracking-tight">{post.title}</h3>
          <p
            className="mt-2 text-muted-foreground text-sm leading-relaxed"
            style={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {post.excerpt}
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-muted-foreground text-xs">
            <time dateTime={post.date}>{formatDate(post.date)}</time>
            <span aria-hidden="true">·</span>
            <span>
              {post.readingTime} {readSuffix}
            </span>
            <span aria-hidden="true">·</span>
            <span className="flex flex-wrap gap-1.5">
              {post.tags.map((t) => (
                <span key={t} className="text-foreground/80">
                  #{t}
                </span>
              ))}
            </span>
          </div>
        </div>
      </article>
    </a>
  );
}

function ListRow({
  post,
  formatDate,
  readSuffix,
}: {
  post: SerializedPost;
  formatDate: (iso: string) => string;
  readSuffix: string;
}) {
  return (
    <a href={post.href} className="group block py-8 transition-colors sm:py-10 lg:py-12">
      <article className="flex items-center gap-5 sm:gap-7 lg:gap-10">
        <div className="relative aspect-4/3 w-24 shrink-0 overflow-hidden rounded-md border border-border bg-muted sm:aspect-16/10 sm:w-44 lg:w-56">
          <img
            src={post.coverUrl}
            srcSet={post.coverSrcSet}
            sizes="(min-width: 1024px) 224px, (min-width: 640px) 176px, 96px"
            width={post.coverWidth}
            height={post.coverHeight}
            alt=""
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-500 ease-out lg:group-hover:scale-105"
          />
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
          <h3 className="font-semibold text-base text-foreground leading-snug tracking-tight sm:text-xl lg:text-2xl">
            {post.title}
          </h3>
          <p
            className="mt-2 text-muted-foreground text-sm leading-relaxed sm:mt-3 sm:text-base"
            style={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {post.excerpt}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-muted-foreground text-xs sm:mt-5 sm:text-sm">
            <time dateTime={post.date}>{formatDate(post.date)}</time>
            <span aria-hidden="true">·</span>
            <span>
              {post.readingTime} {readSuffix}
            </span>
            <span aria-hidden="true" className="hidden sm:inline">
              ·
            </span>
            <span className="hidden flex-wrap gap-1.5 sm:flex">
              {post.tags.map((t) => (
                <span key={t} className="text-foreground/80">
                  #{t}
                </span>
              ))}
            </span>
          </div>
        </div>
      </article>
    </a>
  );
}

function Pagination({
  page,
  totalPages,
  onChange,
  strings,
}: {
  page: number;
  totalPages: number;
  onChange: (p: number) => void;
  strings: ExplorerStrings;
}) {
  if (totalPages <= 1) return null;

  const pages: Array<number | '…'> = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 3) pages.push('…');
    const start = Math.max(2, page - 1);
    const end = Math.min(totalPages - 1, page + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (page < totalPages - 2) pages.push('…');
    pages.push(totalPages);
  }

  const btn =
    'inline-flex h-9 min-w-9 items-center justify-center gap-1 rounded-md border border-border bg-background px-3 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50';
  const active =
    'inline-flex h-9 min-w-9 items-center justify-center rounded-md border border-transparent bg-foreground px-3 text-sm font-medium text-background';

  return (
    <nav aria-label={strings.pagination} className="mt-12 flex items-center justify-center gap-1.5">
      <button
        type="button"
        onClick={() => onChange(Math.max(1, page - 1))}
        disabled={page === 1}
        className={btn}
        aria-label={strings.previousPage}
      >
        <Icon icon="lucide:chevron-left" width={15} height={15} />
        <span className="hidden sm:inline">{strings.previous}</span>
      </button>
      {pages.map((p, i) =>
        p === '…' ? (
          <span
            key={`e${i}`}
            aria-hidden="true"
            className="inline-flex h-9 w-9 items-center justify-center text-muted-foreground text-sm"
          >
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => onChange(p)}
            aria-current={p === page ? 'page' : undefined}
            className={p === page ? active : btn}
          >
            {p}
          </button>
        ),
      )}
      <button
        type="button"
        onClick={() => onChange(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        className={btn}
        aria-label={strings.nextPage}
      >
        <span className="hidden sm:inline">{strings.next}</span>
        <Icon icon="lucide:chevron-right" width={15} height={15} />
      </button>
    </nav>
  );
}

function FilterPill({
  label,
  removeLabelTemplate,
  onRemove,
}: {
  label: string;
  removeLabelTemplate: string;
  onRemove: () => void;
}) {
  return (
    <span className="inline-flex h-6 items-center gap-1 rounded-full bg-secondary pr-1 pl-2.5 text-secondary-foreground text-xs">
      {label}
      <button
        type="button"
        onClick={onRemove}
        aria-label={fill(removeLabelTemplate, { label })}
        className="inline-flex h-4 w-4 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-foreground/10 hover:text-foreground"
      >
        <Icon icon="lucide:x" width={11} height={11} />
      </button>
    </span>
  );
}

function ViewButton({
  active,
  onClick,
  label,
  children,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-label={label}
      title={label}
      className={cn(
        'inline-flex h-8 w-8 items-center justify-center rounded transition-colors',
        active
          ? 'bg-secondary text-secondary-foreground'
          : 'text-muted-foreground hover:text-foreground',
      )}
    >
      {children}
    </button>
  );
}
