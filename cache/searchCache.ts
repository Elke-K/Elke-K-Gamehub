import { GamesApi } from "../types";

type SearchCacheEntry = {
	value: GamesApi;
	expiresAt: number;
};

const SEARCH_TTL = 1000 * 60 * 10;
const MAX_SEARCH_CACHE_SIZE = 100;

const searchCache = new Map<string, SearchCacheEntry>();
const inFlightSearchRequests = new Map<string, Promise<GamesApi>>();

function normalizeQuery(query: string): string {
	return query.trim().toLowerCase();
}

function evictOldestIfNeeded() {
	if (searchCache.size < MAX_SEARCH_CACHE_SIZE) return;

	const oldestKey = searchCache.keys().next().value;
	if (oldestKey) {
		searchCache.delete(oldestKey);
	}
}

export function getCachedSearch(query: string): GamesApi | undefined {
	const key = normalizeQuery(query);
	const entry = searchCache.get(key);

	if (!entry) return undefined;
	if (Date.now() >= entry.expiresAt) {
		searchCache.delete(key);
		return undefined;
	}

	return entry.value;
}

export function setCachedSearch(query: string, value: GamesApi) {
	const key = normalizeQuery(query);
	evictOldestIfNeeded();
	searchCache.set(key, {
		value,
		expiresAt: Date.now() + SEARCH_TTL,
	});
}

export async function getOrLoadSearch(
	query: string,
	loader: () => Promise<GamesApi>,
): Promise<GamesApi> {
	const cached = getCachedSearch(query);
	if (cached) return cached;

	const key = normalizeQuery(query);
	const existing = inFlightSearchRequests.get(key);
	if (existing) return existing;

	const pending = loader()
		.then((result) => {
			setCachedSearch(query, result);
			return result;
		})
		.finally(() => {
			inFlightSearchRequests.delete(key);
		});

	inFlightSearchRequests.set(key, pending);
	return pending;
}