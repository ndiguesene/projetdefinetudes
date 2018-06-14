export const Config = {
	BASE_URL: 'http://localhost:9200',
	INDEX: {
		NOM_INDEX_FOR_MAPPING: '.portail',
		TYPE: 'doc'
	},
	NAME_FIELD_OF_MAPPING: {
		CONFIG: 'config',
		VISUALIZATION: 'visualization',
		DASHBOARD: 'dashboard',
		TYPE: 'type',
		USER: 'user',
		VISTATE: 'visState',
		TITLE: 'title',
		// INDEX_PATTERN: 'index-pattern'
	},
	SIZE_MAX_RESULT_QUERY_RETURN: 100,
	AUTHORITY: {
		ADMIN: 'ADMIN',
		USER: 'USER'
	}
};
