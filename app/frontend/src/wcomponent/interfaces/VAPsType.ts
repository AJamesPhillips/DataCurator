

// VAPsType and WComponentStateV2SubType are two different types because
// `WComponentNodeAction` has VAP sets and thus we need VAPsType.action but as it
// is not WComponentNodeStateV2 we don't need a WComponentNodeStateV2.subtype
// of "actions".  Also see the function `get_wcomponent_VAPs_represent` for an
// example of the relationship between VAPsType and WComponentStateV2SubType.
export enum VAPsType {
    boolean,
    number,
    other,
    action,
    undefined,
}
