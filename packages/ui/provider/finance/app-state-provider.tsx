"use client";

import { FINANCE_METADATA } from "@ramoz/shared/metadata/finance";
import { useLocalStorage } from "@uidotdev/usehooks";
import type { ReactNode } from "react";
import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
} from "react";
import z from "zod/v4";

export const APP_STATE_STORAGE_KEY_PREFIX =
	FINANCE_METADATA.localStorage.APP_STATE_KEY;

const userSchema = z.object({
	nanoId: z.string(),
	email: z.string(),
	role: z.string(),
	name: z.string().nullable(),
});

export type User = z.infer<typeof userSchema>;

export const appStorageSchema = z.object({
	user: userSchema,
	passkeyPromptDismissed: z.boolean(),
});

const persistedAppSchema = z.object({
	passkeyPromptDismissed: z.boolean(),
});

export type AppStorageSchema = typeof appStorageSchema._zod.output;
type PersistedAppSchema = typeof persistedAppSchema._zod.output;

type SetAppValue =
	| AppStorageSchema
	| ((previous: AppStorageSchema) => AppStorageSchema);

type AppStateContext =
	| {
			APP_STATE_STORAGE_KEY_PREFIX: typeof APP_STATE_STORAGE_KEY_PREFIX;
			app: AppStorageSchema;
			setApp: (value: SetAppValue) => void;
	  }
	| undefined;

const AppStateContext = createContext<AppStateContext>(undefined);

const toPersistedApp = (app: AppStorageSchema): PersistedAppSchema => ({
	passkeyPromptDismissed: app.passkeyPromptDismissed,
});

const toAppState = ({
	user,
	persisted,
}: {
	user: User;
	persisted: PersistedAppSchema | null;
}): AppStorageSchema | null => {
	const result = appStorageSchema.safeParse({
		user,
		passkeyPromptDismissed: persisted?.passkeyPromptDismissed ?? false,
	});

	if (result.success === false) {
		return null;
	}

	return result.data;
};

const arePersistedStatesEqual = (
	previous: PersistedAppSchema,
	next: PersistedAppSchema
) => previous.passkeyPromptDismissed === next.passkeyPromptDismissed;

export function AppStateProvider({
	data,
	children,
}: {
	data: { user: User };
	children: ReactNode;
}) {
	const storageKey = useMemo(
		() => `${APP_STATE_STORAGE_KEY_PREFIX}:${data.user.nanoId}`,
		[data.user.nanoId]
	);

	const [persistedApp, setPersistedApp] =
		useLocalStorage<PersistedAppSchema | null>(storageKey, null);

	const app = useMemo(() => {
		const normalized = toAppState({ user: data.user, persisted: persistedApp });

		if (!normalized) {
			console.error("AppStateProvider: No company or branches found");
		}

		return normalized;
	}, [data.user, persistedApp]);

	const setApp = useCallback(
		(value: SetAppValue) => {
			setPersistedApp((previousPersisted) => {
				const previousApp = toAppState({
					user: data.user,
					persisted: previousPersisted,
				});

				if (previousApp === null) {
					return previousPersisted;
				}

				const nextApp =
					typeof value === "function" ? value(previousApp) : value;
				const nextPersisted = toPersistedApp(nextApp);

				const result = persistedAppSchema.safeParse(nextPersisted);

				if (result.success === false) {
					console.error(
						"AppStateProvider: Invalid persisted app state",
						result.error
					);
					return previousPersisted;
				}

				if (
					previousPersisted !== null &&
					arePersistedStatesEqual(previousPersisted, result.data)
				) {
					return previousPersisted;
				}

				return result.data;
			});
		},
		[data.user, setPersistedApp]
	);

	// Sync pre-login state to separate localStorage keys for access before authentication
	useEffect(() => {
		if (!app) {
			return;
		}
	}, [app]);

	if (!app) {
		return null;
	}

	return (
		<AppStateContext.Provider
			value={{ APP_STATE_STORAGE_KEY_PREFIX, app, setApp }}
		>
			{children}
		</AppStateContext.Provider>
	);
}

export function useAppState() {
	const context = useContext(AppStateContext);
	if (!context) {
		throw new Error("useAppState must be used within a AppStateProvider");
	}
	return context;
}
