export function makeCarousel(params) {

	const {destinationData, imagesPaths, imgWidth, imgGap, bgMoveSpeed, timeToBgMove, inertiaStep, inertiaSensivity, expandPath, expandIconWidth, expandIconHeignt, nodeForFullsize, transitionTime, closePath } = params;
	//const fadeBlock = document.querySelector(".fade-block");
	const carousel = document.querySelector(`[data-carousel='${destinationData}']`) ;
	const destinationClass = "carousel_max";

	let carouselHeight = carousel.clientHeight;
	let carouselWidth = carousel.clientWidth;

	const totalImages = imagesPaths.length; 
	let mouseEnterPoint, dxMouse = 0; //mouseX - start amoun X of mouse when button pressed, dxMouse - the difference between mouseX and current mouse X position 
	let dxRibbon = - (imgWidth + imgGap)*2 + (carouselWidth - (imgWidth + imgGap))/2; //offset of Ribbon
	let move = false; //is gallery moving now

	let picsArray = [...imagesPaths]; //the array length=5 for images to show
	picsArray = picsArray.slice(0, 5);

	let basePic = totalImages - 2; //the order of the first picture in picsArray
	const carouselCenter = dxRibbon;

	let inertiaCurrentMouseX; //current mouse x coordinate
	let inertiaPreviousMouseX; //last iteration mouse x coordinate
	let inertiaSpeedX = 0; //speed of moving while inertia, decreasing by *inertiaStep
	let inertiaCounter; //setinterval for declining speed while inertia
	let carouselInertionTimer; //setinterva for calculating mouse speed
	let expandImageShown = false; //is Espand image shown now

	let bgMove; //moving without dragging, speed
	let bgMoveCounter; //setinterval for background movement
	let bgMoveCoundown; //setTimeout for background movement restore

	//creation the carousel html and styles
	carousel.style.maxWidth = "100%";
	carousel.style.height = carouselHeight + "px";
	carousel.style.position = "relative";
	carousel.style.overflow = "hidden";
	carousel.style.whiteSpace = "nowrap";
	carousel.style.userSelect = "none";
	carousel.style.boxSizing = "border-box";
	carousel.style.transition = `${transitionTime}s`;


	carousel.innerHTML = `
        <div className="${destinationClass}-images-container">
            ${picsArray.map(() => {
		return (`
                <div className="${destinationClass}-img-wrapper">
                    <div className="${destinationClass}-img-container">
                        <lottie-player data-role="expand" className="${destinationClass}-expand-icon" autoplay loop mode="normal" src="${expandPath}" ></lottie-player>
                    </div>
                </div>
                `);
	}).join("")}
        </div>
        `;

	const ribbonImages = carousel.querySelector(`.${destinationClass}-images-container`); //The container for all 5 images
	const imgWrapperList = carousel.querySelectorAll(`.${destinationClass}-img-wrapper`); //The list of all 5 containers
	const imgContainerList = carousel.querySelectorAll(`.${destinationClass}-img-container`); //The list of all 5 containers
	const imgExpandIconList = carousel.querySelectorAll(`.${destinationClass}-expand-icon`); //The list of all 5 containers



	/*const sourceNode = document.querySelector(`.${nodeForFullsize}`);
	sourceNode.insertAdjacentHTML("afterbegin", `
        <div className="${destinationClass}-full-screen-wrapper">
            <div className="${destinationClass}-full-screen-image-closer"></div>
            <div className="${destinationClass}-img-wrapper">
                <img className="${destinationClass}-full-screen-image">
            </div>
            <div className="${destinationClass}-description">
                <span className="${destinationClass}-descr-text" href="#"></span>
                <a className="${destinationClass}-link" href="#"></a>
            </div>
        </div>`);
*/
	const imgFullScreenWrapper = document.querySelector(`.${destinationClass}-full-screen-wrapper`); //The container for fullscreen image
	//const imgFullScreenImage = imgFullScreenWrapper.querySelector(`.${destinationClass}-full-screen-image`); //The container for fullscreen image
	//const imgWrapper = imgFullScreenWrapper.querySelector(`.${destinationClass}-img-wrapper`); //The container for fullscreen image
	//const imgFullScreenCloser = imgFullScreenWrapper.querySelector(`.${destinationClass}-full-screen-image-closer`); //The container for fullscreen image
	//const imgDescr = imgFullScreenWrapper.querySelector(`.${destinationClass}-description`); 
	//const imgDescrText = imgFullScreenWrapper.querySelector(`.${destinationClass}-descr-text`); 
	//const imgDescrLink = imgFullScreenWrapper.querySelector(`.${destinationClass}-link`); 



	//styles injection
	ribbonImages.style.cssText = `
        margin: 0;
        padding: 0;
        box-sizing: border-box;
        position: relative;
        width: auto;
        display: inline-block;
        pointer-events: none;
        `;

	imgWrapperList.forEach((el) => {
		el.style.cssText = `
            width: ${imgWidth}px;
            height: ${carouselHeight}px;
            padding: 0;
            padding-left: ${imgGap/2}px; 
            padding-right: ${imgGap/2 }px;
            display: inline-block;
            pointer-events: none;
            position: relative;
        `;
	});
        



	//console.log(imgContainerList); 

	imgContainerList.forEach((el) => {
		el.style.cssText = `
            width: 100%;
            height: ${carouselHeight}px;
            padding: 0;
            box-sizing: border-box;
            display: inline-block;
            background-size: auto 100%;
            background-position: 50% center;
            pointer-events: none;
            overflow: hidden;
            `;
	});


	imgExpandIconList.forEach((el) => {
		el.style.cssText = `
            width: ${expandIconWidth}px;
            height: ${expandIconHeignt}px;
            position: absolute;
            top: 85%;
            left: ${(imgGap - expandIconWidth) / 2}px;
            pointer-events: auto;
            cursor: pointer;
        `;
	});


/*
	function defaultFullScreenStyles() {
		imgFullScreenWrapper.style.cssText = `
            margin: 0;
            padding: 0;
            position: fixed;
            top: ${carouselHeight / 2}px;
            left: 50%;
            width: 0px;
            z-index: 1000;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            transition: ${transitionTime}s;
        `;

		imgFullScreenImage.style.cssText = `
            object-position: 50% 50%
        `;

		imgFullScreenCloser.style.cssText = `
            height: 0;
            width: 0;
            border-radius: 50%;
            position: relarive;
            align-self: flex-end;
            z-index: 2000;
            pointer-events: auto;
            cursor: pointer;
            margin-right: 30px;
            transition: ${transitionTime}s;
            background-image: url("${closePath}");
            background-size: 40% 40%;
            background-position: center center;
            background-repeat: no-repeat;
            background-color: #FFF;
        `;

		imgDescr.style.cssText = `
            top: ${carouselHeight-120}px;
            width: 0;
            height: 0;
            padding: 25px 40px;
            border-radius: 40px;
            margin-right: 30px;
            align-items: center;
            justify-content: center;
            margin-left: auto;
            color: white;
            display: none;
            transition: ${transitionTime}s;
        `;
		//background-color: #777;
		//max-width: 300px;


		imgDescrText.style.cssText = `
            font-family: "GTWalsheimMedium";
            font-size: 24px;
            pointer-events: auto;
            color: #FFF;
            transition: ${transitionTime}s;
        `;


		imgDescrLink.style.cssText = `
            pointer-events: auto;
            color: #FFF;
            transition: ${transitionTime}s;
            font-family: "GTWalsheimMedium";
            font-size: 12px;
        `;


		//carousel.style.opacity = '100%';
		//fadeBlock.classList.remove("fade");
	}
*/
	//defaultFullScreenStyles();






	const changePicsOrder = (direction) => { //change pictures to show in picsArray and show them. Filled from imagesPaths
		if (direction === "+") { //pictures offset when moving left
			(basePic > totalImages -1) ? basePic = 1 : basePic++;
		}
		if (direction === "-") {//pictures offset when moving right
			(basePic < 1) ? basePic = totalImages-1 : basePic--;
		}
        
		for (var index = 0; index < 5; index++) {
			picsArray[index] = (basePic+index < totalImages) ? imagesPaths[index+basePic] : imagesPaths[basePic+index - totalImages];
		}
        

		imgContainerList.forEach((el, index) => {  //change all 5 images to show in imagesList
			el.style.backgroundImage = `url(${picsArray[index][0]}`;
			el.childNodes[1].dataset.path = picsArray[index][0]; //changing path links for expanding images
			el.childNodes[1].dataset.descr = picsArray[index][1]; //changing path links for expanding images
			el.childNodes[1].dataset.link = picsArray[index][2]; //changing path links for expanding images
			//<a class="${destinationClass}-link" href="${imagesPaths[index][2]}">${imagesPaths[index][1]}</a>
		});

	};


	const changeImgOffset = (currentPos) => { //changing offset for all pictures
		imgContainerList.forEach((el, index) => {
			let centerDx = currentPos - carouselCenter - (imgWidth + imgGap)*(2-index); //the offset between central position and current position
			let k = 50 + 50/((carouselWidth + imgWidth) / 2) * centerDx;
			el.style.backgroundPosition = `${k}% center`;
		});
	};


	const redrawCarousel = (dx) => { //changing the position of ribbonImages
		if (dx + dxRibbon > -(imgWidth + imgGap - (carouselWidth-imgWidth -imgGap)/2)) { //if the offset is more than 1 picture width
			dxRibbon = dxRibbon - imgWidth - imgGap; 
			changePicsOrder("-");

		}
		if (dx + dxRibbon < -(imgWidth + imgGap)*3 + (carouselWidth-imgWidth -imgGap)/2  ) { //if the offset is more than 1 picture width
			dxRibbon = dxRibbon + imgWidth + imgGap; 
			changePicsOrder("+");
		}
        
		ribbonImages.style.left = `${dx + dxRibbon}px`; //change ribbon position
		changeImgOffset(dx + dxRibbon); //change images offset


        
	};


/*
	function expandImage(path, descr, link) {

		//imgFullScreenWrapper.style.top = `-15px`;
		imgFullScreenWrapper.style.top = "-10px";
		imgFullScreenWrapper.style.zIndex = "9000";

		imgFullScreenWrapper.style.left = "1vw";
		imgFullScreenWrapper.style.width = "98%";
		imgFullScreenWrapper.style.height = `${carouselHeight + 285}px`;


		imgWrapper.style.width = "100%";
		imgWrapper.style.maxHeight = `${carouselHeight + 285}px`;
		imgWrapper.style.overflow = "hidden";


		imgFullScreenImage.style.width = "100%";
		imgFullScreenImage.style.content = `url(${path})`;
		//imgFullScreenImage.style.objectFit = `cover`;
		imgFullScreenImage.style.objectPosition = "100% 100%";
		imgFullScreenImage.style.height = "auto";


		imgDescr.style.position = "relative";
		imgDescr.style.top = "-100px";
		imgDescr.style.display = "flex";
		imgDescr.style.height = "auto";
		imgDescr.style.width = "90%";
		imgDescr.style.justifyContent = "space-between";
        
		imgDescr.style.marginLeft = "auto";
		imgDescr.style.marginRight = "auto";



		imgDescrText.innerHTML = descr;

		imgDescrLink.innerHTML = "Read More &#8594";
		imgDescrLink.href = link;

		imgFullScreenCloser.style.position = "relative";
		imgFullScreenCloser.style.top = "50px";
		imgFullScreenCloser.style.height = "25px";
		imgFullScreenCloser.style.minHeight = "25px";
		imgFullScreenCloser.style.width = "25px";
		imgFullScreenCloser.style.display = "block";

		//carousel.style.opacity = '50%';
		//fadeBlock.classList.add("fade");
	}
*/


/*
	function closeImage() {
		defaultFullScreenStyles();
		expandImageShown = false;
		setTimeoutToMove();
		imgFullScreenCloser.removeEventListener("click", e => {
			closeImage(e);
		});
	}


	imgFullScreenCloser.addEventListener("click", e => closeImage(e));
*/


	function mouseDownActions(e) {
		if (e.target.dataset.role === "expand") {
			expandImageShown = true;
			//expandImage(e.target.dataset.path,e.target.dataset.descr,e.target.dataset.link);
			clearTimeoutToMove();
		}

		clearInterval(inertiaCounter); //stop the inertia
		//clearTimeout(bgMoveCoundown); //stop the countdown
		bgMove = 0;
		move = true;
		mouseEnterPoint = e.offsetX;
		carousel.classList.add(`${destinationClass}_grabbed`);
	}


	carousel.addEventListener("mousedown", e => mouseDownActions(e));

	function mouseMoveActions(e) {
		if (move) {
			dxMouse = e.offsetX - mouseEnterPoint;
			redrawCarousel(dxMouse);
		}
	}

	carousel.addEventListener("mousemove", e => mouseMoveActions(e));


	function setTimeoutToMove() {
		if (!bgMoveCoundown) {
			bgMoveCoundown = setTimeout(() => {
				//console.log("move again");
				bgMove = bgMoveSpeed;
				bgMovement(bgMove);
				clearTimeoutToMove();
			}, timeToBgMove);
			//console.log("start cndn ",bgMoveCoundown);
		}
	}



	function clearTimeoutToMove() {
		if (bgMoveCoundown) {
			//console.log("delete contdown ", bgMoveCoundown);
			clearTimeout(bgMoveCoundown);
			bgMoveCoundown = undefined;
		}
	}


	function inertiaMovement(dx) {
		clearInterval(inertiaCounter); //fix bug when some timers start simultaniously

		inertiaCounter = setInterval(() => {
			dx = dx * inertiaStep;
			if (Math.abs(dx) <= 1) {
				inertiaSpeedX = 0;
				clearInterval(inertiaCounter);
				setTimeoutToMove();
			} else {
				dxRibbon = dxRibbon - dx/25;
				redrawCarousel(0);
			}
		}, 1);
	}


	function bgMovement(dx) {
		clearInterval(bgMoveCounter);
		bgMoveCounter = setInterval(() => {
			if (bgMove === 0) {
				clearInterval(bgMoveCounter);
			} else {
				dxRibbon = dxRibbon - dx/25;
				redrawCarousel(0);
			}
		}, 1);
	}


	const stopMove = () => { //stop move the carousel
		move = false;
		//restartMoveTimer = true;
		dxRibbon = dxRibbon + dxMouse; //fixing the offset
		dxMouse = 0; 
    
		inertiaSpeedX = inertiaPreviousMouseX - inertiaCurrentMouseX ;
		if (Math.abs(inertiaSpeedX) > inertiaSensivity) { //has an inertion
			inertiaMovement(inertiaSpeedX);
		}
		carousel.classList.remove(`${destinationClass}_grabbed`);

	};



	carousel.addEventListener("mouseup", e => {
		if (!expandImageShown) {
			setTimeoutToMove();
		}
		stopMove(e);
	});


	carousel.addEventListener("mouseout", e => stopMove(e));

	carouselInertionTimer = setInterval(() => { //check mouse speed every 100ms
		inertiaPreviousMouseX = inertiaCurrentMouseX;
		inertiaCurrentMouseX = dxMouse;
	}, 100);

	changePicsOrder(); //initial filling picsArray
	redrawCarousel(0); //initial draw the carousel


	bgMovement(bgMoveSpeed);




	function destroy() {
		carousel.removeEventListener("mousedown", e => mouseDownActions(e));
		carousel.removeEventListener("mousemove", e => mouseMoveActions(e));
		carousel.removeEventListener("mouseup", e => stopMove(e));
		carousel.removeEventListener("mouseout", e => stopMove(e));
		carousel.removeEventListener("mouseout", e => stopMove(e));
		//imgFullScreenCloser.removeEventListener("click", e => closeImage(e));
        
		clearInterval(bgMoveCounter);
		clearInterval(carouselInertionTimer);
		clearInterval(inertiaCounter); 
		clearTimeout(bgMoveCoundown); 

	}

	return destroy;
    
}
