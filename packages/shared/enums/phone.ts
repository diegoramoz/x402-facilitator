export const roles = {
	work: "Work",
	mobile: "Mobile",
	home: "Home",
	assistant: "Assistant",
};

export const phoneRoles = ["work", "mobile", "home", "assistant"] as const;

export type PhoneRole = (typeof phoneRoles)[number];

export const phoneCountryCodes = ["US"] as const;

export type PhoneCountryCode = (typeof phoneCountryCodes)[number];

export const phoneCountryCodesMapping = {
	US: "+1",
} as const;
