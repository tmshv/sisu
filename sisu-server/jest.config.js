module.exports = {
	globals: {
		'ts-jest': {
			tsConfigFile: 'tsconfig.json'
		}
	},
	roots: [
		'src',
	],
	collectCoverageFrom: [
		'src/**/*.ts'
	],
	moduleFileExtensions: [
		'ts',
		'js'
	],
	transform: {
		'^.+\\.(ts|tsx)$': 'ts-jest',
	},
	testMatch: [
		'**/*.test.(ts|js)'
	],
	testEnvironment: 'node'
};