import { emptyImages, resetFetch } from "../../assets/js/consts"
import { IContentState } from "../../interfaces"

const initialContentState = {
    send: resetFetch,
    load: resetFetch,
    carousel: {
        images: {...emptyImages}
    }
} satisfies IContentState

export default initialContentState