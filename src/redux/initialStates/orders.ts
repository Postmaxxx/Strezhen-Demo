import { resetFetch } from "../../assets/js/consts"
import { IOrdersState } from "../../interfaces"

const initialOrders = {
    load: {...resetFetch},
    send: {...resetFetch},
    users: [],
    userList: {
        load: {...resetFetch},
        list: []
    }
} satisfies IOrdersState

export default initialOrders