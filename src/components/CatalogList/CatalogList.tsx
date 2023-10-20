import "./catalog-list.scss";
import { ICatalog, ICatalogItem, IFullState, TId, TLang } from "../../interfaces";
import { AnyAction, bindActionCreators } from "redux";
import { Dispatch } from "redux";
import { connect } from "react-redux";
import { useEffect } from "react";
import { allActions } from "../../redux/actions/all";
import Preloader from "../Preloaders/Preloader";
import ErrorFetch from "../ErrorFetch/ErrorFetch";


interface IPropsState {
    catalog: ICatalog
	lang: TLang
	selectedCategory: TId
	isAdmin: boolean
}

interface IPropsActions {
    setState: {
        catalog: typeof allActions.catalog
    }
}
interface IProps extends IPropsState, IPropsActions {}




const CatalogList: React.FC<IProps> = ({catalog, lang, selectedCategory, isAdmin, setState}): JSX.Element => {

	useEffect(() => {
		if (catalog.load.status === 'success') {
			const firstNonEmptyCategory = catalog.list.findIndex(item => item.active > 0)		
			firstNonEmptyCategory > -1 && setState.catalog.loadCategory({_id: catalog.list[firstNonEmptyCategory]._id}) //load all products for first non-empty category
		}
	}, [catalog.load.status])
	



    useEffect(() => {
		if (catalog.load.status !== 'success' && catalog.load.status  !== 'fetching') {
			setState.catalog.loadCatalog()
		}
	},[])


    useEffect(() => {
		setState.catalog.loadCatalog()
	},[isAdmin])

	

	return(
		<div className="catalog-list">
			<div className="list">
				{catalog.load.status === 'success' &&
					<ul className="list__content">
						{catalog.list.filter(category => category.active)?.map((category: ICatalogItem): JSX.Element => {
							return (
								<li 
									tabIndex={0}
									key={category._id} 
									className={category._id === selectedCategory ? "selected" : ""}
									onClick={() => setState.catalog.loadCategory({_id: category._id})}
									onKeyDown={(e) => {e.code === 'Enter' && setState.catalog.loadCategory({_id: category._id})}}
								>
									{category.name[lang]} ({category.active || 0})
								</li>
							);
						})}
					</ul>}
				{catalog.load.status === 'fetching' && <Preloader />}
				{catalog.load.status === 'error' && <ErrorFetch fetchData={catalog.load} lang={lang} />}
			</div>
		</div>
	);
};




const mapStateToProps = (state: IFullState): IPropsState => ({
    lang: state.base.lang,
	catalog: state.catalog.catalog,
	selectedCategory: state.catalog.category._id,
	isAdmin: state.user.isAdmin,
})


const mapDispatchToProps = (dispatch: Dispatch<AnyAction>):IPropsActions => ({
    setState: {
		catalog: bindActionCreators(allActions.catalog, dispatch),
	}
})
export default connect(mapStateToProps, mapDispatchToProps)(CatalogList);