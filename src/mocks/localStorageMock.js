const localStorageMock = () => {
	var store = {};
	return {
		getItem: (key) => {
			return store[key] || null;
		},
		setItem: (key, value) => {
			store[key] = value.toString();
		},
		clear: function() {
			store = {};
		},
		removeItem: function(key) {
			delete store[key];
		},
		length: 0,
		key: (smth) => 'smth'

	};
}
export { localStorageMock }

//Object.defineProperty(window, 'localStorage', { value: localStorageMock });
  
  
  
  