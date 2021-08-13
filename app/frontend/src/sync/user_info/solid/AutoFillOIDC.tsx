import { FunctionalComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"

import type { RootState } from "../../../state/State"
import { ACTIONS } from "../../../state/actions"



type OIDC_ProviderRoot = "solidcommunity.net" | "inrupt.com"
const OIDC_provider_map: {[P in OIDC_ProviderRoot]: string} = {
    "solidcommunity.net": "https://solidcommunity.net",
    "inrupt.com": "https://broker.pod.inrupt.com",
}



interface OwnProps
{
    solid_oidc_provider_root: OIDC_ProviderRoot
}


const map_state = (state: RootState) =>
{
    return {
        current_solid_oidc_provider: state.user_info.solid_oidc_provider,
    }
}

const map_dispatch = {
    update_solid_oidc_provider: ACTIONS.user_info.update_solid_oidc_provider,
}


const connector = connect(map_state, map_dispatch)
type Props = ConnectedProps<typeof connector> & OwnProps



function _AutoFillOIDC (props: Props)
{
    const solid_oidc_provider = OIDC_provider_map[props.solid_oidc_provider_root]

    return <button
        disabled={solid_oidc_provider === props.current_solid_oidc_provider}

        onClick={e =>
        {
            e.stopImmediatePropagation()
            props.update_solid_oidc_provider({ solid_oidc_provider })
        }}
    >
        {props.solid_oidc_provider_root}
    </button>
}

export const AutoFillOIDC = connector(_AutoFillOIDC) as FunctionalComponent<OwnProps>
