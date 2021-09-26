


export function update_state <
    RootState,
    P1 extends keyof RootState,
    S1 extends RootState[P1],
> (root_state: RootState, path1: P1, replacement_state: S1)
{
    const current = root_state[path1]
    if (current === replacement_state) return root_state

    return {
        ...root_state,
        [path1]: replacement_state
    }
}



export function update_substate <
    RootState,
    P1 extends keyof RootState,
    P2 extends keyof RootState[P1],
    S2 extends RootState[P1][P2],
> (root_state: RootState, path1: P1, path2: P2, replacement_substate: S2)
{
    const replacement_state = update_state(root_state[path1], path2, replacement_substate)
    return update_state(root_state, path1, replacement_state)
}



export function update_subsubstate <
    RootState,
    P1 extends keyof RootState,
    P2 extends keyof RootState[P1],
    P3 extends keyof RootState[P1][P2],
    S3 extends RootState[P1][P2][P3],
> (root_state: RootState, path1: P1, path2: P2, path3: P3, replacement_subsubstate: S3)
{
    const replacement_substate = update_state(root_state[path1][path2], path3, replacement_subsubstate)
    const replacement_state = update_state(root_state[path1], path2, replacement_substate)
    return update_state(root_state, path1, replacement_state)
}



export function update_subsubsubstate <
    RootState,
    P1 extends keyof RootState,
    P2 extends keyof RootState[P1],
    P3 extends keyof RootState[P1][P2],
    P4 extends keyof RootState[P1][P2][P3],
    S4 extends RootState[P1][P2][P3][P4],
> (root_state: RootState, path1: P1, path2: P2, path3: P3, path4: P4, replacement_subsubsubstate: S4)
{
    const replacement_subsubstate = update_state(root_state[path1][path2][path3], path4, replacement_subsubsubstate)
    const replacement_substate = update_state(root_state[path1][path2], path3, replacement_subsubstate)
    const replacement_state = update_state(root_state[path1], path2, replacement_substate)
    return update_state(root_state, path1, replacement_state)
}
