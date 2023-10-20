import { resetFetch } from "../../assets/js/consts"
import { IColorsState } from "../../interfaces"
const initialColors = {
    load: resetFetch,
    send: resetFetch,
    colors: []
} satisfies IColorsState

export default initialColors