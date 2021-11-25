

## Application


## Code specific

[ ] Rename SpecialisedObjects, remove generic patterns / objects
[ ] Make a component to support editing labels of multiple components (i.e. differentiate between labels applied to all vs only applied to some of the components)
[ ] standardise names of all functions used as store state selectors.  e.g. some are `get_current_composed_knowledge_view_from_state` and others are `selector_chosen_base`

## Equivocation of "base"

3 seperate uses:

1. Base interface that KnowledgeViews and WComponents and others inherit from
2. (Knowledge) Bases that the user creates.  These contain a set of knowledge views and wcomponents
3. The is_base knowledge view that is created by default (and by default but not necessarily) contains all the user's wcomponents

Really need to think of different names for these things!
