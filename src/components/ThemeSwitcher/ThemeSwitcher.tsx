import { useEffect, useRef,useMemo } from "react";
import { connect } from "react-redux";
import { AnyAction, Dispatch, bindActionCreators } from "redux";
import cloud from "./theme_day__cloud.svg";
import star from "./theme_nigth__star.svg";
import "./theme-switcher.scss";
import { IFullState, TLang } from "../../interfaces";
import { useScrollHider } from "../../hooks/scrollHider";
import { allActions } from "../../redux/actions/all";
import React from 'react'


type TTheme = 'dark' | 'light'

type ICloud = {
    width: number
    gap: number
    top: number
    speed: number
    opacity: number
}

interface IPropsState {
    lang: TLang
	mobOpened: boolean
	theme: TTheme
}

interface IPropsActions {
    setState: {
        base: typeof allActions.base
    }
}

interface IProps extends IPropsState, IPropsActions {}


interface IParams {
	width: number
	height: number
	circleSize: number
	duration: number
	numberOfStars: number
	clouds: ICloud[]
	isChanging: boolean
	saveState: string
	typesOfBlink: number
}

const ThemeSwitcher: React.FC<IProps> = ({mobOpened, lang, theme, setState}): JSX.Element => {

	const _themeSwitcherCont = useRef<HTMLDivElement>(null);
	const _contentSwitcher = useRef<HTMLDivElement>(null);
	const _switcher = useRef<HTMLInputElement>(null);
	const themeRef = useRef<TTheme>('dark');
	const {add: addToHider, clear: clearHider} = useScrollHider()

	const state = useRef({
		isChanging: false,
	}) 

	const params: IParams = useMemo(() => (
		{
			width: 70,
			height: 40,
			circleSize: 14,
			duration: 2000,
			numberOfStars: 30,
			saveState: "theme",
			typesOfBlink: 6,
			isChanging: false,
			clouds: [ //default styles for clouds
				{
					width: 30, //px
					gap: 15, //px
					top: 0, //in percent of height
					speed: 7, //sec for 1 cycle, less -> faster
					opacity: 1, //transparent for line
				},
				{
					width: 25,
					gap: 20,
					top: 25,
					speed: 4,
					opacity: 0.85,
				},
				{
					width: 20,
					gap: 20,
					top: 40,
					speed: 5,
					opacity: 0.7,
				},
			]
		}
	), [])



	useEffect(() => {
		themeRef.current = localStorage.getItem(params.saveState) === "light" ? "light" : "dark"
		applyTheme()
		if (!_themeSwitcherCont.current) return
		addToHider(_themeSwitcherCont.current, 50)
		return () => clearHider()
	},[])




	const classSwitcher = (classRemove: string, classAdd: string, delay: number): Promise<void> => { //class +/- for _contentSwitcher using delay
		return new Promise((res) => {
			setTimeout((): void => {
				classRemove && _contentSwitcher.current?.classList.remove(classRemove);
				classAdd && _contentSwitcher.current?.classList.add(classAdd);
				res();
			}, delay);
		});
	};

	
	
	const applyTheme = () => { //main switcher
		if (state.current.isChanging) return
		document.body.classList.toggle("dark", themeRef.current === "dark")
		params.saveState && localStorage.setItem(params.saveState, themeRef.current as TTheme);
		state.current.isChanging = true;
		if (themeRef.current === "light") {
			classSwitcher("", "theme_light_1", 0)
			.then(() => classSwitcher("theme_light_1", "theme_light_2", (params.duration || 1)/ 4))
			.then(() => {classSwitcher("theme_light_2", "theme_light", 30); state.current.isChanging = false; });
		} 
		if (themeRef.current === 'dark') {
			classSwitcher("theme_light", "theme_light_back_1", 0)
			.then(() => classSwitcher("theme_light_back_1", "theme_light_back_2", (params.duration || 1) / 4))
			.then(() => {classSwitcher("theme_light_back_2", "", 30); state.current.isChanging = false; });
		} 
	};

	
	const onThemeClick = () => {
		themeRef.current = themeRef.current  === 'dark' ? 'light' : 'dark'
		setState.base.setTheme(themeRef.current)
		applyTheme()
	};
 

	const stars = useMemo(() => {
		return new Array(params.numberOfStars).fill('').map((item,index)=> {
			let size = Math.floor(Math.random()*20 + 1);
			size = size > 13 ? Math.floor(size / 3) : size; //to create more small stars than big
			const x = Math.floor(Math.random() * (params.width as number))
			const y = Math.floor(Math.random() * (params.height as number))
			const typeOfBlink = Math.floor(Math.random() * (params.typesOfBlink as number))//different duration of blinking
			return (
				<img 
					className={`theme_dark__star-${typeOfBlink}`} 
					key={index}
					alt="" 
					src={star}
					style={{
						left: `${x}px`, 
						top: `${y}px`, 
						width: `${size}px`, 
					}}/>
			)
		})
	}, [])
	



	const clouds = useMemo(() => {
		const listOfClouds: string[] = new Array(Math.ceil((params.width) / (params.clouds[params.clouds.length - 1].width + params.clouds[params.clouds.length - 1].gap) + 2)).fill(""); //list of clouds in a cloud-raw, depends on the cloud size and gap between clouds + some reserve
		return params.clouds?.map((line, index: number) => (
			<div className={`clouds-${index}`} key={index}>
				{listOfClouds.map((item,index) => <img className="cloud" src={cloud} alt="" key={index}/>)}
			</div>
		))
	}, [])
	



	const themeSwitcherMemo = useMemo(() => {
		return (
			<label htmlFor="theme-switcher">
				<div className="theme-switcher">
					<div className={`content-switcher ${theme !== "dark" ? "theme_light" : ""}`} ref={_contentSwitcher}>
						<div className="dark">{stars}</div>
						<div className="light">{clouds}</div>
					</div>
				</div>
				<input type="checkbox" name="theme-switcher" id="theme-switcher" aria-label="Change the site theme" onChange={onThemeClick} ref={_switcher}/>
			</label>
		)
	}, [])



	return (
		<div className={`theme-switcher__container`} data-testid='theme-switcher' ref={_themeSwitcherCont} tabIndex={0} onKeyDown={e => {e.code === 'Enter' && onThemeClick()}}>
			{themeSwitcherMemo}
		</div>
	);
};


const mapStateToProps = (state: IFullState): IPropsState => ({
	mobOpened: state.base.mobOpened,
	lang: state.base.lang,
	theme: state.base.theme
})
  
  
const mapDispatchToProps = (dispatch: Dispatch<AnyAction>): IPropsActions => ({
    setState: {
		base: bindActionCreators(allActions.base, dispatch),
	}
})
  
  
export default connect(mapStateToProps, mapDispatchToProps)(ThemeSwitcher)

