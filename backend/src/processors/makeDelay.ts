
const makeDelay = async (time: number) => {
    await new Promise<void>(res => {setTimeout(() => res(), time)})
}


export {makeDelay}