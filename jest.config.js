/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
	preset: 'ts-jest',
	testEnvironment: './FixJSDOMEnvironment.ts',
	globals: {
		"IS_REACT_ACT_ENVIRONMENT": true
	},
	transform: {
		"^.+\\.(js|jsx|ts|tsx)$": "babel-jest"
	},
	testRegex: "(/__tests__/.*|(\\.|/)(test|spec))\\.(jsx?|tsx?)$",
	transformIgnorePatterns: [
		"/node_modules/",
		"^.+\\.s?css$" // Ignore SCSS files
	],
	moduleNameMapper: {
		"\\.(scss|sass|css)$": "identity-obj-proxy",
		"\\.(svg|jpg|jpeg|png|gif|webp)$": "<rootDir>/svgMock.js" // Provide the correct path to the mock file
	},
	verbose: true,
    testURL: "http://localhost/",
	setupFiles: ["<rootDir>/setEnvVars.js"],
	
};


