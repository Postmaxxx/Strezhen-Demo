import { createRoot } from 'react-dom/client';
import { Suspense } from "react";
import { Provider } from 'react-redux';
import store from './redux/store';
import Preloader from './components/Preloaders/Preloader';
import * as sw from './serviceWorkerRegistration';
import React from "react";
import App from './App';


const root = createRoot(document.getElementById("root") as HTMLElement);

root.render(
	<React.StrictMode>
		<Provider store={store}>
			<Suspense fallback={<Preloader />}>
				<App />
			</Suspense>
		</Provider>
	</React.StrictMode>
);



sw.register() //registring sw, change scope if url changed

