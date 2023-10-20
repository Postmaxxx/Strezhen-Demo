export function register() {
	if ("serviceWorker" in navigator) {
		const publicUrl: URL = new URL(process.env.PUBLIC_URL, window.location.href);
		if (publicUrl.origin !== window.location.origin) return

		window.addEventListener("load", () => {
			let swUrl: string = `sw.js`;
			if (process.env.NODE_ENV === "development") {
				swUrl = "sw.js";
			}
			registerValidSW(swUrl);
		});
	}
}



async function registerValidSW(swUrl: string) {
	try {
		const regSW: ServiceWorkerRegistration = await navigator.serviceWorker.register(swUrl, {
			scope: process.env.NODE_ENV === "development" ? '/' : '/', //change if url changed
			//updateViaCache: 'none' 
		}); 
		regSW.update(); //update if changed
		console.log("ServiceWorker registered successfully", regSW);
		navigator.serviceWorker.oncontrollerchange = (ev) => { //New ServiceWorker activated
			window.location.reload();
		};
	} catch (error) {
		console.log("ServiceWorker register fail:", error);
	}
}



export function unregister() {
	if ("serviceWorker" in navigator) {
		navigator.serviceWorker.ready
			.then((registration) => {
				registration.unregister();
			})
			.catch((error) => {
				console.error('Unable to unregister service-worker: ', error.message);
			});
	}
}
