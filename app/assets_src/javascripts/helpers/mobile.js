
window.isMobile = false;

if (window.matchMedia && window.matchMedia("(max-device-width: 480px)").matches) {
	window.isMobile = true;
}