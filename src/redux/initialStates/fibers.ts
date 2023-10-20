import { resetFetch } from "../../assets/js/consts"
import { IFibersState } from "../../interfaces"

const initialFibers = {
    load: resetFetch,
    send: resetFetch,
    fibersList: [],
    selected: '',
    showList: []
} satisfies IFibersState

export default initialFibers